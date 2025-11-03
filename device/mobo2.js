require("dotenv");
const serialportgsm = require("serialport-gsm");
const textHandler = require("../handlers/textHandler");
const {
  getPendingTransactions,
  failToExecute,
  updateTransaction,
} = require("../handlers/transactionHandler");
const card = process.env.MOBO2;

var gsmModem = new serialportgsm.Modem();
let options = {
  baudRate: 115200,
  dataBits: 8,
  parity: "none",
  stopBits: 1,
  xon: false,
  rtscts: false,
  xoff: false,
  xany: false,
  autoDeleteOnReceive: true,
  enableConcatenation: true,
  incomingCallIndication: true,
  incomingSMSIndication: true,
  pin: "",
  customInitCommand: "AT^CURC=0",
  cnmiCommand: "AT+CNMI=2,1,0,2,1",

  logger: console,
};

let phone = {
  name: "mobo1",
  number: "+6281259603326",
  // numberSelf: "+628",
  mode: "PDU",
};

const initialize = function (port) {
  gsmModem.on("open", () => {
    gsmModem.initializeModem((msg, err) => {
      if (err) {
        console.log(`Error Initializing Modem - ${err}`);
      } else {
        console.log(`InitModemResponse: ${JSON.stringify(msg)}`);

        gsmModem.setModemMode((msg, err) => {
          if (err) {
            console.log(`Error Setting Modem Mode - ${err}`);
          } else {
            //   console.log(`Set Mode: ${JSON.stringify(msg)}`);

            gsmModem.getNetworkSignal((result, err) => {
              if (err) {
                console.log(`Error retrieving Signal Strength - ${err}`);
              } else {
                //   console.log(`Signal Strength: ${JSON.stringify(result)}`);
              }
            });

            gsmModem.getModemSerial((result, err) => {
              if (err) {
                console.log(`Error retrieving ModemSerial - ${err}`);
              } else {
                //   console.log(`Modem Serial: ${JSON.stringify(result)}`);
              }
            });

            gsmModem.getOwnNumber((result, err) => {
              if (err) {
                // console.log(`Error retrieving own Number - ${err}`);
              } else {
                // console.log(`Own number: ${JSON.stringify(result)}`);
              }
            });

            // execute a custom command - one line response normally is handled automatically
            gsmModem.executeCommand("AT^GETPORTMODE", (result, err) => {
              if (err) {
                // console.log(`Error - ${err}`);
              } else {
                // console.log(`Result ${JSON.stringify(result)}`);
              }
            });

            // execute a complex custom command - multi line responses needs own parsing logic
            const commandParser = gsmModem.executeCommand(
              "AT^SETPORT=?",
              (result, err) => {
                if (err) {
                  console.log(`Error - ${err}`);
                } else {
                  //   console.log(`Result ${JSON.stringify(result)}`);
                }
              }
            );
            const portList = {};
            commandParser.logic = (dataLine) => {
              if (dataLine.startsWith("^SETPORT:")) {
                const arr = dataLine.split(":");
                portList[arr[1]] = arr[2].trim();
              } else if (dataLine.includes("OK")) {
                return {
                  resultData: {
                    status: "success",
                    request: "executeCommand",
                    data: { result: portList },
                  },
                  returnResult: true,
                };
              } else if (
                dataLine.includes("ERROR") ||
                dataLine.includes("COMMAND NOT SUPPORT")
              ) {
                return {
                  resultData: {
                    status: "ERROR",
                    request: "executeCommand",
                    data: `Execute Command returned Error: ${dataLine}`,
                  },
                  returnResult: true,
                };
              }
            };
          }
        }, phone.mode);

        gsmModem.checkSimMemory((result, err) => {
          if (err) {
            console.log(`Failed to get SimMemory ${err}`);
          } else {
            //   console.log(`Sim Memory Result: ${JSON.stringify(result)}`);

            gsmModem.getSimInbox((result, err) => {
              if (err) {
                console.log(`Failed to get SimInbox ${err}`);
              } else {
                //   console.log(`Sim Inbox Result: ${JSON.stringify(result)}`);
                console.log(result);
              }

              // Finally send an SMS
              // const message = `Hello ${phone.name}, Try again....This message was sent`;
              // gsmModem.sendSMS(phone.number, message, false, (result) => {
              //   console.log(`Callback Send: Message ID: ${result.data[0].messageId},` +
              //       `${result.data.response} To: ${result.data.recipient} ${JSON.stringify(result)}`);
              // });
            });
          }
        });
      }
    });

    gsmModem.on("onNewMessageIndicator", (data) => {
      //indicator for new message only (sender, timeSent)
      // console.log(`Event New Message Indication: ` + JSON.stringify(data));
    });

    gsmModem.on("onNewMessage", async (data) => {
      console.log(data);
      // console.log(`Event New Message: ` + JSON.stringify(data));
      if (
        data[0].sender === "MOBOINDOSAT" &&
        !data[0].message.includes("Alokasi") &&
        data[0].message.includes("TID")
      ) {
        if (data[0].message.includes("Saldo Anda")) {
          textHandler.getSaldo(card, data[0].message);
          return;
        }

        if (data[0].message.includes("SUKSES")) {
          textHandler.getSuccess(card, data[0].message);
          return;
        }

        if (data[0].message.includes("GAGAL")) {
          textHandler.getFailed(card, data[0].message);
          return;
        }
      }
      if (
        data[0].sender === "INDOSAT" &&
        data[0].message.includes("no permission")
      ) {
        // const card = MOBO1;
        // const [modul] = await connection.execute(
        //   `SELECT id, message FROM topups WHERE card = '${card}' AND status = 2`
        // );
        // if (modul.length > 0) {
        //   const tujuan = modul[0].message.match(/\*08\d+/g)[0].replace("*", "");
        //   return gagal(tujuan, data[0].message);
        // }
      }
    });

    gsmModem.on("onSendingMessage", (data) => {
      //whole message data
      // console.log(`Event Sending Message: ` + JSON.stringify(data));
      console.log(data);
    });

    gsmModem.on("onNewIncomingCall", (data) => {
      console.log(`Event Incoming Call: ` + JSON.stringify(data));
    });

    gsmModem.on("onMemoryFull", (data) => {
      console.log(`Event Memory Full: ` + JSON.stringify(data));
    });

    gsmModem.on("close", (data) => {
      //whole message data
      console.log(`Event Close: ` + JSON.stringify(data));
    });
  });

  gsmModem.open(`${port}`, options);
};

const deleteTransaction = function (row) {
  return new Promise((resolve, reject) => {
    gsmModem.deleteAllSimMessages((callback) => {
      let msg;
      if (callback.status == "success") {
        msg = `SMS inbox telah berhasil dihapus`;
        updateTransaction(row.id, msg);
        console.log(`✅ SMS inbox ${card} telah berhasil dihapus.`);
        resolve(callback);
      } else {
        msg = `SMS inbox gagal dihapus`;
        updateTransaction(row.id, msg);
        console.log(`❌ SMS inbox ${card} gagal dihapus.`);
        reject(callback);
      }
    });

    gsmModem.once("error", (err) => {
      console.error(`❌ Modem gagal untuk ID ${id}:`, err.message);
      reject(err);
    });
  });
};
const checkBalance = function (row) {
  return new Promise((resolve, reject) => {
    gsmModem.executeCommand(`AT+CUSD=1,"${row.message}",15`, (callback) => {
      let cb = callback.data.result;
      if (cb === " 4" || cb.includes("coba") || cb.includes("sementara")) {
        failToExecute(row.id, cb);
      }

      if (callback.status == "success") {
        console.log(`✅ Cek saldo ${card} selesai, tunggu balasan dari provider.`);
        resolve(callback);
      } else {
        console.log(`❌ Cek saldo ${card} gagal diproses.`);
        reject(callback);
      }
    });

    gsmModem.once("error", (err) => {
      console.error(`❌ Modem gagal untuk ID ${id}:`, err.message);
      reject(err);
    });
  });
};

const transaction = function (row) {
  return new Promise((resolve, reject) => {
    gsmModem.executeCommand(`AT+CUSD=1,"${row.message}",15`, (callback) => {
      const cb = callback.data.result;
      if (cb === " 4" || cb?.includes("coba") || cb?.includes("sementara")) {
        failToExecute(row.id, cb);
      }

      if (callback.status == "success") {
        console.log(`✅ Transaksi ${card} selesai, tunggu balasan dari provider.`);
        resolve(callback);
      } else {
        console.log(`❌ Transaksi ${card} gagal diproses.`);
        reject(callback);
      }
    });

    gsmModem.once("error", (err) => {
      console.error(`❌ Modem gagal untuk ID ${id}:`, err.message);
      reject(err);
    });
  });
};

let isProcessing = false;
let queue = [];

async function processTransaction(row) {
  const id = row.id;
  // console.log(`🔄 Memproses transaksi ID ${id}...`);
  await Transaction.update(
    {
      reply: "Transaksi sudah diproses...",
      status: 3,
    },
    { where: { id: id }, logging: false }
  );

  await new Promise((resolve) => setTimeout(resolve, 2000));
  console.log(`🔌 Modem mulai memproses untuk ID ${id}...`);

  if (row.Product.code.startsWith("delsms")) {
    await deleteTransaction(row);
  } else if (row.Product.code.startsWith("sal")) {
    await checkBalance(row);
  } else {
    await transaction(row);
  }
}

async function processQueue() {
  if (queue.length === 0) {
    isProcessing = false;
    startWatcher(card);
    return;
  }

  const row = queue.shift();
  await processTransaction(row);
  await processQueue(); // lanjut ke item berikutnya
}

async function processing(card) {
  if (isProcessing) return; // berhenti watch saat sedang proses

  const rows = await getPendingTransactions(card);
  if (rows.length === 0) return;

  queue = rows;
  isProcessing = true;
  await processQueue();
}

async function startWatcher(card) {
  if (!isProcessing) {
    setTimeout(startWatcher, 3000, card);
  }
  // console.log(`🚀 Watcher ${card} aktif...`);
  return await processing(card);
}

startWatcher(card);

module.exports = { initialize };
