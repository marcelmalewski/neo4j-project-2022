const { txWrite } = require("./neo4jSessionUtils");
const { handleNotFound } = require("./routesUtils");

handleCommentPostRequest = (req, res, query, session, uuid) => {
  const writeTxResult = txWrite(session, query);
  writeTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleNotFound("Book", "uuid", uuid);

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
