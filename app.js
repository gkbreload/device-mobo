require("dotenv").config();
const connection = require("./db_connection");
// const mobo1 = require("./device/mobo1");
// const mobo2 = require("./device/mobo2");
// const startHandler = require("./handlers/startHandler");
// const { textHandler } = require("./handlers/textHandler");
// require("./auto");
const device_mobo1 = require("./device/mobo1");
// const device_mobo2 = require("./device/mobo2");
// const textHandler = require("./handlers/textHandler");
// const card = process.env.MOBO1;

connection
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
    // const text0 =
    //   "Aktivasi Paket  Freedom Internet 3GB/28hr, No 6285735394919 Rp 20,100.00 SUKSES, Saldo:Rp 653,545.00, TID:03841900031760239239.";
    // const text =
    //   "Isi Voucher Regular 5K seharga Rp 7,100.00 pada 10/07/25 09:49 ke 6285735394919 SUKSES, Saldo: Rp 593,095.00, TID:03843800031785366228.";
    // const text1 =
    //   "Isi Voucher Regular 5K seharga Rp 5,000.00 pada 08/07/25 14:34 ke 6285735394919 GAGAL, MSISDN tidak bisa diverifikasi, TID:03841400031761536434.";
    // textHandler.getSaldo(card, text);
    // textHandler.getSuccess(card, text);
    // textHandler.getFailed(card, text1);

    // const bot = new Telegraf(BOT_TOKEN);
    // bot.start(startHandler);
    // bot.help(helpHandler);
    // bot.on("text", textHandler);
    // bot.launch();

    // console.log("Bot sedang berjalan...");
    // exports.bot = bot;
    device_mobo1.initialize(process.env.PORT1);
    // device_mobo2.initialize(process.env.PORT2);
  })
  .catch((error) => console.error("Unable to connect to the database:", error));
