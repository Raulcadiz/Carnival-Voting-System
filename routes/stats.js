// routes/stats.js
const express = require('express');
const router = express.Router();

// GET - Estadísticas generales
router.get('/', (req, res) => {
    const stats = {};
    
    // Total de videos
    req.db.get('SELECT COUNT(*) as count FROM videos', (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        stats.totalVideos = row.count;
        
        // Total de votos
        req.db.get('SELECT COUNT(*) as count FROM votes', (err, row) => {
            if (err) return res.status(500).json({ error: err.message });
            stats.totalVotes = row.count;
            
            // Videos por plataforma
            req.db.all(
                'SELECT platform, COUNT(*) as count FROM videos GROUP BY platform',
                (err, rows) => {
                    if (err) return res.status(500).json({ error: err.message });
                    stats.videosByPlatform = rows;
                    
                    res.json(stats);
                }
            );
        });
    });
});

// GET - Ranking (Top 10)
router.get('/ranking', (req, res) => {
    const query = `
        SELECT v.*, COUNT(vo.id) as vote_count
        FROM videos v
        LEFT JOIN votes vo ON v.id = vo.video_id
        GROUP BY v.id
        ORDER BY vote_count DESC
        LIMIT 10
    `;
    
    req.db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET - Videos en tendencia (últimas 24h)
router.get('/trending', (req, res) => {
    const query = `
        SELECT v.*, COUNT(vo.id) as vote_count
        FROM videos v
        LEFT JOIN votes vo ON v.id = vo.video_id 
        WHERE vo.voted_at > datetime('now', '-24 hours')
        GROUP BY v.id
        ORDER BY vote_count DESC
        LIMIT 10
    `;
    
    req.db.all(query, (err, rows) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.json(rows);
    });
});

// GET - Video aleatorio
router.get('/random', (req, res) => {
    req.db.get('SELECT * FROM videos ORDER BY RANDOM() LIMIT 1', (err, row) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (!row) {
            return res.status(404).json({ error: 'No hay videos disponibles' });
        }
        res.json(row);
    });
});

module.exports = router;