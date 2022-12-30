const neo4j = require("neo4j-driver");
require("dotenv").config();

const dbConnData = {
  uri: process.env.NEO4J_URI,
  user: process.env.NEO4J_USER,
  password: process.env.NEO4J_PASSWORD,
};

const driver = neo4j.driver(
  dbConnData.uri,
  neo4j.auth.basic(dbConnData.user, dbConnData.password),
  {
    maxTransactionRetryTime: 30000,
  }
);

module.exports = driver;
