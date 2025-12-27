import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Driver = sequelize.define('Driver', {
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
    }
  }, {
    tableName: 'drivers',
    timestamps: true,
    underscored: true
  });

  Driver.associate = (models) => {
    // Driver belongs to User
    Driver.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Driver has many Trips
    Driver.hasMany(models.Trip, {
      foreignKey: 'driverId',
      as: 'trips'
    });
  };

  return Driver;
};

