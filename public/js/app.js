// ============================================
// APP - Aplicación principal
// ============================================

const App = {
  currentView: 'videos',
  videosCache: [],
  filters: {
    platform: '',
    sort: 'votes',
    searchTerm: ''
  },

  // ==================== INICIALIZACIÓN ====================
  async init() {
    console.log('🎭 Iniciando Carnival Voting System...');
    
    this.setupEventListeners();
    await this.loadVideos();
    
    console.log('✅ Aplicación lista');
  },

  // ==================== EVENT LISTENERS ====================
  setupEventListeners() {
    // Navegación
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const view = e.target.dataset.view;
        this.switchView(view);
      });
    });

    // Filtros y ordenamiento
    document.getElementById('filter-platform')?.addEventListener('change', (e) => {
      this.filters.platform = e.target.value;
      this.loadVideos();
    });

    document.getElementById('sort-by')?.addEventListener('change', (e) => {
      this.filters.sort = e.target.value;
      this.loadVideos();
    });

    // Búsqueda con debounce
    document.getElementById('search-input')?.addEventListener('input', 
      Utils.debounce((e) => {
        this.filters.searchTerm = e.target.value;
        this.handleSearch();
      }, 500)
    );

    // Formulario de agregar video
    document.getElementById('add-video-form')?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAddVideo();
    });

    // Modal
    document.querySelector('.modal-close')?.addEventListener('click', () => {
      this.closeModal();
    });

    document.getElementById('modal')?.addEventListener('click', (e) => {
      if (e.target.id === 'modal') {
        this.closeModal();
      }
    });
  },

  // ==================== NAVEGACIÓN ====================
  switchView(viewName) {
    // Actualizar botones
    document.querySelectorAll('.nav-btn').forEach(btn => {
      btn.classList.remove('active');
      if (btn.dataset.view === viewName) {
        btn.classList.add('active');
      }
    });

    // Actualizar vistas
    document.querySelectorAll('.view').forEach(view => {
      view.classList.remove('active');
    });

    const targetView = document.getElementById(`view-${viewName}`);
    if (targetView) {
      targetView.classList.add('active');
      this.currentView = viewName;
    }

    // Cargar contenido según vista
    switch(viewName) {
      case 'videos':
        this.loadVideos();
        break;
      case 'ranking':
        this.loadRanking();
        break;
      case 'stats':
        Charts.loadAll();
        break;
      case 'add':
        // No necesita cargar nada
        break;
    }
  },

  // ==================== VIDEOS ====================
  async loadVideos() {
    const container = document.getElementById('videos-grid');
    if (!container) return;

    try {
      container.innerHTML = '<div class="loader">🎭 Cargando videos...</div>';

      const params = {
        sort: this.filters.sort,
        order: 'DESC',
        limit: 50
      };

      if (this.filters.platform) {
        params.platform = this.filters.platform;
      }

      const response = await API.videos.getAll(params);
      this.videosCache = response.videos || [];

      if (this.videosCache.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:3rem; grid-column: 1/-1;">
            <h2 style="font-size:3rem; margin-bottom:1rem;">😔</h2>
            <p style="font-size:1.2rem; color:var(--gray-light);">No hay videos todavía</p>
            <button class="nav-btn" onclick="App.switchView('add')" style="margin-top:1rem;">
              ➕ Agregar el primero
            </button>
          </div>
        `;
        return;
      }

      await this.renderVideos(this.videosCache);

    } catch (error) {
      console.error('Error loading videos:', error);
      container.innerHTML = `
        <div style="text-align:center; padding:3rem; grid-column: 1/-1; color:var(--error);">
          ❌ Error cargando videos: ${error.message}
        </div>
      `;
    }
  },

  async renderVideos(videos) {
    const container = document.getElementById('videos-grid');
    container.innerHTML = '';

    for (const video of videos) {
      const card = new Components.VideoCard(video);
      const element = await card.init();
      container.appendChild(element);
    }
  },

  async handleSearch() {
    const container = document.getElementById('videos-grid');
    
    if (!this.filters.searchTerm || this.filters.searchTerm.length < 2) {
      this.loadVideos();
      return;
    }

    try {
      container.innerHTML = '<div class="loader">🔍 Buscando...</div>';
      
      const response = await API.videos.search(this.filters.searchTerm);
      
      if (response.videos.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:3rem; grid-column: 1/-1;">
            <h2 style="font-size:3rem; margin-bottom:1rem;">🔍</h2>
            <p style="font-size:1.2rem; color:var(--gray-light);">
              No se encontraron resultados para "${Utils.escapeHtml(this.filters.searchTerm)}"
            </p>
          </div>
        `;
        return;
      }

      await this.renderVideos(response.videos);

    } catch (error) {
      console.error('Error searching:', error);
      Utils.showToast('Error en la búsqueda', 'error');
    }
  },

  // ==================== RANKING ====================
  async loadRanking() {
    const container = document.getElementById('ranking-container');
    if (!container) return;

    try {
      container.innerHTML = '<div class="loader">🏆 Cargando ranking...</div>';

      const response = await API.stats.getRanking({ limit: 10 });
      const ranking = response.ranking || [];

      if (ranking.length === 0) {
        container.innerHTML = `
          <div style="text-align:center; padding:3rem;">
            <h2 style="font-size:3rem; margin-bottom:1rem;">🏆</h2>
            <p style="font-size:1.2rem; color:var(--gray-light);">
              Aún no hay ranking disponible
            </p>
          </div>
        `;
        return;
      }

      container.innerHTML = '';
      ranking.forEach((video, index) => {
        const item = new Components.RankingItem(video, index + 1);
        container.appendChild(item.render());
      });

    } catch (error) {
      console.error('Error loading ranking:', error);
      container.innerHTML = `
        <div style="text-align:center; padding:3rem; color:var(--error);">
          ❌ Error cargando ranking
        </div>
      `;
    }
  },

  // ==================== AGREGAR VIDEO ====================
  async handleAddVideo() {
    const form = document.getElementById('add-video-form');
    const urlInput = document.getElementById('video-url');
    const resultDiv = document.getElementById('add-result');
    const submitBtn = form.querySelector('.btn-submit');
    const btnText = submitBtn.querySelector('.btn-text');
    const btnLoader = submitBtn.querySelector('.btn-loader');

    try {
      const url = urlInput.value.trim();

      if (!url) {
        Utils.showToast('Por favor ingresa una URL', 'warning');
        return;
      }

      // Validar que sea TikTok o YouTube
      if (!url.includes('tiktok.com') && 
          !url.includes('youtube.com') && 
          !url.includes('youtu.be')) {
        Utils.showToast('Solo se aceptan URLs de TikTok o YouTube', 'error');
        return;
      }

      // Deshabilitar botón
      submitBtn.disabled = true;
      btnText.style.display = 'none';
      btnLoader.style.display = 'inline';

      // Agregar video
      const response = await API.videos.add(url);

      // Mostrar resultado exitoso
      resultDiv.className = 'add-result success';
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `
        <h3>✅ ¡Video agregado exitosamente!</h3>
        <p><strong>${Utils.escapeHtml(response.video.title)}</strong></p>
        <p>Por @${Utils.escapeHtml(response.video.username)}</p>
      `;

      // Limpiar formulario
      urlInput.value = '';
      
      Utils.showToast('Video agregado exitosamente', 'success');

      // Redirigir a videos después de 2 segundos
      setTimeout(() => {
        this.switchView('videos');
      }, 2000);

    } catch (error) {
      console.error('Error adding video:', error);
      
      resultDiv.className = 'add-result error';
      resultDiv.style.display = 'block';
      resultDiv.innerHTML = `
        <h3>❌ Error al agregar video</h3>
        <p>${error.message}</p>
      `;

      Utils.showToast(error.message || 'Error al agregar video', 'error');
    } finally {
      // Rehabilitar botón
      submitBtn.disabled = false;
      btnText.style.display = 'inline';
      btnLoader.style.display = 'none';
    }
  },

  // ==================== MODAL ====================
  openModal(content) {
    const modal = document.getElementById('modal');
    const body = document.getElementById('modal-body');
    
    body.innerHTML = content;
    modal.classList.add('active');
  },

  closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
  }
};

// ==================== INICIAR APP ====================
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

// Exportar para uso global
window.App = App;
