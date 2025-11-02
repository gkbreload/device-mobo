const { Transaction, Customer, Product, History } = require("../models");
const { diff_seconds } = require("../helpers/date");

const findWaitingList = async (card) => {
  let msg;
  // status 3 done excuted, wait for reply
  await Transaction.findOne({
    where: { card: card, status: 3 },
    include: { model: Product, tableName: "products" },
    order: [["created_at", "ASC"]],
    logging: false,
  }).then(async (res) => {
    if (res !== null) {
      const done = res.updated_at.getTime();
      const now = new Date().getTime();
      const diff = diff_seconds(now, done);
      await Transaction.findOne({
        where: { card: card, status: 2 },
        include: { model: Product, tableName: "products" },
        order: [["created_at", "ASC"]],
        logging: false,
      }).then(async (res) => {
        if (
          res !== null &&
          res.Product.code.startsWith("delsms") &&
          diff > 10
        ) {
          await Transaction.update(
            { reply: "Transaksi sudah diproses, menunggu balasan provider.", status: 3 },
            { where: { id: res.id }, logging: false }
          );
          msg = { id: res.id, cmd: res.message, msg: "delsms" };
        } else if (
          res !== null &&
          res.Product.code.startsWith("sal") &&
          diff > 10
        ) {
          await Transaction.update(
            { reply: "Transaksi sudah diproses, menunggu balasan provider.", status: 3 },
            { where: { id: res.id }, logging: false }
          );
          msg = { id: res.id, cmd: res.message, msg: "sal" };
        } else if (
          res !== null &&
          !res.Product.code.startsWith("delsms") &&
          !res.Product.code.startsWith("sal") &&
          diff > 10
        ) {
          await Transaction.update(
            { reply: "Transaksi sudah diproses, menunggu balasan provider.", status: 3 },
            { where: { id: res.id }, logging: false }
          );
          msg = { id: res.id, cmd: res.message, msg: "transaction" };
        }
      });
    } else if (res === null) {
      // status 2 wait for excute
      await Transaction.findOne({
        where: { card: card, status: 2 },
        include: { model: Product, tableName: "products" },
        order: [["created_at", "ASC"]],
        logging: false,
      }).then(async (res) => {
        if (res !== null && res.Product.code.startsWith("delsms")) {
          await Transaction.update(
            { reply: "Transaksi sudah diproses, menunggu balasan provider.", status: 3 },
            { where: { id: res.id }, logging: false }
          );
          msg = { id: res.id, cmd: res.message, msg: "delsms" };
        } else if (res !== null && res.Product.code.startsWith("sal")) {
          await Transaction.update(
            { reply: "Transaksi sudah diproses, menunggu balasan provider.", status: 3 },
            { where: { id: res.id }, logging: false }
          );
          msg = { id: res.id, cmd: res.message, msg: "sal" };
        } else if (
          res !== null &&
          !res.Product.code.startsWith("delsms") &&
          !res.Product.code.startsWith("sal")
        ) {
          await Transaction.update(
            { reply: "Transaksi sudah diproses, menunggu balasan provider.", status: 3 },
            { where: { id: res.id }, logging: false }
          );
          msg = { id: res.id, cmd: res.message, msg: "transaction" };
        }
      });
    }
  });

  return msg;
};

const failToExecute = async (id, msg) => {
  await Transaction.update(
    { reply: msg },
    { where: { id: id }, logging: false }
  );
};

const updateTransaction = async (id, msg) => {
  await Transaction.update(
    { reply: msg, status: 1 },
    { where: { id: id }, logging: false }
  ).then(async () => {
    await Transaction.findOne({
      where: { id: id },
      include: { model: Customer, tableName: "customers" },
      logging: false,
    }).then(async (res) => {
      if (res !== null) {
        await History.create(
          {
            name: res.Customer.name,
            message: `${res.card}: ${msg}`,
            mobile: res.sender,
            method: res.method,
            status: "pending",
            flow: "out",
            session: res.receiver,
          },
          { logging: false }
        );
      }
    });
  });
};
module.exports = { findWaitingList, failToExecute, updateTransaction };
