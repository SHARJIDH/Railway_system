const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { authenticateToken, isAdmin } = require('../middleware/auth.middleware');

router.post('/', isAdmin, async (req, res) => {
  try {
    const { train_number, train_name, source_station, destination_station, total_seats } = req.body;

    const train = await prisma.$transaction(async (prisma) => {
      const newTrain = await prisma.train.create({
        data: {
          train_number,
          train_name,
          source_station,
          destination_station,
          total_seats
        }
      });
      const today = new Date();
      const nextThirtyDays = Array.from({ length: 30 }, (_, i) => {
        const date = new Date(today);
        date.setDate(today.getDate() + i);
        return date;
      });

      await prisma.seatAvailability.createMany({
        data: nextThirtyDays.map(date => ({
          train_id: newTrain.id,
          travel_date: date,
          available_seats: total_seats
        }))
      });

      return newTrain;
    });

    res.status(201).json({
      message: 'Train added successfully',
      train
    });
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(400).json({ message: 'Train number already exists' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { source_station, destination_station, date } = req.query;

    const trains = await prisma.train.findMany({
      where: {
        source_station,
        destination_station,
        seatAvailability: {
          some: {
            travel_date: new Date(date),
            available_seats: {
              gt: 0
            }
          }
        }
      },
      include: {
        seatAvailability: {
          where: {
            travel_date: new Date(date)
          },
          select: {
            available_seats: true
          }
        }
      }
    });

    res.json({ trains });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const train = await prisma.train.findUnique({
      where: {
        id: parseInt(id)
      },
      include: {
        seatAvailability: {
          where: {
            travel_date: {
              gte: new Date()
            }
          },
          orderBy: {
            travel_date: 'asc'
          }
        }
      }
    });

    if (!train) {
      return res.status(404).json({ message: 'Train not found' });
    }

    res.json({ train });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.put('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { train_name, source_station, destination_station, total_seats } = req.body;

    const train = await prisma.train.update({
      where: {
        id: parseInt(id)
      },
      data: {
        train_name,
        source_station,
        destination_station,
        total_seats
      }
    });

    res.json({
      message: 'Train updated successfully',
      train
    });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Train not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

router.delete('/:id', isAdmin, async (req, res) => {
  try {
    const { id } = req.params;

    await prisma.$transaction(async (prisma) => {
      await prisma.seatAvailability.deleteMany({
        where: {
          train_id: parseInt(id)
        }
      });

      await prisma.booking.deleteMany({
        where: {
          train_id: parseInt(id)
        }
      });
      await prisma.train.delete({
        where: {
          id: parseInt(id)
        }
      });
    });

    res.json({ message: 'Train deleted successfully' });
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: 'Train not found' });
    }
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

module.exports = router;
