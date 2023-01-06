const express = require("express");
const {
  authenticateToken,
  authenticateRoleForLibrarian,
  handleInvalidQueryParameter,
  handleNotFound,
} = require("../../utils/routesUtils");
const { isCommentValid } = require("../../utils/commentsUtils");
const { txWrite } = require("../../utils/neo4jSessionUtils");
const {
  checkIfCommentWithGivenUuidExists,
} = require("../../utils/librarianUtils/librarianCommentsUtils");
const router = express.Router({ mergeParams: true });
router.put(
  "/:commentUuid",
  authenticateToken,
  authenticateRoleForLibrarian,
  (req, res) => {
    const comment = req.body.comment;
    if (isCommentValid(comment))
      return handleInvalidQueryParameter(res, "comment", comment);

    const commentUuid = req.params.commentUuid;
    const query = `
    MATCH (:Person)-[c:COMMENTED {uuid: '${commentUuid}'}]->(:Book)
    SET c.comment = '${comment}'
    RETURN c`;

    const writeTxResult = txWrite(query);
    writeTxResult
      .then((result) => {
        if (result.records.length === 0)
          return handleNotFound("Comment", "uuid", commentUuid, res);

        res.json(result.records.map((record) => record.get("c").properties));
      })
      .catch((error) =>
        res.status(500).send({ message: "error", error: error })
      );
  }
);

router.delete(
  "/:commentUuid",
  authenticateToken,
  authenticateRoleForLibrarian,
  checkIfCommentWithGivenUuidExists,
  (req, res) => {
    const commentUuid = req.params.commentUuid;
    const query = `
        MATCH (:Person)-[c:COMMENTED {uuid: '${commentUuid}'}]->(:Book)
        DELETE c`;

    const writeTxResult = txWrite(query);
    writeTxResult
      .then(() => {
        res.json({ message: "Comment deleted" });
      })
      .catch((error) =>
        res.status(500).send({ message: "error", error: error })
      );
  }
);

module.exports = router;
