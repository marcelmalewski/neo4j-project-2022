const express = require("express");
const router = express.Router({ mergeParams: true });
const { handleCommentPostRequest } = require("../utils/commentsUtils");
const { authenticateToken } = require("../utils/routesUtils");

router.post("/", authenticateToken, (req, res) => {
  const comment = req.body.comment;
  const clientLogin = req.person.login;
  const bookUuid = req.params.uuid;
  const query = `
    MATCH (book:Book {uuid: '${bookUuid}'})
    MATCH (person:Person {login: '${clientLogin}'})
    CREATE (person)-[comment:COMMENTED {comment: '${comment}', date: datetime()}]->(book)
    RETURN comment`;

  handleCommentPostRequest(req, res, query, bookUuid);
});

router.post("/not-logged-in-client", (req, res) => {
  const comment = req.body.comment;
  const bookUuid = req.params.uuid;
  const query = `
    MATCH (book:Book {uuid: '${bookUuid}'})
    MATCH (person:Person {login: "0"})
    CREATE (person)-[comment:COMMENTED {comment: '${comment}', date: datetime()}]->(book)
    RETURN comment`;

  handleCommentPostRequest(req, res, query, bookUuid);
});

module.exports = router;
