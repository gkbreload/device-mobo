const options = {
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: "mysql",
  logging: process.env.NODE_ENV === "development" ? console.log : false,
  pool: {
    max: 10,
    min: 2,
    acquire: 30000,
    idle: 10000,
  },
  migrationStorageTableName: "migrations",
};

if (process.env.NODE_ENV === "production") {
  options.dialectOptions = {
    ssl: {
      // require: true,
      rejectUnauthorized: true,
    },
  };
}

module.exports = {
  development: {
    ...options,
    logging: console.log,
  },
  test: {
    ...options,
    logging: false,
  },
  production: options,
};
