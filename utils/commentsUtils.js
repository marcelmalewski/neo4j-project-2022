const { txWrite } = require("./neo4jSessionUtils");
const { isParamEmpty, handleInvalidQueryParameter } = require("./routesUtils");

const handleCommentPostRequest = (req, res, query) => {
  const comment = req.body.comment;
  if (isCommentValid(comment))
    return handleInvalidQueryParameter(res, "comment", comment);

  const writeTxResult = txWrite(query);
  writeTxResult
    .then((result) => {
      res.json(
        result.records.map((record) => record.get("comment").properties)
      );
    })
    .catch((error) => res.status(500).send(error));
};

const isCommentValid = (comment) => {
  if (isParamEmpty(comment)) return false;
  return comment.length < 100;
};

module.exports = {
  handleCommentPostRequest,
};
