import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const Subscription = sequelize.define('Subscription', {
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
    planType: {
      type: DataTypes.ENUM('starter', 'large-fleet'),
      allowNull: false,
      field: 'plan_type'
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'expired', 'pending'),
      defaultValue: 'inactive'
    },
    startDate: {
      type: DataTypes.DATEONLY,
      field: 'start_date'
    },
    endDate: {
      type: DataTypes.DATEONLY,
      field: 'end_date'
    },
    // Flutterwave fields
    flutterwaveSubscriptionId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'flutterwave_subscription_id'
    },
    flutterwavePlanId: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'flutterwave_plan_id'
    },
    paymentReference: {
      type: DataTypes.STRING(255),
      allowNull: true,
      field: 'payment_reference'
    },
    nextPaymentDate: {
      type: DataTypes.DATEONLY,
      allowNull: true,
      field: 'next_payment_date'
    }
  }, {
    tableName: 'subscriptions',
    timestamps: true,
    underscored: true
  });

  Subscription.associate = (models) => {
    // Subscription belongs to User
    Subscription.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Subscription;
};

