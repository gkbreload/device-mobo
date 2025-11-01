require("dotenv").config();
const telegram = require("./bot");
const History = require("./models/History");
const method = process.env.METHOD;
const session = process.env.SESSION;

const mainFunc = () => {
  const getMessage = setInterval(async () => {
    await History.findAll({
      where: { method: method, status: "pending", session: session },
      logging: false,
    })
      .then(async (res) => {
        if (res !== null) {
          clearInterval(getMessage);
          for (let i = 0; i < res.length; i++) {
            await telegram.bot.telegram.sendMessage(
              res[i].mobile,
              res[i].message
            );
            await History.update(
              { status: "sent" },
              { where: { id: res[i].id }, logging: false }
            );
            console.log({
              To: res[i].mobile,
              Message: res[i].message,
              Sender: res[i].session,
              Status: "sent",
            });
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching find All history:", error);
      });

    // console.log({ date: new Date().toLocaleString("id-ID") });
    mainFunc();
  }, 2000);
};

mainFunc();
