const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db_connection");

class Transaction extends Model {
  static associate(models) {
    Transaction.belongsTo(models.Customer, {
      foreignKey: "customer_id",
    });
    Transaction.belongsTo(models.Supplier, {
      foreignKey: "supplier_id",
    });
    Transaction.belongsTo(models.Product, {
      foreignKey: "product_id",
    });
  }
}
Transaction.init(
  {
    id: {
      type: DataTypes.STRING(10),
      primaryKey: true,
      unique: true,
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
      onDelete: "RESTRIC",
    },
    supplier_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "suppliers",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    product_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: "products",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "RESTRICT",
    },
    message: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    reply: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    price: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    diff: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    balance: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0,
    },
    card: {
      type: DataTypes.STRING(15),
      allowNull: false,
    },
    status: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
      defaultValue: 2,
    },
    sender: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    receiver: {
      type: DataTypes.STRING(25),
      allowNull: false,
    },
    method: {
      type: DataTypes.ENUM,
      allowNull: false,
      values: ["whatsapp", "telegram", "xmpp"],
    },
  },
  {
    sequelize,
    modelName: "Transaction",
    tableName: "transactions",
    createdAt: "created_at",
    updatedAt: "updated_at",
    // timestamps: false,
  }
);

module.exports = Transaction;
