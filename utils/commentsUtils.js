const { txWrite, txRead } = require("./neo4jSessionUtils");
const {
  isParamEmpty,
  handleInvalidQueryParameter,
  handleNotFound,
  handleError500,
} = require("./routesUtils");

const handleCommentPostRequest = (req, res, query, bookUuid) => {
  const comment = req.body.comment;
  if (!isCommentValid(comment))
    return handleInvalidQueryParameter(res, "comment", comment);

  const writeTxResult = txWrite(query);
  writeTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleNotFound("Book", "uuid", bookUuid, res);

      const data = result.records[0].get("comment").properties;
      res.json({ message: "success", data: data });
    })
    .catch((error) => handleError500(res, error));
};

const checkIfCommentExistsAndIsYours = (req, res, next) => {
  const commentUuid = req.params.commentUuid;
  const personLogin = req.person.login;
  const query = `
    MATCH (p:Person)-[:COMMENTED {uuid: '${commentUuid}'}]->(:Book)
    RETURN p`;

  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleNotFound("Comment", "uuid", commentUuid, res);

      const person = result.records[0].get("p").properties;
      if (person.login !== personLogin)
        return res.status(401).send({
          message: `You can only edit your own comment`,
        });

      next();
    })
    .catch((error) => handleError500(res, error));
};

const isCommentValid = (comment) => {
  if (isParamEmpty(comment)) return false;
  return comment.length <= 100;
};

module.exports = {
  handleCommentPostRequest,
  isCommentValid,
  checkIfCommentExistsAndIsYours,
};
