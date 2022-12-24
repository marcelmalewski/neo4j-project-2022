const txRead = (session, query, params) => {
  return session.readTransaction((tx) => tx.run(query, params));
};

const txWrite = (session, query, params) => {
  return session.writeTransaction((tx) => tx.run(query, params));
};

module.exports = {
  txRead,
  txWrite,
};
