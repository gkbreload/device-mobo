const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.hasMany(models.Transaction, { foreignKey: "product_id" });
    }
  }
  
  Product.init(
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        autoIncrement: true,
        primaryKey: true,
        allowNull: false,
      },
      code: {
        type: DataTypes.STRING(10),
        allowNull: false,
      },
      price: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false,
      },
      command: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Product",
      tableName: "products",
      createdAt: "created_at",
      updatedAt: "updated_at",
      // timestamps: false,
    }
  );

  return Product;
}