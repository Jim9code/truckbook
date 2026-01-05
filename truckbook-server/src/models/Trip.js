import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Trip = sequelize.define('Trip', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'user_id',
      references: {
        model: 'users',
        key: 'id'
      }
    },
    truckId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'truck_id',
      references: {
        model: 'trucks',
        key: 'id'
      }
    },
    driverId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'driver_id',
      references: {
        model: 'drivers',
        key: 'id'
      }
    },
    customerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      field: 'customer_id',
      references: {
        model: 'customers',
        key: 'id'
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    routeFrom: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'route_from'
    },
    routeTo: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'route_to'
    },
    status: {
      type: DataTypes.ENUM('Pending', 'Completed'),
      defaultValue: 'Pending'
    },
    agreedPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      field: 'agreed_price'
    },
    paymentType: {
      type: DataTypes.ENUM('full', 'part'),
      defaultValue: 'full',
      field: 'payment_type'
    },
    amountReceivedBefore: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'amount_received_before'
    },
    amountReceivedAfter: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'amount_received_after'
    },
    fuelCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'fuel_cost'
    },
    maintenanceCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'maintenance_cost'
    },
    otherCosts: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'other_costs'
    },
    totalCost: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'total_cost'
    },
    totalReceived: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0,
      field: 'total_received'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    routes: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: []
      // Example structure: [{from: "Location A", to: "Location B", date: "2024-01-15"}, ...]
    },
    returnDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'return_date'
    }
  }, {
    tableName: 'trips',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        fields: ['user_id'],
        name: 'idx_trips_user_id'
      },
      {
        fields: ['truck_id'],
        name: 'idx_trips_truck_id'
      },
      {
        fields: ['customer_id'],
        name: 'idx_trips_customer_id'
      },
      {
        fields: ['date'],
        name: 'idx_trips_date'
      }
    ]
  });

  Trip.associate = (models) => {
    // Trip belongs to User
    Trip.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Trip belongs to Truck
    Trip.belongsTo(models.Truck, {
      foreignKey: 'truckId',
      as: 'truck'
    });

    // Trip belongs to Driver
    Trip.belongsTo(models.Driver, {
      foreignKey: 'driverId',
      as: 'driver'
    });

    // Trip belongs to Customer
    Trip.belongsTo(models.Customer, {
      foreignKey: 'customerId',
      as: 'customer'
    });
  };

  return Trip;
};

