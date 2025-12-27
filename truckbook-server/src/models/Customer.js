import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Customer = sequelize.define('Customer', {
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
    tableName: 'customers',
    timestamps: true,
    underscored: true
  });

  Customer.associate = (models) => {
    // Customer belongs to User
    Customer.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });

    // Customer has many Trips
    Customer.hasMany(models.Trip, {
      foreignKey: 'customerId',
      as: 'trips'
    });
  };

  return Customer;
};

