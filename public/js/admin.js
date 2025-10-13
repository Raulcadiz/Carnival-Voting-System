// ============================================
// ADMIN APP - Panel de Administración
// ============================================

const AdminAPI = {
  token: localStorage.getItem('admin_token'),

  setToken(token) {
    this.token = token;
    localStorage.setItem('admin_token', token);
  },

  clearToken() {
    this.token = null;
    localStorage.removeItem('admin_token');
  },

  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`/api/admin${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.token}`,
          ...options.headers
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la solicitud');
      }

      return data;
    } catch (error) {
      console.error('Admin API Error:', error);
      throw error;
    }
  },

  async login(username, password) {
    const response = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Error en login');
    }

    return data;
  },

  async getStats() {
    return this.request('/stats');
  },

  async getConfig() {
    return this.request('/config');
  },

  async updateConfig(apis) {
    return this.request('/config', {
      method: 'PUT',
      body: JSON.stringify({ apis })
    });
  },

  async updateVideo(id, data) {
    return this.request(`/videos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  },

  async deleteVideo(id) {
    return this.request(`/videos/${id}`, {
      method: 'DELETE'
    });
  },

  async bulkDeleteVideos(videoIds) {
    return this.request('/videos/bulk-delete', {
      method: 'POST',
      body: JSON.stringify({ videoIds })
    });
  },

  async clearVotes(videoId) {
    return this.request(`/clear-votes/${videoId}`, {
      method: 'POST'
    });
  },

  async getLogs() {
    return this.request('/logs');
  }
};

const AdminApp = {
  currentView: 'overview',
  selectedVideos: new Set(),
  isInitialized: false,

  async init() {
    if (this.isInitialized) {
      return;
    }

    const token = localStorage.getItem('admin_token');

    if (token) {
      AdminAPI.setToken(token);
      try {
        await AdminAPI.getStats();
        this.showDashboard();
        await this.loadOverview();
      } catch (error) {
        AdminAPI.clearToken();
        this.showLogin();
      }
    } else {
      this.showLogin();
    }

    this.isInitialized = true;
  },

  showLogin() {
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginScreen) loginScreen.style.display = 'flex';
    if (dashboard) dashboard.style.display = 'none';
    
    this.setupLoginForm();
  },

  showDashboard() {
    const loginScreen = document.getElementById('login-screen');
    const dashboard = document.getElementById('admin-dashboard');
    
    if (loginScreen) loginScreen.style.display = 'none';
    if (dashboard) dashboard.style.display = 'block';
    
    if (!this._navSetup) {
      this.setupNavigation();
      this._navSetup = true;
    }
  },

  setupLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;

    const newForm = form.cloneNode(true);
    form.parentNode.replaceChild(newForm, form);

    newForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });
  },

  async handleLogin() {
    const username = document.getElementById('username')?.value;
    const password = document.getElementById('password')?.value;
    const errorDiv = document.getElementById('login-error');
    const btn = document.querySelector('.btn-login');
    const btnText = btn?.querySelector('.btn-text');
    const btnLoader = btn?.querySelector('.btn-loader');

    if (!username || !password) {
      if (errorDiv) {
        errorDiv.textContent = 'Usuario y contraseña requeridos';
        errorDiv.style.display = 'block';
      }
      return;
    }

    try {
      if (btn) btn.disabled = true;
      if (btnText) btnText.style.display = 'none';
      if (btnLoader) btnLoader.style.display = 'inline';
      if (errorDiv) errorDiv.style.display = 'none';

      const response = await AdminAPI.login(username, password);
      AdminAPI.setToken(response.token);
      
      const usernameElement = document.getElementById('admin-username');
      if (usernameElement) usernameElement.textContent = response.username;

      this.showDashboard();
      await this.loadOverview();

    } catch (error) {
      if (errorDiv) {
        errorDiv.textContent = error.message;
        errorDiv.style.display = 'block';
      }
    } finally {
      if (btn) btn.disabled = false;
      if (btnText) btnText.style.display = 'inline';
      if (btnLoader) btnLoader.style.display = 'none';
    }
  },

  logout() {
    if (confirm('¿Seguro que deseas cerrar sesión?')) {
      AdminAPI.clearToken();
      this.isInitialized = false;
      this._navSetup = false;
      location.reload();
    }
  },

  setupNavigation() {
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      const newBtn = btn.cloneNode(true);
      btn.parentNode.replaceChild(newBtn, btn);
      
      newBtn.addEventListener('click', (e) => {
        e.preventDefault();
        const view = e.currentTarget.dataset.view;
        if (view) this.switchView(view);
      });
    });
  },

  switchView(viewName) {
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.view === viewName) btn.classList.add('active');
    });

    document.querySelectorAll('.admin-view').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(`admin-view-${viewName}`);
    if (targetView) {
      targetView.classList.add('active');
      this.currentView = viewName;
    }

    this.loadViewData(viewName);
  },

  async loadViewData(viewName) {
    try {
      switch(viewName) {
        case 'overview': await this.loadOverview(); break;
        case 'videos': await this.loadVideos(); break;
        case 'config': await this.loadConfig(); break;
        case 'logs': await this.loadLogs(); break;
      }
    } catch (error) {
      console.error(`Error loading ${viewName}:`, error);
    }
  },

  async loadOverview() {
    try {
      const response = await AdminAPI.getStats();
      const stats = response.stats;

      const videosStat = document.getElementById('admin-stat-videos');
      const votesStat = document.getElementById('admin-stat-votes');
      const votersStat = document.getElementById('admin-stat-voters');

      if (videosStat) videosStat.textContent = stats.videos.count;
      if (votesStat) votesStat.textContent = stats.votes.count;
      if (votersStat) votersStat.textContent = stats.uniqueVoters.count;

      if (stats.byPlatform) this.createPlatformChart(stats.byPlatform);
      if (stats.votesByHour) this.createHoursChart(stats.votesByHour);
      if (stats.topVoters) this.renderTopVoters(stats.topVoters);

    } catch (error) {
      console.error('Error loading overview:', error);
    }
  },

  createPlatformChart(data) {
    const ctx = document.getElementById('admin-chart-platform');
    if (!ctx || typeof Chart === 'undefined') return;

    if (window.adminPlatformChart) window.adminPlatformChart.destroy();

    window.adminPlatformChart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.map(d => d.platform === 'tiktok' ? '🎵 TikTok' : '▶️ YouTube'),
        datasets: [{
          data: data.map(d => d.count),
          backgroundColor: ['rgba(139, 0, 139, 0.8)', 'rgba(255, 105, 180, 0.8)'],
          borderColor: ['rgba(139, 0, 139, 1)', 'rgba(255, 105, 180, 1)'],
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        plugins: { legend: { labels: { color: '#f5f5f5' } } }
      }
    });
  },

  createHoursChart(data) {
    const ctx = document.getElementById('admin-chart-hours');
    if (!ctx || typeof Chart === 'undefined') return;

    if (window.adminHoursChart) window.adminHoursChart.destroy();

    window.adminHoursChart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: data.map(d => `${d.hour}:00`),
        datasets: [{
          label: 'Votos',
          data: data.map(d => d.count),
          backgroundColor: 'rgba(218, 165, 32, 0.8)',
          borderColor: 'rgba(218, 165, 32, 1)',
          borderWidth: 2
        }]
      },
      options: {
        responsive: true,
        scales: {
          y: { beginAtZero: true, ticks: { color: '#f5f5f5' }, grid: { color: 'rgba(255,255,255,0.1)' } },
          x: { ticks: { color: '#f5f5f5' }, grid: { display: false } }
        },
        plugins: { legend: { display: false } }
      }
    });
  },

  renderTopVoters(voters) {
    const container = document.getElementById('admin-top-voters');
    if (!container) return;

    if (!voters || voters.length === 0) {
      container.innerHTML = '<p style="text-align:center;padding:2rem;">No hay datos</p>';
      return;
    }

    container.innerHTML = `
      <table class="admin-table">
        <thead><tr><th>Ranking</th><th>IP</th><th>Votos</th></tr></thead>
        <tbody>
          ${voters.map((v, i) => `
            <tr>
              <td>${i + 1}</td>
              <td><code>${v.user_ip.substring(0, 15)}...</code></td>
              <td><strong>${v.vote_count}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  },

  async loadVideos() {
    try {
      if (typeof API === 'undefined') return;
      const response = await API.videos.getAll({ limit: 1000 });
      this.renderVideosTable(response.videos);
    } catch (error) {
      console.error('Error loading videos:', error);
    }
  },

  renderVideosTable(videos) {
    const tbody = document.getElementById('admin-videos-tbody');
    if (!tbody) return;
    
    if (videos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="table-loading">No hay videos</td></tr>';
      return;
    }

    const escape = (t) => String(t).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

    tbody.innerHTML = videos.map(video => `
      <tr>
        <td><input type="checkbox" class="video-checkbox" data-id="${video.id}"></td>
        <td>${video.id}</td>
        <td>${video.platform === 'tiktok' ? '🎵' : '▶️'}</td>
        <td>${escape(video.title || 'Sin título').substring(0, 50)}...</td>
        <td>@${escape(video.username || 'unknown')}</td>
        <td>${video.vote_count || 0}</td>
        <td>${new Date(video.created_at).toLocaleDateString('es-ES')}</td>
        <td>
          <button class="btn-primary btn-sm" onclick="AdminApp.editVideo(${video.id})">✏️</button>
          <button class="btn-danger btn-sm" onclick="AdminApp.deleteVideoConfirm(${video.id})">🗑️</button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.video-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.id);
        e.target.checked ? this.selectedVideos.add(id) : this.selectedVideos.delete(id);
      });
    });
  },

  async editVideo(id) {
    try {
      if (typeof API === 'undefined') return;
      const response = await API.videos.getById(id);
      const video = response.video;

      document.getElementById('edit-video-id').value = video.id;
      document.getElementById('edit-title').value = video.title || '';
      document.getElementById('edit-username').value = video.username || '';
      document.getElementById('edit-description').value = video.description || '';

      document.getElementById('edit-modal').classList.add('active');

      const form = document.getElementById('edit-video-form');
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
      
      newForm.onsubmit = async (e) => {
        e.preventDefault();
        await this.saveVideoEdit();
      };

    } catch (error) {
      alert('Error cargando video');
    }
  },

  closeEditModal() {
    document.getElementById('edit-modal')?.classList.remove('active');
  },

  async saveVideoEdit() {
    try {
      const id = document.getElementById('edit-video-id').value;
      const title = document.getElementById('edit-title').value;
      const username = document.getElementById('edit-username').value;
      const description = document.getElementById('edit-description').value;

      await AdminAPI.updateVideo(id, { title, username, description });
      alert('Video actualizado');
      this.closeEditModal();
      await this.loadVideos();
    } catch (error) {
      alert(error.message);
    }
  },

  async deleteVideoConfirm(id) {
    if (!confirm('¿Eliminar este video?')) return;
    try {
      await AdminAPI.deleteVideo(id);
      alert('Video eliminado');
      await this.loadVideos();
    } catch (error) {
      alert(error.message);
    }
  },

  async bulkDeleteConfirm() {
    if (this.selectedVideos.size === 0) {
      alert('No has seleccionado videos');
      return;
    }
    if (!confirm(`¿Eliminar ${this.selectedVideos.size} videos?`)) return;
    try {
      await AdminAPI.bulkDeleteVideos(Array.from(this.selectedVideos));
      alert('Videos eliminados');
      this.selectedVideos.clear();
      await this.loadVideos();
    } catch (error) {
      alert(error.message);
    }
  },

  async loadConfig() {
    try {
      const response = await AdminAPI.getConfig();
      const config = response.config;

      document.getElementById('tiktok1-key').value = config.apis.tiktok1.key || '';
      document.getElementById('tiktok1-host').value = config.apis.tiktok1.host || '';
      document.getElementById('tiktok2-key').value = config.apis.tiktok2.key || '';
      document.getElementById('tiktok2-host').value = config.apis.tiktok2.host || '';
      document.getElementById('youtube-key').value = config.apis.youtube.key || '';

      this.updateApiStatus('tiktok1', config.apis.tiktok1.configured);
      this.updateApiStatus('tiktok2', config.apis.tiktok2.configured);
      this.updateApiStatus('youtube', config.apis.youtube.configured);

      document.getElementById('config-port').textContent = config.server.port;
      document.getElementById('config-env').textContent = config.server.nodeEnv;
      document.getElementById('config-rate-limit').textContent = 
        `${config.security.rateLimitMax} / ${config.security.rateLimitWindow / 60000} min`;

      const form = document.getElementById('api-config-form');
      const newForm = form.cloneNode(true);
      form.parentNode.replaceChild(newForm, form);
      
      newForm.onsubmit = async (e) => {
        e.preventDefault();
        await this.saveApiConfig();
      };

    } catch (error) {
      console.error('Error loading config:', error);
    }
  },

  updateApiStatus(apiName, isConfigured) {
    const el = document.getElementById(`${apiName}-status`);
    if (!el) return;

    const dot = el.querySelector('.status-dot');
    const text = el.querySelector('.status-text');

    if (isConfigured) {
      dot?.classList.add('active');
      if (text) text.textContent = '✅ Configurada';
    } else {
      dot?.classList.remove('active');
      if (text) text.textContent = '❌ No configurada';
    }
  },

  async saveApiConfig() {
    const btn = document.querySelector('#api-config-form button[type="submit"]');
    const orig = btn?.textContent;

    try {
      if (btn) {
        btn.disabled = true;
        btn.textContent = '💾 Guardando...';
      }

      const apis = {
        tiktok1: {
          key: document.getElementById('tiktok1-key').value.trim(),
          host: document.getElementById('tiktok1-host').value.trim()
        },
        tiktok2: {
          key: document.getElementById('tiktok2-key').value.trim(),
          host: document.getElementById('tiktok2-host').value.trim()
        },
        youtube: {
          key: document.getElementById('youtube-key').value.trim()
        }
      };

      if (!apis.tiktok1.key && !apis.tiktok2.key && !apis.youtube.key) {
        alert('Configura al menos una API');
        return;
      }

      await AdminAPI.updateConfig(apis);
      alert('✅ Configuración guardada');

      this.updateApiStatus('tiktok1', !!apis.tiktok1.key);
      this.updateApiStatus('tiktok2', !!apis.tiktok2.key);
      this.updateApiStatus('youtube', !!apis.youtube.key);

    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      if (btn) {
        btn.disabled = false;
        btn.textContent = orig;
      }
    }
  },

  async loadLogs() {
    try {
      const response = await AdminAPI.getLogs();
      const logs = response.logs;

      const container = document.getElementById('admin-logs-container');
      if (!container) return;
      
      if (logs.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:2rem;">No hay logs</p>';
        return;
      }

      const escape = (t) => String(t).replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

      container.innerHTML = logs.map(log => `
        <div class="log-item">
          <div class="log-time">${new Date(log.timestamp).toLocaleString('es-ES')}</div>
          <div class="log-content">
            <div class="log-type">${log.event_type === 'VOTE_CAST' ? '❤️ Voto' : '🎬 Video'}</div>
            <div class="log-description">${escape(log.description)}</div>
          </div>
        </div>
      `).join('');

    } catch (error) {
      console.error('Error loading logs:', error);
    }
  },

  confirmAction(action, message) {
    if (!confirm(`⚠️ ${message}`)) return;
    alert('Función próximamente');
  }
};

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => AdminApp.init());
} else {
  AdminApp.init();
}

window.AdminApp = AdminApp;
window.AdminAPI = AdminAPI;
