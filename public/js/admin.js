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

  async init() {
    const token = localStorage.getItem('admin_token');

    if (token) {
      AdminAPI.setToken(token);
      try {
        await this.loadDashboard();
      } catch (error) {
        this.showLogin();
      }
    } else {
      this.showLogin();
    }
  },

  showLogin() {
    document.getElementById('login-screen').style.display = 'flex';
    document.getElementById('admin-dashboard').style.display = 'none';
    this.setupLoginForm();
  },

  showDashboard() {
    document.getElementById('login-screen').style.display = 'none';
    document.getElementById('admin-dashboard').style.display = 'block';
    this.setupNavigation();
    this.loadDashboard();
  },

  setupLoginForm() {
    const form = document.getElementById('login-form');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      await this.handleLogin();
    });
  },

  async handleLogin() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('login-error');
    const btn = document.querySelector('.btn-login');
    const btnText = btn.querySelector('.btn-text');
    const btnLoader = btn.querySelector('.btn-loader');

    try {
      btn.disabled = true;
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline';
      errorDiv.style.display = 'none';

      const response = await AdminAPI.login(username, password);
      AdminAPI.setToken(response.token);
      
      document.getElementById('admin-username').textContent = response.username;
      this.showDashboard();

    } catch (error) {
      errorDiv.textContent = error.message;
      errorDiv.style.display = 'block';
    } finally {
      btn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  },

  logout() {
    if (confirm('¿Seguro que deseas cerrar sesión?')) {
      AdminAPI.clearToken();
      this.showLogin();
    }
  },

  setupNavigation() {
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        this.switchView(view);
      });
    });
  },

  switchView(viewName) {
    // Actualizar botones
    document.querySelectorAll('.admin-nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.view === viewName) {
        btn.classList.add('active');
      }
    });

    // Actualizar vistas
    document.querySelectorAll('.admin-view').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(`admin-view-${viewName}`);
    if (targetView) {
      targetView.classList.add('active');
      this.currentView = viewName;
    }

    // Cargar datos según vista
    switch(viewName) {
      case 'overview':
        this.loadOverview();
        break;
      case 'videos':
        this.loadVideos();
        break;
      case 'config':
        this.loadConfig();
        break;
      case 'logs':
        this.loadLogs();
        break;
    }
  },

  async loadDashboard() {
    this.showDashboard();
    await this.loadOverview();
  },

  async loadOverview() {
    try {
      const response = await AdminAPI.getStats();
      const stats = response.stats;

      // Actualizar cards
      document.getElementById('admin-stat-videos').textContent = stats.videos.count;
      document.getElementById('admin-stat-votes').textContent = stats.votes.count;
      document.getElementById('admin-stat-voters').textContent = stats.uniqueVoters.count;

      // Gráfico de plataformas
      this.createPlatformChart(stats.byPlatform);

      // Gráfico de horas
      this.createHoursChart(stats.votesByHour);

      // Top votantes
      this.renderTopVoters(stats.topVoters);

    } catch (error) {
      console.error('Error loading overview:', error);
      Utils.showToast('Error cargando estadísticas', 'error');
    }
  },

  createPlatformChart(data) {
    const ctx = document.getElementById('admin-chart-platform');
    if (!ctx) return;

    if (window.adminPlatformChart) {
      window.adminPlatformChart.destroy();
    }

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
        plugins: {
          legend: {
            labels: { color: '#f5f5f5' }
          }
        }
      }
    });
  },

  createHoursChart(data) {
    const ctx = document.getElementById('admin-chart-hours');
    if (!ctx) return;

    if (window.adminHoursChart) {
      window.adminHoursChart.destroy();
    }

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
        plugins: {
          legend: { display: false }
        }
      }
    });
  },

  renderTopVoters(voters) {
    const container = document.getElementById('admin-top-voters');
    if (!voters || voters.length === 0) {
      container.innerHTML = '<p style="text-align:center;padding:2rem;color:#6c757d;">No hay datos disponibles</p>';
      return;
    }

    const table = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Ranking</th>
            <th>IP</th>
            <th>Votos</th>
          </tr>
        </thead>
        <tbody>
          ${voters.map((voter, index) => `
            <tr>
              <td>${index + 1}</td>
              <td><code>${voter.user_ip.substring(0, 15)}...</code></td>
              <td><strong>${voter.vote_count}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;

    container.innerHTML = table;
  },

  async loadVideos() {
    try {
      const response = await API.videos.getAll({ limit: 1000 });
      this.renderVideosTable(response.videos);

      // Setup select all
      document.getElementById('select-all-videos')?.addEventListener('change', (e) => {
        this.toggleSelectAll(e.target.checked);
      });

    } catch (error) {
      console.error('Error loading videos:', error);
      Utils.showToast('Error cargando videos', 'error');
    }
  },

  renderVideosTable(videos) {
    const tbody = document.getElementById('admin-videos-tbody');
    
    if (videos.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" class="table-loading">No hay videos</td></tr>';
      return;
    }

    tbody.innerHTML = videos.map(video => `
      <tr>
        <td><input type="checkbox" class="video-checkbox" data-id="${video.id}"></td>
        <td>${video.id}</td>
        <td>${video.platform === 'tiktok' ? '🎵 TikTok' : '▶️ YouTube'}</td>
        <td>${Utils.escapeHtml(video.title || 'Sin título').substring(0, 50)}...</td>
        <td>@${Utils.escapeHtml(video.username || 'unknown')}</td>
        <td>${video.vote_count || 0}</td>
        <td>${new Date(video.created_at).toLocaleDateString('es-ES')}</td>
        <td>
          <button class="btn-primary btn-sm" onclick="AdminApp.editVideo(${video.id})">✏️</button>
          <button class="btn-danger btn-sm" onclick="AdminApp.deleteVideoConfirm(${video.id})">🗑️</button>
        </td>
      </tr>
    `).join('');

    // Setup checkboxes
    document.querySelectorAll('.video-checkbox').forEach(cb => {
      cb.addEventListener('change', (e) => {
        const id = parseInt(e.target.dataset.id);
        if (e.target.checked) {
          this.selectedVideos.add(id);
        } else {
          this.selectedVideos.delete(id);
        }
      });
    });
  },

  toggleSelectAll(checked) {
    document.querySelectorAll('.video-checkbox').forEach(cb => {
      cb.checked = checked;
      const id = parseInt(cb.dataset.id);
      if (checked) {
        this.selectedVideos.add(id);
      } else {
        this.selectedVideos.delete(id);
      }
    });
  },

  async editVideo(id) {
    try {
      const response = await API.videos.getById(id);
      const video = response.video;

      document.getElementById('edit-video-id').value = video.id;
      document.getElementById('edit-title').value = video.title || '';
      document.getElementById('edit-username').value = video.username || '';
      document.getElementById('edit-description').value = video.description || '';

      document.getElementById('edit-modal').classList.add('active');

      // Setup form submit
      const form = document.getElementById('edit-video-form');
      form.onsubmit = async (e) => {
        e.preventDefault();
        await this.saveVideoEdit();
      };

    } catch (error) {
      Utils.showToast('Error cargando video', 'error');
    }
  },

  closeEditModal() {
    document.getElementById('edit-modal').classList.remove('active');
  },

  async saveVideoEdit() {
    try {
      const id = document.getElementById('edit-video-id').value;
      const title = document.getElementById('edit-title').value;
      const username = document.getElementById('edit-username').value;
      const description = document.getElementById('edit-description').value;

      await AdminAPI.updateVideo(id, { title, username, description });

      Utils.showToast('Video actualizado exitosamente', 'success');
      this.closeEditModal();
      this.loadVideos();

    } catch (error) {
      Utils.showToast(error.message, 'error');
    }
  },

  async deleteVideoConfirm(id) {
    if (!confirm('¿Seguro que deseas eliminar este video? Esta acción no se puede deshacer.')) {
      return;
    }

    try {
      await AdminAPI.deleteVideo(id);
      Utils.showToast('Video eliminado', 'success');
      this.loadVideos();
    } catch (error) {
      Utils.showToast(error.message, 'error');
    }
  },

  async bulkDeleteConfirm() {
    if (this.selectedVideos.size === 0) {
      Utils.showToast('No has seleccionado ningún video', 'warning');
      return;
    }

    if (!confirm(`¿Eliminar ${this.selectedVideos.size} video(s)? Esta acción no se puede deshacer.`)) {
      return;
    }

    try {
      await AdminAPI.bulkDeleteVideos(Array.from(this.selectedVideos));
      Utils.showToast('Videos eliminados', 'success');
      this.selectedVideos.clear();
      this.loadVideos();
    } catch (error) {
      Utils.showToast(error.message, 'error');
    }
  },

  async loadConfig() {
    try {
      const response = await AdminAPI.getConfig();
      const config = response.config;

      // APIs
      const apiStatus = document.getElementById('admin-api-status');
      apiStatus.innerHTML = `
        <div class="api-status-item">
          <div class="status-icon">${config.apis.tiktok1.configured ? '✅' : '❌'}</div>
          <div class="status-info">
            <h4>TikTok API #1</h4>
            <p>${config.apis.tiktok1.host}</p>
          </div>
        </div>
        <div class="api-status-item">
          <div class="status-icon">${config.apis.tiktok2.configured ? '✅' : '❌'}</div>
          <div class="status-info">
            <h4>TikTok API #2</h4>
            <p>${config.apis.tiktok2.host}</p>
          </div>
        </div>
        <div class="api-status-item">
          <div class="status-icon">${config.apis.youtube.configured ? '✅' : '❌'}</div>
          <div class="status-info">
            <h4>YouTube API</h4>
            <p>${config.apis.youtube.configured ? 'Configurada' : 'No configurada'}</p>
          </div>
        </div>
      `;

      // Servidor
      document.getElementById('config-port').textContent = config.server.port;
      document.getElementById('config-env').textContent = config.server.nodeEnv;
      document.getElementById('config-rate-limit').textContent = 
        `${config.security.rateLimitMax} requests / ${config.security.rateLimitWindow / 60000} minutos`;

    } catch (error) {
      Utils.showToast('Error cargando configuración', 'error');
    }
  },

  async loadLogs() {
    try {
      const response = await AdminAPI.getLogs();
      const logs = response.logs;

      const container = document.getElementById('admin-logs-container');
      
      if (logs.length === 0) {
        container.innerHTML = '<p style="text-align:center;padding:2rem;color:#6c757d;">No hay logs disponibles</p>';
        return;
      }

      container.innerHTML = logs.map(log => {
        const date = new Date(log.timestamp);
        return `
          <div class="log-item ${log.event_type === 'VOTE_CAST' ? 'vote' : 'video'}">
            <div class="log-time">${date.toLocaleString('es-ES')}</div>
            <div class="log-content">
              <div class="log-type">${log.event_type === 'VOTE_CAST' ? '❤️ Voto' : '🎬 Video'}</div>
              <div class="log-description">${Utils.escapeHtml(log.description)}</div>
              <div class="log-details">${Utils.escapeHtml(log.details)}</div>
            </div>
          </div>
        `;
      }).join('');

    } catch (error) {
      Utils.showToast('Error cargando logs', 'error');
    }
  },

  confirmAction(action, message) {
    if (!confirm(`⚠️ ${message}\n\n¿Estás seguro?`)) {
      return;
    }

    switch(action) {
      case 'backup':
        Utils.showToast('Función de backup próximamente', 'info');
        break;
      case 'clear-votes':
        this.clearAllVotes();
        break;
    }
  },

  async clearAllVotes() {
    try {
      // Esta funcionalidad requiere un endpoint adicional
      Utils.showToast('Función próximamente', 'info');
    } catch (error) {
      Utils.showToast(error.message, 'error');
    }
  }
};

// Inicializar app cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  AdminApp.init();
});

window.AdminApp = AdminApp;
