const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db_connection");

class Detail_customer extends Model {
  static associate(models) {
    Detail_customer.belongsTo(models.Customer, { foreignKey: "customer_id" });
  }
}
Detail_customer.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    customer_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "customers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "CASCADE",
    },
    mobile: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    xmpp: {
      type: DataTypes.STRING(50),
      allowNull: true,
    },
    telegram: {
      type: DataTypes.STRING(25),
      allowNull: true,
    },
    telegram_id: {
      type: DataTypes.STRING(15),
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "Detail_customer",
    tableName: "detail_customers",
    createdAt: "created_at",
    updatedAt: "updated_at",
    // timestamps: false,
  }
);

module.exports = Detail_customer;
