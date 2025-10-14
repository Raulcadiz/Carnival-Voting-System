const express = require('express');
const router = express.Router();
const db = require('../config/database');

/**
 * POST /api/votes - Registrar un voto
 */
router.post('/', async (req, res) => {
  try {
    const { videoId } = req.body;
    const userIp = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent') || 'unknown';

    // Validación
    if (!videoId) {
      return res.status(400).json({ error: 'ID del video es requerido' });
    }

    // Verificar que el video existe
    const video = await db.get('SELECT id FROM videos WHERE id = ?', [videoId]);
    if (!video) {
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    // Intentar insertar el voto
    try {
      await db.run(
        'INSERT INTO votes (video_id, user_ip, user_agent) VALUES (?, ?, ?)',
        [videoId, userIp, userAgent]
      );

      // Obtener el conteo actualizado de votos
      const voteCount = await db.get(
        'SELECT COUNT(*) as count FROM votes WHERE video_id = ?',
        [videoId]
      );

      res.json({
        success: true,
        message: 'Voto registrado exitosamente',
        voteCount: voteCount.count
      });

    } catch (error) {
      // Error de constraint UNIQUE = ya votó
      if (error.message.includes('UNIQUE constraint')) {
        return res.status(409).json({ 
          error: 'Ya votaste por este video',
          alreadyVoted: true
        });
      }
      throw error;
    }

  } catch (error) {
    console.error('❌ Error registrando voto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/votes/check/:videoId - Verificar si el usuario ya votó
 */
router.get('/check/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const userIp = req.ip || req.connection.remoteAddress;

    const vote = await db.get(
      'SELECT id FROM votes WHERE video_id = ? AND user_ip = ?',
      [videoId, userIp]
    );

    res.json({
      success: true,
      hasVoted: !!vote
    });

  } catch (error) {
    console.error('❌ Error verificando voto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * GET /api/votes/video/:videoId - Obtener todos los votos de un video
 */
router.get('/video/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;

    const votes = await db.all(
      'SELECT id, voted_at FROM votes WHERE video_id = ? ORDER BY voted_at DESC',
      [videoId]
    );

    res.json({
      success: true,
      count: votes.length,
      votes: votes
    });

  } catch (error) {
    console.error('❌ Error obteniendo votos:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

/**
 * DELETE /api/votes/:videoId - Eliminar voto (para testing)
 */
router.delete('/:videoId', async (req, res) => {
  try {
    const { videoId } = req.params;
    const userIp = req.ip || req.connection.remoteAddress;

    const result = await db.run(
      'DELETE FROM votes WHERE video_id = ? AND user_ip = ?',
      [videoId, userIp]
    );

    if (result.changes === 0) {
      return res.status(404).json({ error: 'Voto no encontrado' });
    }

    res.json({
      success: true,
      message: 'Voto eliminado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error eliminando voto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

module.exports = router;
