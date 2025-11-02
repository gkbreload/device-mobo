const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class History extends Model {}
  
  History.init(
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
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      mobile: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
      method: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["whatsapp", "telegram", "xmpp"],
        defaultValue: "telegram",
      },
      status: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["pending", "sent", "received"],
        defaultValue: "received",
      },
      flow: {
        type: DataTypes.ENUM,
        allowNull: false,
        values: ["in", "out"],
        defaultValue: "in",
      },
      session: {
        type: DataTypes.STRING(25),
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "History",
      tableName: "histories",
      createdAt: "created_at",
      updatedAt: "updated_at",
      // timestamps: false,
    }
  );

  return History;
}