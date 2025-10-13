const axios = require('axios');

class YouTubeScraper {
  constructor() {
    this.apiKey = process.env.YOUTUBE_API_KEY;
    this.baseUrl = 'https://www.googleapis.com/youtube/v3';
  }

  /**
   * Extrae el ID del video desde diferentes formatos de URL de YouTube
   */
  extractVideoId(url) {
    const patterns = [
      /youtube\.com\/watch\?v=([\w-]+)/,
      /youtu\.be\/([\w-]+)/,
      /youtube\.com\/embed\/([\w-]+)/,
      /youtube\.com\/v\/([\w-]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    throw new Error('URL de YouTube inválida');
  }

  /**
   * Convierte duración ISO 8601 a segundos
   */
  parseDuration(duration) {
    const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
    if (!match) return 0;

    const hours = parseInt(match[1] || 0);
    const minutes = parseInt(match[2] || 0);
    const seconds = parseInt(match[3] || 0);

    return hours * 3600 + minutes * 60 + seconds;
  }

  /**
   * Obtiene información del video usando YouTube Data API v3
   */
  async scrapeVideo(url) {
    if (!this.apiKey) {
      throw new Error('API Key de YouTube no configurada');
    }

    try {
      const videoId = this.extractVideoId(url);
      console.log('🔍 Scrapeando YouTube video:', videoId);

      const response = await axios.get(`${this.baseUrl}/videos`, {
        params: {
          part: 'snippet,contentDetails,statistics',
          id: videoId,
          key: this.apiKey
        },
        timeout: 10000
      });

      if (!response.data.items || response.data.items.length === 0) {
        throw new Error('Video no encontrado');
      }

      const video = response.data.items[0];
      const snippet = video.snippet;
      const stats = video.statistics;
      const contentDetails = video.contentDetails;

      const data = {
        video_id: videoId,
        username: snippet.channelTitle || 'unknown',
        title: snippet.title || 'Sin título',
        description: snippet.description || '',
        thumbnail_url: snippet.thumbnails?.high?.url || snippet.thumbnails?.default?.url || '',
        duration: this.parseDuration(contentDetails.duration),
        view_count: parseInt(stats.viewCount || 0),
        platform: 'youtube'
      };

      console.log('✅ Scrape exitoso de YouTube');
      return data;

    } catch (error) {
      if (error.response) {
        const status = error.response.status;
        if (status === 403) {
          throw new Error('API Key de YouTube inválida o sin cuota');
        } else if (status === 404) {
          throw new Error('Video de YouTube no encontrado');
        }
      }
      console.error('❌ Error scrapeando YouTube:', error.message);
      throw new Error(`Error scrapeando YouTube: ${error.message}`);
    }
  }

  /**
   * Busca videos por query
   */
  async searchVideos(query, maxResults = 10) {
    if (!this.apiKey) {
      throw new Error('API Key de YouTube no configurada');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/search`, {
        params: {
          part: 'snippet',
          q: query,
          type: 'video',
          maxResults: maxResults,
          key: this.apiKey
        },
        timeout: 10000
      });

      return response.data.items.map(item => ({
        video_id: item.id.videoId,
        title: item.snippet.title,
        thumbnail_url: item.snippet.thumbnails.default.url,
        channel: item.snippet.channelTitle,
        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
      }));

    } catch (error) {
      console.error('❌ Error buscando en YouTube:', error.message);
      throw error;
    }
  }
}

module.exports = new YouTubeScraper();
