const { Op } = require("sequelize");
const History = require("../models/History");
const Device = require("../models/Device");
const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const Transaction = require("../models/Transaction");

/**
 * Get user's menu
 * @param {object} user - User object
 * @returns {Promise<number>} menu of the user
 */
async function getMenu(userID, resCust, receiver, sender, message, method) {
  await History.create(
    {
      name: resCust?.Customer?.name,
      message: message,
      mobile: sender,
      method: method,
      status: "received",
      flow: "in",
      session: receiver,
    },
    { logging: false }
  )
    .then(async (resHist) => {
      let code;
      const transaction = message.split(" ")[0] || message.split(".")[0];
      const item = message.split(" ")[1] || message.split(".")[1];
      if (transaction === "sal" && item.includes("mobo")) {
        code = "sal mobo";
      } else if (transaction === "delsms" && item.includes("mobo")) {
        code = "delsms mobo";
      } else if (transaction === "start") {
        await Device.update(
          { status: 1 },
          { where: { name: item }, logging: false }
        ).then(async () => {
          console.log({
            To: sender,
            Message: `Device ${item} berhasil diaktifkan.`,
            Sender: receiver,
            Status: "sent",
          });
          await History.create(
            {
              name: resCust?.Customer?.name,
              message: `Device ${item} berhasil diaktifkan.`,
              mobile: userID,
              method: method,
              status: "pending",
              flow: "out",
              session: receiver,
            },
            { logging: false }
          );
        });
      } else if (transaction === "stop") {
        await Device.update(
          { status: 0 },
          { where: { name: item }, logging: false }
        ).then(async () => {
          console.log({
            To: sender,
            Message: `Device ${item} berhasil dinon-aktifkan.`,
            Sender: receiver,
            Status: "sent",
          });
          await History.create(
            {
              name: resCust?.Customer?.name,
              message: `Device ${item} berhasil dinon-aktifkan.`,
              mobile: userID,
              method: method,
              status: "pending",
              flow: "out",
              session: receiver,
            },
            { logging: false }
          );
        });
      } else if (transaction === "status") {
        await Supplier.findOne({
          where: { center: receiver },
          logging: false,
        }).then(async (resSup) => {
          await Device.findAll({
            where: { card: item, supplier_id: resSup.id },
            logging: false,
          }).then(async (resDev) => {
            let msg = "";
            resDev.map((dev) => {
              msg += `Device ${dev.name} status: ${
                dev.status === 1 ? "ON" : "OFF"
              }\n`;
            });

            console.log({
              To: sender,
              Message: msg,
              Sender: receiver,
              Status: "sent",
            });
            History.create(
              {
                name: resCust?.Customer?.name,
                message: msg,
                mobile: userID,
                method: method,
                status: "pending",
                flow: "out",
                session: receiver,
              },
              { logging: false }
            );
          });
        });
      } else if (transaction === "fail") {
        await Transaction.update(
          { status: 0 },
          { where: { status: { [Op.in]: [2, 3] }, card: item }, logging: false }
        ).then(async () => {
          console.log({
            To: sender,
            Message: `Transaksi tunggu berhasil digagalkan.`,
            Sender: receiver,
            Status: "sent",
          });
          await History.create(
            {
              name: resCust?.Customer?.name,
              message: `Transaksi tunggu berhasil digagalkan.`,
              mobile: userID,
              method: method,
              status: "pending",
              flow: "out",
              session: receiver,
            },
            { logging: false }
          );
        });
      } else if (transaction === "wait") {
        await Transaction.findAll({
          where: { status: { [Op.in]: [2, 3] } },
          logging: false,
        }).then(async (resTrx) => {
          let msg = "Transaksi tunggu:\n\n";
          resTrx.map((trx) => {
            msg += `kartu: ${trx.card}\n`;
          });
          console.log({
            To: sender,
            Message: msg,
            Sender: receiver,
            Status: "sent",
          });
          await History.create(
            {
              name: resCust?.Customer?.name,
              message: msg,
              mobile: userID,
              method: method,
              status: "pending",
              flow: "out",
              session: receiver,
            },
            { logging: false }
          );
        });
      } else if (transaction === "delhis") {
        await History.destroy({
          where: { created_at: { [Op.gt]: new Date(item) } },
          logging: false,
        })
          .then(async (del) => {
            console.log({
              To: sender,
              Message: `${del - 1} history berhasil dihapus.`,
              Sender: receiver,
              Status: "sent",
            });

            await History.create(
              {
                name: resCust?.Customer?.name,
                message: `${del - 1} history berhasil dihapus.`,
                mobile: userID,
                method: method,
                status: "pending",
                flow: "out",
                session: receiver,
              },
              { logging: false }
            );
          })
          .catch((error) => {
            console.error("Error fetching delete history:", error);
          });
      } else if (transaction === "deltrx") {
        await Transaction.destroy({
          where: { created_at: { [Op.gt]: new Date(item) } },
          logging: false,
        })
          .then(async (del) => {
            console.log({
              To: sender,
              Message: `${del - 1} transaksi berhasil dihapus.`,
              Sender: receiver,
              Status: "sent",
            });

            await History.create(
              {
                name: resCust?.Customer?.name,
                message: `${del - 1} transaksi berhasil dihapus.`,
                mobile: userID,
                method: method,
                status: "pending",
                flow: "out",
                session: receiver,
              },
              { logging: false }
            );
          })
          .catch((error) => {
            console.error("Error fetching delete transaksi:", error);
          });
      }

      if (transaction === "sal" || transaction === "delsms") {
        const [device, product] = await Promise.all([
          Device.findOne({ where: { name: item }, logging: false }),
          Product.findOne({ where: { code: code }, logging: false }),
        ]);

        await Transaction.create(
          {
            id: resHist?.id + "h",
            customer_id: resCust?.customer_id,
            supplier_id: device?.supplier_id,
            product_id: product?.id,
            message: product?.command,
            card: item,
            sender: userID,
            receiver: receiver,
            method: method,
          },
          { logging: false }
        ).catch((error) => {
          console.error("Error fetching create transaction:", error);
        });
      }
    })
    .catch((error) => {
      console.error("Error fetching create history:", error);
    });
}

module.exports = { getMenu };
