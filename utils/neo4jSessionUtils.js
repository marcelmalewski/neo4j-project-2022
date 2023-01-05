const driver = require("../config/neo4jDriver");
const txRead = async (query, params) => {
  const session = driver.session();
  try {
    return await session.executeRead((tx) => tx.run(query, params));
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
};

const txWrite = async (query, params) => {
  const session = driver.session();
  try {
    return await session.executeWrite((tx) => tx.run(query, params));
  } catch (error) {
    throw error;
  } finally {
    await session.close();
  }
};

module.exports = {
  txRead,
  txWrite,
};
