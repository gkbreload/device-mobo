const { Op } = require("sequelize");
const { Product, Transaction, Customer, History } = require("../models");

class TextHandler {
  static async getSaldo(card, text) {
    const balance = text.match(/(\Rp )[\d,]+/g)[0].replace(/[\D]/g, "");

    await Product.findOne({
      where: { code: "sal mobo" },
      include: {
        model: Transaction,
        tableName: "transactions",
        where: { card: card, status: 3 },
        include: { model: Customer, tableName: "customers" },
      },
      order: [["Transactions", "created_at", "ASC"]],
      logging: false,
    }).then(async (res) => {
      if (res === null) return;
      const id_trans = res?.Transactions[0]?.id;
      await Transaction.update(
        { reply: text, balance: balance, status: 1 },
        { where: { id: id_trans }, logging: false }
      );

      await History.create(
        {
          name: res?.Transactions[0].Customer.name,
          message: `${card}: ${text}`,
          mobile: res?.Transactions[0]?.sender,
          method: res?.Transactions[0]?.method,
          status: "pending",
          flow: "out",
          session: res?.Transactions[0]?.receiver,
        },
        { logging: false }
      );
    });
  }
  static async getSuccess(card, text) {
    let price, balance, tujuan, sn;
    if (!text.includes("Aktivasi")) {
      price = text.match(/(\harga Rp )[\d,]+/g)[0].replace(/[\D]/g, "");
      balance = text.match(/(\Saldo: Rp )[\d,]+/g)[0].replace(/[\D]/g, "");
      tujuan = text.match(/(\ke )\d+/g)[0].replace(/[\D]/g, "");
      tujuan = "0" + tujuan.substring(2);
      sn = text.match(/(\TID:)\d+/g)[0].replace(/[\D]/g, "");
    } else if (text.includes("Aktivasi")) {
      price = text.match(/\ Rp [\d,]+/g)[0].replace(/\D/g, "");
      balance = text.match(/\ Saldo:Rp [\d,]+/g)[0].replace(/\D/g, "");
      tujuan = text.match(/ No \d+/g)[0].replace(/\D/g, "");
      tujuan = "0" + tujuan.substring(2);
      sn = text.match(/(\TID:)\d+/g)[0].replace(/[\D]/g, "");
    }

    Transaction.belongsTo(Customer, {
      foreignKey: "customer_id",
    });
    Transaction.belongsTo(Product, {
      foreignKey: "product_id",
    });

    await Transaction.findOne({
      where: { message: { [Op.like]: `%${tujuan}%` }, card: card, status: 3 },
      include: [
        { model: Customer, tableName: "customers" },
        { model: Product, tableName: "products" },
      ],
      order: [["created_at", "ASC"]],
      logging: false,
    }).then(async (res) => {
      if (res === null) return;
      let msg_owner;
      const id_trans = res?.id;
      const diff = parseInt(price) - parseInt(res?.price);
      if (diff > 0) {
        msg_owner = `Mobo: Harga ${
          res?.Product.code
        } naik ${diff.toLocaleString("id-ID")}`;
      } else if (diff < 0) {
        msg_owner = `Mobo: Harga ${
          res?.Product.code
        } turun ${diff.toLocaleString("id-ID")}`;
      }

      await Transaction.update(
        { reply: text, diff: diff, balance: balance, status: 1 },
        { where: { id: id_trans }, logging: false }
      );

      const msg_success = `${card}: #${res?.id} ${
        res?.Product.code
      } ke ${tujuan} Berhasil Saldo ${Number(balance).toLocaleString(
        "id-ID"
      )} hrg ${Number(price).toLocaleString(
        "id-ID"
      )} SN:<${sn}>, MoboGresik @${res?.created_at.toLocaleString("id-ID")}`;

      await History.create(
        {
          name: res?.Customer.name,
          message: `${msg_success}`,
          mobile: res?.sender,
          method: res?.method,
          status: "pending",
          flow: "out",
          session: res?.receiver,
        },
        { logging: false }
      );

      if (diff !== 0) {
        await History.create(
          {
            name: "Price Change",
            message: `${msg_owner}`,
            mobile: "6677933557",
            method: "telegram",
            status: "pending",
            flow: "out",
            session: "mobogresik_bot",
          },
          { logging: false }
        );
      }
    });
  }
  static async getFailed(card, text) {
    let tujuan;
    if (!text.includes("Aktivasi")) {
      tujuan = text.match(/(\ke )\d+/g)[0].replace(/[\D]/g, "");
    } else if (text.includes("Aktivasi")) {
      tujuan = text.match(/(\ No )\d+/g)[0].replace(/[\D]/g, "");
    }
    tujuan = "0" + tujuan.substring(2);

    Transaction.belongsTo(Customer, {
      foreignKey: "customer_id",
    });
    Transaction.belongsTo(Product, {
      foreignKey: "product_id",
    });

    await Transaction.findOne({
      where: { message: { [Op.like]: `%${tujuan}%` }, card: card, status: 3 },
      include: [
        { model: Customer, tableName: "customers" },
        { model: Product, tableName: "products" },
      ],
      order: [["created_at", "ASC"]],
      logging: false,
    }).then(async (res) => {
      if (res === null) return;
      const id_trans = res?.id;
      await Transaction.update(
        { reply: text, status: 0 },
        { where: { id: id_trans }, logging: false }
      );

      let msg_failed;
      if (!text.includes("tidak bisa diverifikasi")) {
        msg_failed = `${card}: #${res?.id} ${
          res?.Product.code
        }.${tujuan} GAGAL. MoboGresik @${res?.created_at.toLocaleString(
          "id-ID"
        )}`;
      } else {
        msg_failed = `${card}: #${res?.id} ${
          res?.Product.code
        }.${tujuan} no_salah GAGAL. MoboGresik @${res?.created_at.toLocaleString(
          "id-ID"
        )}`;
      }

      await History.create(
        {
          name: res?.Customer.name,
          message: `${msg_failed}`,
          mobile: res?.sender,
          method: res?.method,
          status: "pending",
          flow: "out",
          session: res?.receiver,
        },
        { logging: false }
      );
    });
  }
}

module.exports = TextHandler;
