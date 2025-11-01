const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db_connection");

class Customer extends Model {
  static associate(models) {
    Customer.hasMany(models.Detail_customer, { foreignKey: "customer_id" });
    Customer.hasMany(models.Transaction, { foreignKey: "customer_id" });
  }
}
Customer.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    type: {
      type: DataTypes.ENUM,
      values: ["owner", "master"],
      allowNull: false,
      defaultValue: "master",
    },
  },
  {
    sequelize,
    modelName: "Customer",
    tableName: "customers",
    createdAt: "created_at",
    updatedAt: "updated_at",
    // timestamps: false,
  }
);

module.exports = Customer;
