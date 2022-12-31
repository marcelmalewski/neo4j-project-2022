const express = require("express");
const router = express.Router({ mergeParams: true });
const driver = require("../config/neo4jDriver");
const { handleCommentPostRequest } = require("../utils/commentsUtils");
const {
  authenticateToken,
  isParamEmpty,
  handleInvalidQueryParameter,
} = require("../utils/routesUtils");

router.post("/", authenticateToken, (req, res) => {
  const comment = req.body.comment;
  if (isParamEmpty(comment))
    return handleInvalidQueryParameter(res, "comment", comment);

  const session = driver.session();
  const clientLogin = req.person.login;
  const bookUuid = req.params.uuid;
  const query = `
    MATCH (book:Book {uuid: '${bookUuid}'})
    MATCH (person:Person {login: '${clientLogin}'})
    CREATE (person)-[comment:COMMENTED {comment: '${comment}', date: datetime()}]->(book)
    RETURN comment`;

  handleCommentPostRequest(req, res, query, session, bookUuid);
});

router.post("/not-logged-in-client", (req, res) => {
  const comment = req.body.comment;
  if (isParamEmpty(comment))
    return handleInvalidQueryParameter(res, "comment", comment);

  const session = driver.session();
  const bookUuid = req.params.uuid;
  const query = `
    MATCH (book:Book {uuid: '${bookUuid}'})
    MATCH (person:Person {login: "0"})
    CREATE (person)-[comment:COMMENTED {comment: '${comment}', date: datetime()}]->(book)
    RETURN comment`;

  handleCommentPostRequest(req, res, query, session, bookUuid);
});

module.exports = router;
