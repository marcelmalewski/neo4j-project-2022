const { txWrite } = require("./neo4jSessionUtils");

handleCommentPostRequest = (req, res, query, session) => {
  const writeTxResultPromise = txWrite(session, query);
  writeTxResultPromise
    .then((result) => {
      res.json(
        result.records.map((record) => record.get("comment").properties)
      );
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
};

module.exports = {
  handleCommentPostRequest,
};
