'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('users', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      username: {
        type: Sequelize.STRING(50),
        allowNull: false,
        unique: true
      },
      password: {
        type: Sequelize.STRING(255),
        allowNull: false
      },
      email: {
        type: Sequelize.STRING(255),
        allowNull: false,
        unique: true
      },
      role: {
        type: Sequelize.STRING(10),
        allowNull: false,
        defaultValue: 'user'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Trains table
    await queryInterface.createTable('trains', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      train_number: {
        type: Sequelize.STRING(20),
        allowNull: false,
        unique: true
      },
      train_name: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      source_station: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      destination_station: {
        type: Sequelize.STRING(100),
        allowNull: false
      },
      total_seats: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
    await queryInterface.createTable('bookings', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      train_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'trains',
          key: 'id'
        }
      },
      booking_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      seat_number: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      status: {
        type: Sequelize.STRING(20),
        allowNull: false,
        defaultValue: 'confirmed'
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.createTable('seat_availability', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      train_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'trains',
          key: 'id'
        }
      },
      travel_date: {
        type: Sequelize.DATE,
        allowNull: false
      },
      available_seats: {
        type: Sequelize.INTEGER,
        allowNull: false
      },
      created_at: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addConstraint('bookings', {
      fields: ['train_id', 'booking_date', 'seat_number'],
      type: 'unique'
    });

    await queryInterface.addConstraint('seat_availability', {
      fields: ['train_id', 'travel_date'],
      type: 'unique'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('seat_availability');
    await queryInterface.dropTable('bookings');
    await queryInterface.dropTable('trains');
    await queryInterface.dropTable('users');
  }
};
