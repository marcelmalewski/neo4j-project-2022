const { txWrite } = require("./neo4jSessionUtils");
const { isParamEmpty, handleInvalidQueryParameter } = require("./routesUtils");
const driver = require("../config/neo4jDriver");

const handleCommentPostRequest = (req, res, query) => {
  const comment = req.body.comment;
  if (isParamEmpty(comment))
    return handleInvalidQueryParameter(res, "comment", comment);

  const session = driver.session();
  const writeTxResult = txWrite(session, query);
  writeTxResult
    .then((result) => {
      res.json(
        result.records.map((record) => record.get("comment").properties)
      );
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
};

const isCommentValid = (comment) => {
  if (isParamEmpty(comment)) return false;
  return comment.length < 100;
};

module.exports = {
  handleCommentPostRequest,
  isCommentValid,
};
