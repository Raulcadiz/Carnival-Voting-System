// ============================================
// CHARTS MODULE - Visualización de datos
// ============================================

const Charts = {
  instances: {},

  // Configuración de colores tema Carnaval
  colors: {
    gold: 'rgba(218, 165, 32, 0.8)',
    goldBorder: 'rgba(218, 165, 32, 1)',
    purple: 'rgba(139, 0, 139, 0.8)',
    purpleBorder: 'rgba(139, 0, 139, 1)',
    pink: 'rgba(255, 105, 180, 0.8)',
    pinkBorder: 'rgba(255, 105, 180, 1)',
    blue: 'rgba(30, 144, 255, 0.8)',
    blueBorder: 'rgba(30, 144, 255, 1)',
    gradient: (ctx) => {
      const gradient = ctx.createLinearGradient(0, 0, 0, 400);
      gradient.addColorStop(0, 'rgba(218, 165, 32, 0.8)');
      gradient.addColorStop(1, 'rgba(139, 0, 139, 0.8)');
      return gradient;
    }
  },

  // Opciones comunes para todos los gráficos
  commonOptions: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: {
      legend: {
        labels: {
          color: '#f5f5f5',
          font: {
            size: 14,
            family: 'Poppins'
          }
        }
      },
      tooltip: {
        backgroundColor: 'rgba(26, 26, 46, 0.9)',
        titleColor: '#DAA520',
        bodyColor: '#f5f5f5',
        borderColor: '#DAA520',
        borderWidth: 1,
        padding: 12,
        displayColors: true,
        callbacks: {
          label: function(context) {
            let label = context.dataset.label || '';
            if (label) {
              label += ': ';
            }
            label += context.parsed.y || context.parsed;
            return label;
          }
        }
      }
    },
    scales: {
      x: {
        ticks: {
          color: '#f5f5f5',
          font: {
            family: 'Poppins'
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      y: {
        ticks: {
          color: '#f5f5f5',
          font: {
            family: 'Poppins'
          }
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  },

  // Destruir gráfico existente
  destroy(chartId) {
    if (this.instances[chartId]) {
      this.instances[chartId].destroy();
      delete this.instances[chartId];
    }
  },

  // ==================== TOP VIDEOS ====================
  createTopVideos(data) {
    this.destroy('topVideos');

    const ctx = document.getElementById('chart-top-videos');
    if (!ctx) return;

    const videos = data.ranking || [];
    
    this.instances.topVideos = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: videos.map(v => v.username || 'Unknown'),
        datasets: [{
          label: 'Votos',
          data: videos.map(v => v.vote_count || 0),
          backgroundColor: this.colors.gold,
          borderColor: this.colors.goldBorder,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        ...this.commonOptions,
        indexAxis: 'y',
        plugins: {
          ...this.commonOptions.plugins,
          legend: {
            display: false
          },
          tooltip: {
            ...this.commonOptions.plugins.tooltip,
            callbacks: {
              title: (items) => {
                const item = items[0];
                const video = videos[item.dataIndex];
                return video.title || 'Sin título';
              },
              label: (context) => {
                return `Votos: ${context.parsed.x}`;
              }
            }
          }
        },
        scales: {
          x: {
            ...this.commonOptions.scales.x,
            beginAtZero: true
          },
          y: {
            ...this.commonOptions.scales.y,
            grid: {
              display: false
            }
          }
        }
      }
    });
  },

  // ==================== VOTES TIMELINE ====================
  createVotesTimeline(data) {
    this.destroy('votesTimeline');

    const ctx = document.getElementById('chart-votes-timeline');
    if (!ctx) return;

    const timeline = data.votesByDay || [];
    
    this.instances.votesTimeline = new Chart(ctx, {
      type: 'line',
      data: {
        labels: timeline.map(t => new Date(t.date).toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric' 
        })),
        datasets: [{
          label: 'Votos por día',
          data: timeline.map(t => t.count),
          borderColor: this.colors.purpleBorder,
          backgroundColor: this.colors.purple,
          borderWidth: 3,
          fill: true,
          tension: 0.4,
          pointRadius: 6,
          pointHoverRadius: 8,
          pointBackgroundColor: this.colors.goldBorder,
          pointBorderColor: '#fff',
          pointBorderWidth: 2
        }]
      },
      options: {
        ...this.commonOptions,
        plugins: {
          ...this.commonOptions.plugins,
          legend: {
            display: false
          }
        },
        scales: {
          x: this.commonOptions.scales.x,
          y: {
            ...this.commonOptions.scales.y,
            beginAtZero: true
          }
        }
      }
    });
  },

  // ==================== PLATFORM DISTRIBUTION ====================
  createPlatformDistribution(data) {
    this.destroy('platformDistribution');

    const ctx = document.getElementById('chart-platform-distribution');
    if (!ctx) return;

    const platforms = data.videosByPlatform || [];
    
    this.instances.platformDistribution = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: platforms.map(p => p.platform === 'tiktok' ? '🎵 TikTok' : '▶️ YouTube'),
        datasets: [{
          data: platforms.map(p => p.count),
          backgroundColor: [this.colors.purple, this.colors.pink],
          borderColor: [this.colors.purpleBorder, this.colors.pinkBorder],
          borderWidth: 2
        }]
      },
      options: {
        ...this.commonOptions,
        plugins: {
          ...this.commonOptions.plugins,
          legend: {
            ...this.commonOptions.plugins.legend,
            position: 'bottom'
          }
        }
      }
    });
  },

  // ==================== TRENDING ====================
  createTrending(data) {
    this.destroy('trending');

    const ctx = document.getElementById('chart-trending');
    if (!ctx) return;

    const trending = data.trending || [];
    
    this.instances.trending = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: trending.map(v => v.username || 'Unknown'),
        datasets: [{
          label: 'Votos recientes',
          data: trending.map(v => v.recent_votes || 0),
          backgroundColor: this.colors.pink,
          borderColor: this.colors.pinkBorder,
          borderWidth: 2,
          borderRadius: 8,
          borderSkipped: false
        }]
      },
      options: {
        ...this.commonOptions,
        plugins: {
          ...this.commonOptions.plugins,
          legend: {
            display: false
          },
          tooltip: {
            ...this.commonOptions.plugins.tooltip,
            callbacks: {
              title: (items) => {
                const item = items[0];
                const video = trending[item.dataIndex];
                return video.title || 'Sin título';
              },
              label: (context) => {
                const video = trending[context.dataIndex];
                return [
                  `Votos recientes: ${context.parsed.y}`,
                  `Total: ${video.total_votes || 0}`
                ];
              }
            }
          }
        },
        scales: {
          x: this.commonOptions.scales.x,
          y: {
            ...this.commonOptions.scales.y,
            beginAtZero: true
          }
        }
      }
    });
  },

  // ==================== CARGAR TODOS LOS GRÁFICOS ====================
  async loadAll() {
    try {
      // Obtener datos
      const [stats, ranking, trending] = await Promise.all([
        API.stats.getGeneral(),
        API.stats.getRanking({ limit: 10 }),
        API.stats.getTrending({ hours: 24, limit: 10 })
      ]);

      // Crear gráficos
      this.createTopVideos(ranking);
      this.createVotesTimeline(stats.stats);
      this.createPlatformDistribution(stats.stats);
      this.createTrending(trending);

      // Actualizar cards de estadísticas
      document.getElementById('stat-videos').textContent = stats.stats.totalVideos || 0;
      document.getElementById('stat-votes').textContent = stats.stats.totalVotes || 0;
      document.getElementById('stat-voters').textContent = stats.stats.uniqueVoters || 0;
      
      const trendingCount = trending.trending?.filter(v => v.recent_votes > 0).length || 0;
      document.getElementById('stat-trending').textContent = trendingCount;

    } catch (error) {
      console.error('Error loading charts:', error);
      Utils.showToast('Error cargando estadísticas', 'error');
    }
  }
};

// Exportar para uso global
window.Charts = Charts;
