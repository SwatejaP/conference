const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const verifyToken = require('../middleware/authMiddleware');

// Get all rooms
router.get('/', async (req, res) => {
    try {
        const rooms = await prisma.room.findMany();
        res.json(rooms);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch rooms' });
    }
});

// Create room (Admin only)
router.post('/', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        const { name, capacity, location, facilities } = req.body;
        const room = await prisma.room.create({
            data: {
                name,
                capacity: parseInt(capacity),
                location,
                facilities: facilities || []
            }
        });
        res.json(room);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
