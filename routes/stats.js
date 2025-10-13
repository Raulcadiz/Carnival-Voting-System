const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * GET /api/stats - Estadísticas generales
 */
router.get('/', async (req, res) => {
  try {
    // Total de videos
    const totalVideos = await db.get('SELECT COUNT(*) as count FROM videos');
    
    // Total de votos
    const totalVotes = await db.get('SELECT COUNT(*) as count FROM votes');
    
    // Videos por plataforma
    const videosByPlatform = await db.all(`
      SELECT platform, COUNT(*) as count 
      FROM videos 
      GROUP BY platform
    `);
    
    // Votos por día (últimos 7 días)
    const votesByDay = await db.all(`
      SELECT 
        DATE(voted_at) as date,
        COUNT(*) as count
      FROM votes
      WHERE voted_at >= DATE('now', '-7 days')
      GROUP BY DATE(voted_at)
      ORDER BY date DESC
    `);

    // Video más votado
    const topVideo = await db.get(`
      SELECT 
        v.*,
        COUNT(vo.id) as vote_count
      FROM videos v
      LEFT JOIN votes vo ON v.id = vo.video_id
      GROUP BY v.id
      ORDER BY vote_count DESC
      LIMIT 1
    `);

    // Usuarios únicos que han votado
    const uniqueVoters = await db.get('SELECT COUNT(DISTINCT user_ip) as count FROM votes');

    res.json({
      success: true,
      stats: {
        totalVideos: totalVideos.count,
        totalVotes: totalVotes.count,
        uniqueVoters: uniqueVoters.count,
        videosByPlatform: videosByPlatform,
        votesByDay: votesByDay,
        topVideo: topVideo
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/stats/ranking - Top videos con ranking
 */
router.get('/ranking', async (req, res) => {
  try {
    const { limit = 10, platform } = req.query;

    let sql = `
      SELECT 
        v.*,
        COUNT(vo.id) as vote_count,
        RANK() OVER (ORDER BY COUNT(vo.id) DESC) as rank
      FROM videos v
      LEFT JOIN votes vo ON v.id = vo.video_id
    `;

    const params = [];

    if (platform) {
      sql += ' WHERE v.platform = ?';
      params.push(platform);
    }

    sql += ' GROUP BY v.id ORDER BY vote_count DESC LIMIT ?';
    params.push(parseInt(limit));

    const ranking = await db.all(sql, params);

    res.json({
      success: true,
      ranking: ranking
    });

  } catch (error) {
    console.error('❌ Error obteniendo ranking:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/stats/timeline/:videoId - Timeline de votos de un video
 */
router.get('/timeline/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    const timeline = await db.all(`
      SELECT 
        DATE(voted_at) as date,
        COUNT(*) as votes,
        SUM(COUNT(*)) OVER (ORDER BY DATE(voted_at)) as cumulative_votes
      FROM votes
      WHERE video_id = ?
      GROUP BY DATE(voted_at)
      ORDER BY date ASC
    `, [videoId]);

    res.json({
      success: true,
      timeline: timeline
    });

  } catch (error) {
    console.error('❌ Error obteniendo timeline:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/stats/comparison - Comparar dos videos
 */
router.get('/comparison', async (req, res) => {
  try {
    const { video1, video2 } = req.query;

    if (!video1 || !video2) {
      return res.status(400).json({ error: 'Se requieren dos IDs de video' });
    }

    const comparison = await db.all(`
      SELECT 
        v.*,
        COUNT(vo.id) as vote_count,
        MIN(vo.voted_at) as first_vote,
        MAX(vo.voted_at) as last_vote
      FROM videos v
      LEFT JOIN votes vo ON v.id = vo.video_id
      WHERE v.id IN (?, ?)
      GROUP BY v.id
    `, [video1, video2]);

    if (comparison.length !== 2) {
      return res.status(404).json({ error: 'Uno o ambos videos no encontrados' });
    }

    res.json({
      success: true,
      comparison: {
        video1: comparison.find(v => v.id == video1),
        video2: comparison.find(v => v.id == video2),
        difference: Math.abs(
          comparison.find(v => v.id == video1).vote_count - 
          comparison.find(v => v.id == video2).vote_count
        )
      }
    });

  } catch (error) {
    console.error('❌ Error comparando videos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/stats/trending - Videos en tendencia (más votos recientes)
 */
router.get('/trending', async (req, res) => {
  try {
    const { hours = 24, limit = 10 } = req.query;

    const trending = await db.all(`
      SELECT 
        v.*,
        COUNT(vo.id) as recent_votes,
        (SELECT COUNT(*) FROM votes WHERE video_id = v.id) as total_votes
      FROM videos v
      LEFT JOIN votes vo ON v.id = vo.video_id 
        AND vo.voted_at >= DATETIME('now', '-' || ? || ' hours')
      GROUP BY v.id
      ORDER BY recent_votes DESC
      LIMIT ?
    `, [hours, parseInt(limit)]);

    res.json({
      success: true,
      trending: trending,
      timeframe: `${hours} horas`
    });

  } catch (error) {
    console.error('❌ Error obteniendo trending:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/stats/random - Video aleatorio
 */
router.get('/random', async (req, res) => {
  try {
    const { platform } = req.query;

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

    sql += ' GROUP BY v.id ORDER BY RANDOM() LIMIT 1';

    const randomVideo = await db.get(sql, params);

    if (!randomVideo) {
      return res.status(404).json({ error: 'No hay videos disponibles' });
    }

    res.json({
      success: true,
      video: randomVideo
    });

  } catch (error) {
    console.error('❌ Error obteniendo video aleatorio:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
