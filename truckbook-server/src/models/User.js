import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    companyName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'company_name'
    },
    fullName: {
      type: DataTypes.STRING(255),
      allowNull: false,
      field: 'full_name'
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    verificationCode: {
      type: DataTypes.STRING(5),
      allowNull: true,
      field: 'verification_code'
    },
    isEmailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
      field: 'is_email_verified'
    },
    codeExpiresAt: {
      type: DataTypes.DATE,
      allowNull: true,
      field: 'code_expires_at'
    }
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true
  });

  User.associate = (models) => {
    // User has many Subscriptions
    User.hasMany(models.Subscription, {
      foreignKey: 'userId',
      as: 'subscriptions'
    });

    // User has many Trucks
    User.hasMany(models.Truck, {
      foreignKey: 'userId',
      as: 'trucks'
    });

    // User has many Drivers
    User.hasMany(models.Driver, {
      foreignKey: 'userId',
      as: 'drivers'
    });

    // User has many Customers
    User.hasMany(models.Customer, {
      foreignKey: 'userId',
      as: 'customers'
    });

    // User has many Trips
    User.hasMany(models.Trip, {
      foreignKey: 'userId',
      as: 'trips'
    });
  };

  return User;
};

