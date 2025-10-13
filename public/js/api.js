// ============================================
// API MODULE - Comunicación con el backend
// ============================================

const API = {
  baseURL: '/api',

  // Helper para hacer requests
  async request(endpoint, options = {}) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Error en la solicitud');
      }

      return data;
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  },

  // ==================== VIDEOS ====================
  videos: {
    // Obtener todos los videos
    getAll(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      return API.request(`/videos${queryString ? '?' + queryString : ''}`);
    },

    // Obtener un video por ID
    getById(id) {
      return API.request(`/videos/${id}`);
    },

    // Agregar nuevo video
    add(url) {
      return API.request('/videos', {
        method: 'POST',
        body: JSON.stringify({ url })
      });
    },

    // Eliminar video
    delete(id) {
      return API.request(`/videos/${id}`, {
        method: 'DELETE'
      });
    },

    // Buscar videos
    search(query) {
      return API.request(`/videos/search/${encodeURIComponent(query)}`);
    }
  },

  // ==================== VOTES ====================
  votes: {
    // Votar por un video
    vote(videoId) {
      return API.request('/votes', {
        method: 'POST',
        body: JSON.stringify({ videoId })
      });
    },

    // Verificar si ya votó
    checkVote(videoId) {
      return API.request(`/votes/check/${videoId}`);
    },

    // Obtener votos de un video
    getByVideo(videoId) {
      return API.request(`/votes/video/${videoId}`);
    },

    // Eliminar voto (para testing)
    remove(videoId) {
      return API.request(`/votes/${videoId}`, {
        method: 'DELETE'
      });
    }
  },

  // ==================== STATS ====================
  stats: {
    // Estadísticas generales
    getGeneral() {
      return API.request('/stats');
    },

    // Ranking
    getRanking(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      return API.request(`/stats/ranking${queryString ? '?' + queryString : ''}`);
    },

    // Timeline de votos
    getTimeline(videoId) {
      return API.request(`/stats/timeline/${videoId}`);
    },

    // Comparar videos
    compare(video1, video2) {
      return API.request(`/stats/comparison?video1=${video1}&video2=${video2}`);
    },

    // Videos en tendencia
    getTrending(params = {}) {
      const queryString = new URLSearchParams(params).toString();
      return API.request(`/stats/trending${queryString ? '?' + queryString : ''}`);
    },

    // Video aleatorio
    getRandom(platform) {
      return API.request(`/stats/random${platform ? '?platform=' + platform : ''}`);
    }
  },

  // ==================== HEALTH ====================
  health() {
    return API.request('/health');
  }
};

// Exportar para uso global
window.API = API;
