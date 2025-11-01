const { Model, DataTypes } = require("sequelize");
const sequelize = require("../db_connection");

class Menu extends Model {}
Menu.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
      allowNull: false,
    },
    menu: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    category: {
      type: DataTypes.TINYINT(1),
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Menu",
    tableName: "menus",
    createdAt: "created_at",
    updatedAt: "updated_at",
    // timestamps: false,
  }
);

module.exports = Menu;
