const neo4j = require('neo4j-driver')

const dbConnData = {
    uri: process.env.NEO4J_URI || 'bolt://localhost:7687',
    user: process.env.NEO4J_USER || 'testneo4j',
    password: process.env.NEO4J_PASSWORD || 'test1234',
};

const driver = neo4j.driver(dbConnData.uri, neo4j.auth.basic(dbConnData.user, dbConnData.password), {
    maxTransactionRetryTime: 30000
})

module.exports = driver;