const db = require('../config/database');

class ConfigService {
  /**
   * Obtener una configuración por key
   */
  async get(key) {
    try {
      const config = await db.get('SELECT value FROM config WHERE key = ?', [key]);
      return config?.value || process.env[key] || null;
    } catch (error) {
      console.error(`Error getting config ${key}:`, error);
      return process.env[key] || null;
    }
  }

  /**
   * Obtener múltiples configuraciones
   */
  async getMultiple(keys) {
    const result = {};
    for (const key of keys) {
      result[key] = await this.get(key);
    }
    return result;
  }

  /**
   * Obtener todas las configuraciones
   */
  async getAll() {
    try {
      const configs = await db.all('SELECT key, value, description FROM config');
      const result = {};
      configs.forEach(cfg => {
        result[cfg.key] = cfg.value;
      });
      return result;
    } catch (error) {
      console.error('Error getting all configs:', error);
      return {};
    }
  }

  /**
   * Actualizar una configuración
   */
  async set(key, value) {
    try {
      await db.run(
        `INSERT INTO config (key, value, updated_at) 
         VALUES (?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(key) 
         DO UPDATE SET value = ?, updated_at = CURRENT_TIMESTAMP`,
        [key, value, value]
      );
      return true;
    } catch (error) {
      console.error(`Error setting config ${key}:`, error);
      return false;
    }
  }

  /**
   * Actualizar múltiples configuraciones
   */
  async setMultiple(configs) {
    try {
      for (const [key, value] of Object.entries(configs)) {
        await this.set(key, value);
      }
      return true;
    } catch (error) {
      console.error('Error setting multiple configs:', error);
      return false;
    }
  }

  /**
   * Obtener configuraciones de APIs para el admin
   */
  async getApiConfigs() {
    const keys = [
      'TIKTOK_API_KEY_1',
      'TIKTOK_API_HOST_1',
      'TIKTOK_API_KEY_2',
      'TIKTOK_API_HOST_2',
      'YOUTUBE_API_KEY'
    ];

    const configs = await this.getMultiple(keys);

    return {
      tiktok1: {
        key: configs.TIKTOK_API_KEY_1 || '',
        host: configs.TIKTOK_API_HOST_1 || 'tiktok-scraper7.p.rapidapi.com',
        configured: !!(configs.TIKTOK_API_KEY_1)
      },
      tiktok2: {
        key: configs.TIKTOK_API_KEY_2 || '',
        host: configs.TIKTOK_API_HOST_2 || 'tiktok-video-no-watermark2.p.rapidapi.com',
        configured: !!(configs.TIKTOK_API_KEY_2)
      },
      youtube: {
        key: configs.YOUTUBE_API_KEY || '',
        configured: !!(configs.YOUTUBE_API_KEY)
      }
    };
  }

  /**
   * Actualizar configuraciones de APIs
   */
  async updateApiConfigs(apiConfigs) {
    const updates = {};

    if (apiConfigs.tiktok1) {
      if (apiConfigs.tiktok1.key !== undefined) {
        updates.TIKTOK_API_KEY_1 = apiConfigs.tiktok1.key;
      }
      if (apiConfigs.tiktok1.host !== undefined) {
        updates.TIKTOK_API_HOST_1 = apiConfigs.tiktok1.host;
      }
    }

    if (apiConfigs.tiktok2) {
      if (apiConfigs.tiktok2.key !== undefined) {
        updates.TIKTOK_API_KEY_2 = apiConfigs.tiktok2.key;
      }
      if (apiConfigs.tiktok2.host !== undefined) {
        updates.TIKTOK_API_HOST_2 = apiConfigs.tiktok2.host;
      }
    }

    if (apiConfigs.youtube?.key !== undefined) {
      updates.YOUTUBE_API_KEY = apiConfigs.youtube.key;
    }

    return await this.setMultiple(updates);
  }

  /**
   * Verificar si una API está configurada
   */
  async isApiConfigured(apiName) {
    const keyMap = {
      'tiktok1': 'TIKTOK_API_KEY_1',
      'tiktok2': 'TIKTOK_API_KEY_2',
      'youtube': 'YOUTUBE_API_KEY'
    };

    const key = keyMap[apiName];
    if (!key) return false;

    const value = await this.get(key);
    return !!(value && value.trim());
  }
}

module.exports = new ConfigService();
