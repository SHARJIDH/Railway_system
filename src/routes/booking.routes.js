const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken } = require('../middleware/auth.middleware');

router.post('/', authenticateToken, async (req, res) => {
  try {
    const { train_id, booking_date, seat_number } = req.body;
    const user_id = req.user.id;

    const booking = await prisma.$transaction(async (prisma) => {
      const seatAvailability = await prisma.seatAvailability.findUnique({
        where: {
          train_id_travel_date: {
            train_id: parseInt(train_id),
            travel_date: new Date(booking_date)
          }
        }
      });

      if (!seatAvailability || seatAvailability.available_seats <= 0) {
        throw new Error('No seats available for this date');
      }

      const existingBooking = await prisma.booking.findFirst({
        where: {
          train_id: parseInt(train_id),
          booking_date: new Date(booking_date),
          seat_number: parseInt(seat_number)
        }
      });

      if (existingBooking) {
        throw new Error('Seat already booked');
      }

      const newBooking = await prisma.booking.create({
        data: {
          user_id: parseInt(user_id),
          train_id: parseInt(train_id),
          booking_date: new Date(booking_date),
          seat_number: parseInt(seat_number)
        },
        include: {
          train: true,
          user: {
            select: {
              username: true,
              email: true
            }
          }
        }
      });

      await prisma.seatAvailability.update({
        where: {
          train_id_travel_date: {
            train_id: parseInt(train_id),
            travel_date: new Date(booking_date)
          }
        },
        data: {
          available_seats: {
            decrement: 1
          }
        }
      });

      return newBooking;
    });

    res.status(201).json({
      message: 'Booking created successfully',
      booking
    });
  } catch (error) {
    if (error.message === 'No seats available for this date' || error.message === 'Seat already booked') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/my-bookings', authenticateToken, async (req, res) => {
  try {
    const user_id = req.user.id;

    const bookings = await prisma.booking.findMany({
      where: {
        user_id: parseInt(user_id)
      },
      include: {
        train: true
      },
      orderBy: {
        booking_date: 'desc'
      }
    });

    res.json({ bookings });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    const booking = await prisma.booking.findFirst({
      where: {
        id: parseInt(id),
        user_id
      },
      include: {
        train: true,
        user: {
          select: {
            username: true,
            email: true
          }
        }
      }
    });

    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.json({ booking });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const user_id = req.user.id;

    await prisma.$transaction(async (prisma) => {
      const booking = await prisma.booking.findUnique({
        where: {
          id: parseInt(id)
        }
      });

      if (!booking) {
        throw new Error('Booking not found');
      }

      if (booking.user_id !== user_id) {
        throw new Error('Unauthorized');
      }

      await prisma.booking.delete({
        where: {
          id: parseInt(id)
        }
      });
      await prisma.seatAvailability.update({
        where: {
          train_id_travel_date: {
            train_id: booking.train_id,
            travel_date: booking.booking_date
          }
        },
        data: {
          available_seats: {
            increment: 1
          }
        }
      });
    });

    res.json({ message: 'Booking cancelled successfully' });
  } catch (error) {
    if (error.message === 'Booking not found') {
      return res.status(404).json({ message: error.message });
    }
    if (error.message === 'Unauthorized') {
      return res.status(403).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
