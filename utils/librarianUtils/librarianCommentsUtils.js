const { txRead } = require("../neo4jSessionUtils");
const checkIfCommentWithGivenUuidExists = (req, res, next) => {
  const commentUuid = req.params.commentUuid;

  const query = `
        MATCH (:Person)-[c:COMMENTED {uuid: '${commentUuid}'}]->(:Book)
        RETURN c
        `;
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleNotFound("Comment", "uuid", commentUuid, res);

      next();
    })
    .catch((error) => res.status(500).send(error));
};

module.exports = {
  checkIfCommentWithGivenUuidExists,
};
