const { Transaction, Customer, Product, History } = require("../models");

const getPendingTransactions = async (card) => {
  return await Transaction.findAll({
    where: { card: card, status: 2 },
    include: { model: Product, tableName: "products" },
    order: [["created_at", "ASC"]],
    logging: false,
  });
}

const failToExecute = async (id, msg) => {
  await Transaction.update(
    { reply: msg, status: 0 },
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
module.exports = { getPendingTransactions, failToExecute, updateTransaction };
