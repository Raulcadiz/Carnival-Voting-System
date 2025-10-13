const axios = require('axios');

class TikTokScraper {
  constructor() {
    // API Principal
    this.api1 = {
      key: process.env.TIKTOK_API_KEY_1,
      host: process.env.TIKTOK_API_HOST_1 || 'tiktok-scraper7.p.rapidapi.com'
    };

    // API Backup
    this.api2 = {
      key: process.env.TIKTOK_API_KEY_2,
      host: process.env.TIKTOK_API_HOST_2 || 'tiktok-video-no-watermark2.p.rapidapi.com'
    };
  }

  /**
   * Extrae el ID del video desde diferentes formatos de URL de TikTok
   */
  extractVideoId(url) {
    const patterns = [
      /tiktok\.com\/@[\w.-]+\/video\/(\d+)/,
      /tiktok\.com\/v\/(\d+)/,
      /vm\.tiktok\.com\/([\w]+)/,
      /vt\.tiktok\.com\/([\w]+)/
    ];

    for (const pattern of patterns) {
      const match = url.match(pattern);
      if (match) return match[1];
    }

    throw new Error('URL de TikTok inválida');
  }

  /**
   * Scrapea video usando la API principal
   */
  async scrapeWithAPI1(videoId) {
    try {
      const response = await axios.get(`https://${this.api1.host}/video/info`, {
        params: { video_id: videoId },
        headers: {
          'X-RapidAPI-Key': this.api1.key,
          'X-RapidAPI-Host': this.api1.host
        },
        timeout: 10000
      });

      if (response.data && response.data.data) {
        const data = response.data.data;
        return {
          video_id: videoId,
          username: data.author?.unique_id || data.author?.nickname || 'unknown',
          title: data.title || data.desc || 'Sin título',
          description: data.desc || '',
          thumbnail_url: data.cover || data.dynamic_cover || '',
          duration: data.duration || 0,
          view_count: data.play_count || 0,
          platform: 'tiktok'
        };
      }

      throw new Error('Respuesta inválida de API 1');
    } catch (error) {
      console.error('❌ Error en TikTok API 1:', error.message);
      throw error;
    }
  }

  /**
   * Scrapea video usando la API backup
   */
  async scrapeWithAPI2(videoId) {
    try {
      const response = await axios.get(`https://${this.api2.host}/video/info`, {
        params: { video_id: videoId },
        headers: {
          'X-RapidAPI-Key': this.api2.key,
          'X-RapidAPI-Host': this.api2.host
        },
        timeout: 10000
      });

      if (response.data && response.data.data) {
        const data = response.data.data;
        return {
          video_id: videoId,
          username: data.author?.uniqueId || data.author?.nickname || 'unknown',
          title: data.video?.title || data.video?.desc || 'Sin título',
          description: data.video?.desc || '',
          thumbnail_url: data.video?.cover || '',
          duration: data.video?.duration || 0,
          view_count: data.stats?.playCount || 0,
          platform: 'tiktok'
        };
      }

      throw new Error('Respuesta inválida de API 2');
    } catch (error) {
      console.error('❌ Error en TikTok API 2:', error.message);
      throw error;
    }
  }

  /**
   * Método principal con fallback automático
   */
  async scrapeVideo(url) {
    if (!this.api1.key && !this.api2.key) {
      throw new Error('No hay APIs de TikTok configuradas');
    }

    const videoId = this.extractVideoId(url);

    // Intentar con API 1 primero
    if (this.api1.key) {
      try {
        console.log('🔍 Intentando scrape con TikTok API 1...');
        const data = await this.scrapeWithAPI1(videoId);
        console.log('✅ Scrape exitoso con API 1');
        return data;
      } catch (error) {
        console.warn('⚠️  API 1 falló, intentando con API 2...');
      }
    }

    // Fallback a API 2
    if (this.api2.key) {
      try {
        console.log('🔍 Intentando scrape con TikTok API 2...');
        const data = await this.scrapeWithAPI2(videoId);
        console.log('✅ Scrape exitoso con API 2');
        return data;
      } catch (error) {
        console.error('❌ API 2 también falló');
        throw new Error('Ambas APIs de TikTok fallaron');
      }
    }

    throw new Error('No se pudo scrapear el video');
  }
}

module.exports = new TikTokScraper();
