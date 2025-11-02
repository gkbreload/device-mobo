const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Device extends Model {
    static associate(models) {
      Device.belongsTo(models.Supplier, {
        foreignKey: "supplier_id",
      });
    }
  }
  
  Device.init(
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
      supplier_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
        references: {
          model: "suppliers",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      port: {
        type: DataTypes.STRING(25),
        allowNull: true,
      },
      card: {
        type: DataTypes.STRING(15),
        allowNull: true,
      },
      check: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
      },
      status: {
        type: DataTypes.TINYINT(1),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Device",
      tableName: "devices",
      createdAt: "created_at",
      updatedAt: "updated_at",
      // timestamps: false,
    }
  );

  return Device;
}