// ============================================
// COMPONENTS MODULE - Sistema de componentes
// ============================================

const Components = {
  // ==================== VIDEO CARD ====================
  VideoCard: class {
    constructor(video) {
      this.video = video;
      this.hasVoted = false;
    }

    async checkVoteStatus() {
      try {
        const result = await API.votes.checkVote(this.video.id);
        this.hasVoted = result.hasVoted;
      } catch (error) {
        console.error('Error checking vote:', error);
      }
    }

    async handleVote() {
      if (this.hasVoted) {
        Utils.showToast('Ya votaste por este video', 'warning');
        return;
      }

      try {
        const btn = this.element.querySelector('.vote-btn');
        const countEl = this.element.querySelector('.vote-count');
        
        btn.disabled = true;
        btn.textContent = '⏳ Votando...';

        const result = await API.votes.vote(this.video.id);
        
        this.hasVoted = true;
        btn.textContent = '✅ Votado';
        btn.classList.add('voted');
        countEl.textContent = `❤️ ${result.voteCount}`;
        
        Utils.showToast('¡Voto registrado exitosamente!', 'success');
        
        // Animación
        btn.style.animation = 'pulse 0.5s';
        setTimeout(() => btn.style.animation = '', 500);

      } catch (error) {
        Utils.showToast(error.message || 'Error al votar', 'error');
        const btn = this.element.querySelector('.vote-btn');
        btn.disabled = false;
        btn.textContent = '❤️ Votar';
      }
    }

    getEmbedUrl() {
      const { platform, video_id } = this.video;
      
      if (platform === 'tiktok') {
        return `https://www.tiktok.com/embed/v2/${video_id}`;
      } else if (platform === 'youtube') {
        return `https://www.youtube.com/embed/${video_id}`;
      }
      return '';
    }

    render() {
      const div = document.createElement('div');
      div.className = 'video-card';
      
      const platformEmoji = this.video.platform === 'tiktok' ? '🎵' : '▶️';
      const embedUrl = this.getEmbedUrl();
      
      div.innerHTML = `
        <span class="video-platform">${platformEmoji} ${this.video.platform}</span>
        
        <div class="video-thumbnail">
          ${embedUrl ? `<iframe src="${embedUrl}" allowfullscreen></iframe>` : 
            (this.video.thumbnail_url ? 
              `<img src="${this.video.thumbnail_url}" alt="${this.video.title}">` : 
              '<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;">🎬</div>'
            )
          }
        </div>
        
        <div class="video-info">
          <h3 class="video-title">${Utils.escapeHtml(this.video.title || 'Sin título')}</h3>
          <p class="video-username">@${Utils.escapeHtml(this.video.username || 'unknown')}</p>
        </div>
        
        <div class="video-stats">
          <span>👁️ ${Utils.formatNumber(this.video.view_count || 0)} vistas</span>
          <span>⏱️ ${Utils.formatDuration(this.video.duration || 0)}</span>
        </div>
        
        <div class="vote-section">
          <button class="vote-btn ${this.hasVoted ? 'voted' : ''}" ${this.hasVoted ? 'disabled' : ''}>
            ${this.hasVoted ? '✅ Votado' : '❤️ Votar'}
          </button>
          <div class="vote-count">❤️ ${this.video.vote_count || 0}</div>
        </div>
      `;

      // Event listener para el botón de voto
      const voteBtn = div.querySelector('.vote-btn');
      voteBtn.addEventListener('click', () => this.handleVote());

      this.element = div;
      return div;
    }

    async init() {
      await this.checkVoteStatus();
      return this.render();
    }
  },

  // ==================== RANKING ITEM ====================
  RankingItem: class {
    constructor(video, rank) {
      this.video = video;
      this.rank = rank;
    }

    getMedal() {
      if (this.rank === 1) return '🥇';
      if (this.rank === 2) return '🥈';
      if (this.rank === 3) return '🥉';
      return `#${this.rank}`;
    }

    render() {
      const div = document.createElement('div');
      div.className = 'ranking-item';
      
      const platformEmoji = this.video.platform === 'tiktok' ? '🎵' : '▶️';
      
      div.innerHTML = `
        <div class="ranking-medal">${this.getMedal()}</div>
        <div class="ranking-info">
          <h3 class="ranking-title">${Utils.escapeHtml(this.video.title || 'Sin título')}</h3>
          <p class="ranking-username">${platformEmoji} @${Utils.escapeHtml(this.video.username || 'unknown')}</p>
        </div>
        <div class="ranking-votes">❤️ ${this.video.vote_count || 0}</div>
      `;

      return div;
    }
  },

  // ==================== TOAST NOTIFICATION ====================
  Toast: class {
    constructor(message, type = 'info') {
      this.message = message;
      this.type = type;
      this.duration = 3000;
    }

    render() {
      const div = document.createElement('div');
      div.className = `toast ${this.type}`;
      div.textContent = this.message;

      const container = document.getElementById('toast-container');
      container.appendChild(div);

      setTimeout(() => {
        div.style.animation = 'slideIn 0.3s reverse';
        setTimeout(() => div.remove(), 300);
      }, this.duration);

      return div;
    }
  }
};

// ============================================
// UTILS - Funciones auxiliares
// ============================================

const Utils = {
  // Escapar HTML para prevenir XSS
  escapeHtml(text) {
    const map = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  },

  // Formatear números
  formatNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  },

  // Formatear duración
  formatDuration(seconds) {
    if (!seconds) return '0:00';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  },

  // Mostrar toast notification
  showToast(message, type = 'info') {
    const toast = new Components.Toast(message, type);
    toast.render();
  },

  // Debounce para búsqueda
  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
};

// Exportar para uso global
window.Components = Components;
window.Utils = Utils;
