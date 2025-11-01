const Product = require("../models/Product");
const Supplier = require("../models/Supplier");
const Device = require("../models/Device");
const History = require("../models/History");
const Transaction = require("../models/Transaction");

async function getMobo(userID, resCust, receiver, sender, message, m, method) {
  Supplier.hasMany(Device, {
    foreignKey: "supplier_id",
  });
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
    .then(async () => {
      let code = m[0];
      await Product.findOne({
        where: { code: code },
        logging: false,
      })
        .then(async (resProd) => {
          if (resProd !== null) {
            let price = resProd?.price;
            let trans = `${resProd?.command}*${m[1]}*${m[2]}#`;
            await Supplier.findOne({
              where: { center: receiver },
              include: {
                model: Device,
                tableName: "devices",
                where: { check: 0, status: 1 },
                logging: false,
              },
              logging: false,
            }).then(async (resSup) => {
              const device = resSup?.Devices[0]?.name;
              if (device !== undefined) {
                await Transaction.create(
                  {
                    id: m[4],
                    customer_id: resCust?.customer_id,
                    supplier_id: resSup?.id,
                    product_id: resProd?.id,
                    message: trans,
                    price: Number(price),
                    card: device.toLowerCase(),
                    sender: userID,
                    receiver: receiver,
                    method: method,
                  },
                  { logging: false }
                )
                  .then(async () => {
                    await Device.update(
                      { check: 0 },
                      {
                        where: { card: device.toLowerCase().match(/[a-z]+/g) },
                        logging: false,
                      }
                    );
                    await Device.update(
                      { check: 1 },
                      {
                        where: { name: device },
                        logging: false,
                      }
                    );
                  })
                  .catch((error) => {
                    console.error("Error fetching create transaction:", error);
                  });
              }
              //   resSup?.Devices?.forEach(async (resDev) => {
              //     console.log({ Device: resDev });
              //   });
            });
          }
        })
        .catch((error) => {
          console.error("Error fetching find All history:", error);
        });
    })
    .catch((error) => {
      console.error("Error fetching create history:", error);
    });

  const mobo = await Device.findOne({
    where: { name: "mobo" },
    logging: false,
  });
  return mobo;
}

module.exports = { getMobo };
