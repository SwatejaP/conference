const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const verifyToken = require('../middleware/authMiddleware');
const AppError = require('../utils/AppError');

// Get bookings (Admin: all, User: own)
router.get('/', verifyToken, async (req, res) => {
    try {
        const where = req.user.role === 'ADMIN' ? {} : { userId: req.user.id };

        const bookings = await prisma.booking.findMany({
            where,
            include: { room: true, user: { select: { email: true } } },
            orderBy: { startTime: 'asc' }
        });

        res.json(bookings);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch bookings' });
    }
});

// Create booking
// Create booking
router.post('/', verifyToken, async (req, res, next) => {
    try {
        const { roomId, startTime, endTime, purpose, attendees } = req.body;

        if (!roomId || !startTime || !endTime || !purpose || !attendees) {
            return next(new AppError('Please provide all required fields: roomId, startTime, endTime, purpose, attendees', 400));
        }

        const start = new Date(startTime);
        const end = new Date(endTime);
        const now = new Date();

        // 1. Validate Time Range
        if (start < now) {
            return next(new AppError('Cannot book a room in the past', 400));
        }
        if (start >= end) {
            return next(new AppError('End time must be after start time', 400));
        }

        // 2. Validate Capacity
        const room = await prisma.room.findUnique({ where: { id: roomId } });
        if (!room) {
            return next(new AppError('Room not found', 404));
        }
        if (attendees > room.capacity) {
            return next(new AppError(`Room capacity exceeded. Max capacity is ${room.capacity}`, 400));
        }

        // 3. Conflict Check
        // Only block if there is a booking that is actively blocking the slot:
        // - CONFIRMED
        // - PENDING_EMPLOYEE_CONFIRMATION (Admin already approved one, waiting for user)
        // We DO NOT block PENDING_ADMIN_APPROVAL, so multiple people can request the same slot.
        const conflict = await prisma.booking.findFirst({
            where: {
                roomId,
                status: { in: ['CONFIRMED', 'PENDING_EMPLOYEE_CONFIRMATION'] },
                AND: [
                    { startTime: { lt: end } },
                    { endTime: { gt: start } }
                ]
            }
        });

        if (conflict) {
            return next(new AppError('Room is already booked (or approved for another user) for this time slot', 409));
        }

        const booking = await prisma.booking.create({
            data: {
                userId: req.user.id,
                roomId,
                startTime: start,
                endTime: end,
                purpose,
                attendees: parseInt(attendees),
                status: 'PENDING_ADMIN_APPROVAL'
            }
        });

        res.status(201).json(booking);

    } catch (error) {
        next(error);
    }
});



// Update booking status (Admin only)
router.patch('/:id/status', verifyToken, async (req, res) => {
    try {
        if (req.user.role !== 'ADMIN') {
            return res.status(403).json({ error: 'Unauthorized' });
        }
        const { status, rejectionReason } = req.body;

        // Admin can only move to PENDING_EMPLOYEE_CONFIRMATION or REJECTED
        // Admin DOES NOT confirm directly in this workflow.
        if (!['PENDING_EMPLOYEE_CONFIRMATION', 'REJECTED'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status update. Admin can only move to PENDING_EMPLOYEE_CONFIRMATION or REJECTED.' });
        }

        const updateData = { status };
        if (status === 'REJECTED') {
            updateData.rejectionReason = rejectionReason;
        }

        const booking = await prisma.booking.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(booking);
    } catch (error) {
        next(error);
    }
});

// Employee Confirm Booking
router.patch('/:id/confirm', verifyToken, async (req, res, next) => {
    try {
        const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
        if (!booking) return next(new AppError('Booking not found', 404));

        // Allow Booking Owner OR Admin to confirm
        if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return next(new AppError('Unauthorized', 403));
        }

        if (booking.status !== 'PENDING_EMPLOYEE_CONFIRMATION') {
            return next(new AppError('Booking is not waiting for confirmation', 400));
        }

        // Final check for conflicts before confirming
        const conflict = await prisma.booking.findFirst({
            where: {
                roomId: booking.roomId,
                status: 'CONFIRMED',
                AND: [
                    { startTime: { lt: booking.endTime } },
                    { endTime: { gt: booking.startTime } }
                ]
            }
        });

        if (conflict) {
            // Edge case: Someone else confirmed just now? Should not happen with our lock logic but good to match
            return next(new AppError('Slot no longer available', 409));
        }

        const updated = await prisma.booking.update({
            where: { id: req.params.id },
            data: {
                status: 'CONFIRMED',
                confirmationTime: new Date()
            }
        });

        res.json(updated);
    } catch (error) {
        next(error);
    }
});

// Cancel booking (Employee)
router.patch('/:id/cancel', verifyToken, async (req, res, next) => {
    try {
        const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
        if (!booking) return next(new AppError('Booking not found', 404));

        if (booking.userId !== req.user.id && req.user.role !== 'ADMIN') {
            return next(new AppError('Unauthorized', 403));
        }

        const updated = await prisma.booking.update({
            where: { id: req.params.id },
            data: { status: 'CANCELLED_BY_EMPLOYEE' }
        });

        res.json(updated);

    } catch (error) {
        next(error);
    }
});




module.exports = router;
