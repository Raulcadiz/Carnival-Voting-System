const express = require('express');
const router = express.Router();
const db = require('../config/database');
const tiktokScraper = require('../services/tiktokScraper');
const youtubeScraper = require('../services/youtubeScraper');

/**
 * POST /api/videos - Agregar nuevo video (scraping automático)
 */
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'URL del video es requerida' });
    }

    // Determinar plataforma
    let platform;
    let videoData;

    if (url.includes('tiktok.com') || url.includes('vm.tiktok.com')) {
      platform = 'tiktok';
      videoData = await tiktokScraper.scrapeVideo(url);
    } else if (url.includes('youtube.com') || url.includes('youtu.be')) {
      platform = 'youtube';
      videoData = await youtubeScraper.scrapeVideo(url);
    } else {
      return res.status(400).json({ error: 'Plataforma no soportada. Use TikTok o YouTube' });
    }

    // Verificar si el video ya existe
    const existing = await db.get(
      'SELECT id FROM videos WHERE video_url = ? OR video_id = ?',
      [url, videoData.video_id]
    );

    if (existing) {
      return res.status(409).json({ error: 'Este video ya fue agregado' });
    }

    // Insertar video en la base de datos
    const result = await db.run(`
      INSERT INTO videos (
        platform, video_url, video_id, username, title, 
        description, thumbnail_url, duration, view_count
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [
      platform,
      url,
      videoData.video_id,
      videoData.username,
      videoData.title,
      videoData.description,
      videoData.thumbnail_url,
      videoData.duration,
      videoData.view_count
    ]);

    // Obtener el video recién creado
    const newVideo = await db.get('SELECT * FROM videos WHERE id = ?', [result.id]);

    res.status(201).json({
      success: true,
      message: 'Video agregado exitosamente',
      video: newVideo
    });

  } catch (error) {
    console.error('❌ Error agregando video:', error);
    res.status(500).json({ error: error.message || 'Error interno del servidor' });
  }
});

/**
 * GET /api/videos - Obtener todos los videos con conteo de votos
 */
router.get('/', async (req, res) => {
  try {
    const { platform, sort = 'votes', order = 'DESC', limit = 50 } = req.query;

    let sql = `
      SELECT 
        v.*,
        COUNT(vo.id) as vote_count
      FROM videos v
      LEFT JOIN votes vo ON v.id = vo.video_id
    `;

    const params = [];

    if (platform) {
      sql += ' WHERE v.platform = ?';
      params.push(platform);
    }

    sql += ' GROUP BY v.id';

    // Ordenamiento
    const validSorts = {
      'votes': 'vote_count',
      'recent': 'v.created_at',
      'views': 'v.view_count',
      'title': 'v.title'
    };

    const sortColumn = validSorts[sort] || 'vote_count';
    const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    sql += ` ORDER BY ${sortColumn} ${sortOrder}`;

    sql += ' LIMIT ?';
    params.push(parseInt(limit));

    const videos = await db.all(sql, params);

    res.json({
      success: true,
      count: videos.length,
      videos: videos
    });

  } catch (error) {
    console.error('❌ Error obteniendo videos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/videos/:id - Obtener video específico
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const video = await db.get(`
      SELECT 
        v.*,
        COUNT(vo.id) as vote_count
      FROM videos v
      LEFT JOIN votes vo ON v.id = vo.video_id
      WHERE v.id = ?
      GROUP BY v.id
    `, [id]);

    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    res.json({
      success: true,
      video: video
    });

  } catch (error) {
    console.error('❌ Error obteniendo video:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/videos/:id - Eliminar video
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const result = await db.run('DELETE FROM videos WHERE id = ?', [id]);

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    res.json({
      success: true,
      message: 'Video eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando video:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/videos/search/:query - Buscar videos
 */
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const searchTerm = `%${query}%`;

    const videos = await db.all(`
      SELECT 
        v.*,
        COUNT(vo.id) as vote_count
      FROM videos v
      LEFT JOIN votes vo ON v.id = vo.video_id
      WHERE v.title LIKE ? OR v.username LIKE ? OR v.description LIKE ?
      GROUP BY v.id
      ORDER BY vote_count DESC
    `, [searchTerm, searchTerm, searchTerm]);

    res.json({
      success: true,
      count: videos.length,
      videos: videos
    });

  } catch (error) {
    console.error('❌ Error buscando videos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
