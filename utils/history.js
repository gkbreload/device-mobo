const { History } = require("../models");

async function createHistory(data) {
  const {
    name,
    message,
    mobile,
    method,
    status,
    session,
    transaction_id,
    msg,
  } = data;

  await History.create(
    {
      name: name,
      message: message,
      mobile: mobile,
      method: method,
      status: status[0],
      flow: "in",
      session: session,
      transaction_id: transaction_id,
    },
    { logging: false }
  );
  await History.create(
    {
      name: name,
      message: msg,
      mobile: mobile,
      method: method,
      status: status[1],
      flow: "out",
      session: session,
      transaction_id: transaction_id,
    },
    { logging: false }
  );
}

module.exports = { createHistory };
