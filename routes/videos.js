// routes/videos.js
const express = require('express');
const router = express.Router();

// GET - Listar todos los videos
router.get('/', (req, res) => {
    const { platform, limit = 50 } = req.query;
    
    let query = 'SELECT * FROM videos';
    let params = [];
    
    if (platform) {
        query += ' WHERE platform = ?';
        params.push(platform);
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?';
    params.push(parseInt(limit));
    
    req.db.all(query, params, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET - Obtener video por ID
router.get('/:id', (req, res) => {
    const { id } = req.params;
    
    req.db.get('SELECT * FROM videos WHERE id = ?', [id], (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }
        res.json(row);
    });
});

// POST - Agregar nuevo video
router.post('/', (req, res) => {
    const { platform, video_url, video_id, username, title, description, thumbnail_url, duration, view_count } = req.body;
    
    if (!platform || !video_url || !video_id) {
        return res.status(400).json({ error: 'Faltan datos requeridos' });
    }
    
    const query = `
        INSERT INTO videos (platform, video_url, video_id, username, title, description, thumbnail_url, duration, view_count)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    req.db.run(query, [platform, video_url, video_id, username, title, description, thumbnail_url, duration, view_count], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(409).json({ error: 'El video ya existe' });
            }
            return res.status(500).json({ error: err.message });
        }
        
        res.status(201).json({
            id: this.lastID,
            message: 'Video agregado correctamente'
        });
    });
});

// DELETE - Eliminar video
router.delete('/:id', (req, res) => {
    const { id } = req.params;
    
    req.db.run('DELETE FROM videos WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ error: 'Video no encontrado' });
        }
        res.json({ message: 'Video eliminado correctamente' });
    });
});

// GET - Buscar videos
router.get('/search/:query', (req, res) => {
    const { query } = req.params;
    const searchQuery = `%${query}%`;
    
    const sql = `
        SELECT * FROM videos 
        WHERE title LIKE ? OR username LIKE ? OR description LIKE ?
        ORDER BY created_at DESC
    `;
    
    req.db.all(sql, [searchQuery, searchQuery, searchQuery], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

module.exports = router;