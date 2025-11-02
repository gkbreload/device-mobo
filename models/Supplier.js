const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Supplier extends Model {
    static associate(models) {
      Supplier.hasMany(models.Transaction, {
        foreignKey: "supplier_id",
      });
      Supplier.hasMany(models.Device, {
        foreignKey: "supplier_id",
      });
    }
  }
  
  Supplier.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      pin: {
        type: DataTypes.STRING(6),
        allowNull: false,
      },
      center: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      type: {
        type: DataTypes.STRING(15),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Supplier",
      tableName: "suppliers",
      createdAt: "created_at",
      updatedAt: "updated_at",
      // timestamps: false,
    }
  );
  
  return Supplier;
}