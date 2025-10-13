const express = require('express');
const router = express.Router();
const db = require('../config/database');
const configService = require('../services/configService');
const { authMiddleware, generateToken, verifyAdminCredentials } = require('../middleware/auth');

/**
 * POST /api/admin/login - Login de administrador
 */
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: 'Usuario y contraseña requeridos' });
    }

    // Verificar credenciales
    if (!verifyAdminCredentials(username, password)) {
      return res.status(401).json({ error: 'Credenciales inválidas' });
    }

    // Generar token
    const token = generateToken(username);

    res.json({
      success: true,
      token,
      username,
      message: 'Login exitoso'
    });

  } catch (error) {
    console.error('❌ Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/admin/stats - Estadísticas para admin
 */
router.get('/stats', authMiddleware, async (req, res) => {
  try {
    // Estadísticas avanzadas
    const stats = {
      videos: await db.get('SELECT COUNT(*) as count FROM videos'),
      votes: await db.get('SELECT COUNT(*) as count FROM votes'),
      uniqueVoters: await db.get('SELECT COUNT(DISTINCT user_ip) as count FROM votes'),
      
      // Videos por plataforma
      byPlatform: await db.all(`
        SELECT platform, COUNT(*) as count 
        FROM videos 
        GROUP BY platform
      `),
      
      // Últimos videos agregados
      recentVideos: await db.all(`
        SELECT * FROM videos 
        ORDER BY created_at DESC 
        LIMIT 10
      `),
      
      // Top votantes (IPs)
      topVoters: await db.all(`
        SELECT user_ip, COUNT(*) as vote_count
        FROM votes
        GROUP BY user_ip
        ORDER BY vote_count DESC
        LIMIT 10
      `),
      
      // Votos por hora del día
      votesByHour: await db.all(`
        SELECT 
          strftime('%H', voted_at) as hour,
          COUNT(*) as count
        FROM votes
        GROUP BY hour
        ORDER BY hour
      `)
    };

    res.json({
      success: true,
      stats
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas admin:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/admin/videos/:id - Editar video
 */
router.put('/videos/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, username } = req.body;

    // Validar que el video existe
    const video = await db.get('SELECT id FROM videos WHERE id = ?', [id]);
    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    // Actualizar campos
    const updates = [];
    const values = [];

    if (title !== undefined) {
      updates.push('title = ?');
      values.push(title);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (username !== undefined) {
      updates.push('username = ?');
      values.push(username);
    }

    if (updates.length === 0) {
      return res.status(400).json({ error: 'No hay campos para actualizar' });
    }

    updates.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    await db.run(
      `UPDATE videos SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    // Obtener video actualizado
    const updatedVideo = await db.get('SELECT * FROM videos WHERE id = ?', [id]);

    res.json({
      success: true,
      message: 'Video actualizado exitosamente',
      video: updatedVideo
    });

  } catch (error) {
    console.error('❌ Error actualizando video:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/admin/videos/:id - Eliminar video (admin)
 */
router.delete('/videos/:id', authMiddleware, async (req, res) => {
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
 * POST /api/admin/videos/bulk-delete - Eliminar múltiples videos
 */
router.post('/videos/bulk-delete', authMiddleware, async (req, res) => {
  try {
    const { videoIds } = req.body;

    if (!Array.isArray(videoIds) || videoIds.length === 0) {
      return res.status(400).json({ error: 'Se requiere un array de IDs' });
    }

    const placeholders = videoIds.map(() => '?').join(',');
    const result = await db.run(
      `DELETE FROM videos WHERE id IN (${placeholders})`,
      videoIds
    );

    res.json({
      success: true,
      message: `${result.changes} video(s) eliminado(s)`,
      deletedCount: result.changes
    });

  } catch (error) {
    console.error('❌ Error eliminando videos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/admin/config - Obtener configuración actual
 */
router.get('/config', authMiddleware, async (req, res) => {
  try {
    const apiConfigs = await configService.getApiConfigs();

    const config = {
      apis: {
        tiktok1: {
          key: apiConfigs.tiktok1.key,
          host: apiConfigs.tiktok1.host,
          configured: apiConfigs.tiktok1.configured
        },
        tiktok2: {
          key: apiConfigs.tiktok2.key,
          host: apiConfigs.tiktok2.host,
          configured: apiConfigs.tiktok2.configured
        },
        youtube: {
          key: apiConfigs.youtube.key,
          configured: apiConfigs.youtube.configured
        }
      },
      server: {
        port: process.env.PORT || 3000,
        nodeEnv: process.env.NODE_ENV || 'development'
      },
      security: {
        rateLimitWindow: process.env.RATE_LIMIT_WINDOW_MS || 900000,
        rateLimitMax: process.env.RATE_LIMIT_MAX_REQUESTS || 100
      }
    };

    res.json({
      success: true,
      config
    });

  } catch (error) {
    console.error('❌ Error obteniendo configuración:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * PUT /api/admin/config - Actualizar configuración de APIs
 */
router.put('/config', authMiddleware, async (req, res) => {
  try {
    const { apis } = req.body;

    if (!apis) {
      return res.status(400).json({ error: 'Configuración de APIs requerida' });
    }

    // Actualizar configuraciones en la base de datos
    const success = await configService.updateApiConfigs(apis);

    if (!success) {
      return res.status(500).json({ error: 'Error guardando configuración' });
    }

    // Obtener configuración actualizada
    const updatedConfig = await configService.getApiConfigs();

    res.json({
      success: true,
      message: 'Configuración actualizada exitosamente',
      config: updatedConfig,
      note: 'Los cambios se aplicarán inmediatamente en las próximas solicitudes'
    });

  } catch (error) {
    console.error('❌ Error actualizando configuración:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * POST /api/admin/clear-votes/:videoId - Limpiar votos de un video
 */
router.post('/clear-votes/:videoId', authMiddleware, async (req, res) => {
  try {
    const { videoId } = req.params;

    const result = await db.run('DELETE FROM votes WHERE video_id = ?', [videoId]);

    res.json({
      success: true,
      message: `${result.changes} voto(s) eliminado(s)`,
      deletedCount: result.changes
    });

  } catch (error) {
    console.error('❌ Error limpiando votos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/admin/logs - Obtener logs recientes (últimos eventos)
 */
router.get('/logs', authMiddleware, async (req, res) => {
  try {
    // Últimos videos agregados
    const recentVideos = await db.all(`
      SELECT 
        'VIDEO_ADDED' as event_type,
        created_at as timestamp,
        title as description,
        username as details
      FROM videos
      ORDER BY created_at DESC
      LIMIT 20
    `);

    // Últimos votos
    const recentVotes = await db.all(`
      SELECT 
        'VOTE_CAST' as event_type,
        v.voted_at as timestamp,
        vid.title as description,
        v.user_ip as details
      FROM votes v
      JOIN videos vid ON v.video_id = vid.id
      ORDER BY v.voted_at DESC
      LIMIT 20
    `);

    // Combinar y ordenar
    const logs = [...recentVideos, ...recentVotes]
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
      .slice(0, 30);

    res.json({
      success: true,
      logs
    });

  } catch (error) {
    console.error('❌ Error obteniendo logs:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
