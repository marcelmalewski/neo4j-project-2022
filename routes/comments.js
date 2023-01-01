const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  handleCommentPostRequest,
  isCommentValid,
} = require("../utils/commentsUtils");
const {
  authenticateToken,
  isParamEmpty,
  handleInvalidQueryParameter,
  checkIfBookWithGivenUuidExists,
} = require("../utils/routesUtils");

router.post(
  "/",
  authenticateToken,
  checkIfBookWithGivenUuidExists,
  (req, res) => {
    const comment = req.body.comment;
    if (!isCommentValid(comment))
      return handleInvalidQueryParameter(res, "comment", comment);

    const clientLogin = req.person.login;
    const bookUuid = req.params.uuid;
    const query = `
    MATCH (book:Book {uuid: '${bookUuid}'})
    MATCH (person:Person {login: '${clientLogin}'})
    CREATE (person)-[comment:COMMENTED {comment: '${comment}', date: datetime()}]->(book)
    RETURN comment`;

    handleCommentPostRequest(req, res, query);
  }
);

router.post(
  "/not-logged-in-client",
  checkIfBookWithGivenUuidExists,
  (req, res) => {
    const comment = req.body.comment;
    if (isParamEmpty(comment))
      return handleInvalidQueryParameter(res, "comment", comment);

    const bookUuid = req.params.uuid;
    const query = `
    MATCH (book:Book {uuid: '${bookUuid}'})
    MATCH (person:Person {login: "0"})
    CREATE (person)-[comment:COMMENTED {comment: '${comment}', date: datetime()}]->(book)
    RETURN comment`;

    handleCommentPostRequest(req, res, query);
  }
);

module.exports = router;
