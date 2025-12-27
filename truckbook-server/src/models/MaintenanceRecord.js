import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const MaintenanceRecord = sequelize.define('MaintenanceRecord', {
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
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    },
    date: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'maintenance_records',
    timestamps: true,
    underscored: true
  });

  MaintenanceRecord.associate = (models) => {
    // MaintenanceRecord belongs to User
    MaintenanceRecord.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // MaintenanceRecord belongs to Truck
    MaintenanceRecord.belongsTo(models.Truck, {
      foreignKey: 'truckId',
      as: 'truck'
    });
  };

  return MaintenanceRecord;
};

