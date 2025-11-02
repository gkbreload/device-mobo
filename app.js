require("dotenv").config();
const connection = require("./db_connection");
const device_mobo1 = require("./device/mobo1");
// const device_mobo2 = require("./device/mobo2");

connection
  .authenticate()
  .then(() => {
    console.log("Connection has been established successfully.");
  })
  .then(() => {
    device_mobo1.initialize(process.env.PORT1);
    // device_mobo2.initialize(process.env.PORT2);
  })
  .catch((error) => console.error("Unable to connect to the database:", error));
