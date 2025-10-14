// routes/votes.js
const express = require('express');
const router = express.Router();

// POST - Votar por un video
router.post('/', (req, res) => {
    const { video_id } = req.body;
    const user_ip = req.ip || req.connection.remoteAddress;
    const user_agent = req.headers['user-agent'];
    
    if (!video_id) {
        return res.status(400).json({ error: 'video_id es requerido' });
    }
    
    // Verificar si el video existe
    req.db.get('SELECT id FROM videos WHERE id = ?', [video_id], (err, video) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!video) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }
        
        // Insertar voto
        const query = 'INSERT INTO votes (video_id, user_ip, user_agent) VALUES (?, ?, ?)';
        
        req.db.run(query, [video_id, user_ip, user_agent], function(err) {
            if (err) {
                if (err.message.includes('UNIQUE')) {
                    return res.status(409).json({ error: 'Ya votaste por este video' });
                }
                return res.status(500).json({ error: err.message });
            }
            
            res.status(201).json({
                message: 'Voto registrado correctamente',
                vote_id: this.lastID
            });
        });
    });
});

// GET - Verificar si ya votó
router.get('/check/:videoId', (req, res) => {
    const { videoId } = req.params;
    const user_ip = req.ip || req.connection.remoteAddress;
    
    req.db.get(
        'SELECT id FROM votes WHERE video_id = ? AND user_ip = ?',
        [videoId, user_ip],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ hasVoted: !!row });
        }
    );
});

// GET - Obtener votos de un video
router.get('/video/:videoId', (req, res) => {
    const { videoId } = req.params;
    
    req.db.get(
        'SELECT COUNT(*) as count FROM votes WHERE video_id = ?',
        [videoId],
        (err, row) => {
            if (err) {
                return res.status(500).json({ error: err.message });
            }
            res.json({ video_id: videoId, votes: row.count });
        }
    );
});

module.exports = router;