import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Truck = sequelize.define('Truck', {
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
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    plateNumber: {
      type: DataTypes.STRING(50),
      allowNull: false,
      field: 'plate_number'
    }
  }, {
    tableName: 'trucks',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['user_id', 'plate_number'],
        name: 'unique_plate_per_user'
      }
    ]
  });

  Truck.associate = (models) => {
    // Truck belongs to User
    Truck.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Truck has many Trips
    Truck.hasMany(models.Trip, {
      foreignKey: 'truckId',
      as: 'trips'
    });
  };

  return Truck;
};

