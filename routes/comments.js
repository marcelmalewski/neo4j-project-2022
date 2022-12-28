const express = require("express");
const router = express.Router({ mergeParams: true });
const driver = require("../config/neo4jDriver");
const { handleCommentPostRequest } = require("../utils/commentsUtils");

router.post("/", (req, res) => {
  const session = driver.session();
  //TODO klient z ciasteczka plis autentykacja
  const clientId = 1;
  const bookId = req.params.id;
  const { comment } = req.body;
  const query = `
    MATCH (book:Book {id: '${bookId}'})
    MATCH (client:Client {id: '${clientId}'})
    CREATE (client)-[comment:COMMENTED {comment: '${comment}', date: datetime()}]->(book)
    RETURN comment`;

  handleCommentPostRequest(req, res, query, session);
});

router.post("/not-logged-in-client", (req, res) => {
  const session = driver.session();
  const id = req.params.id;
  const { comment } = req.body;
  const query = `
    MATCH (book:Book {id: '${id}'})
    MATCH (client:Client {name: "Not logged client"})
    CREATE (client)-[comment:COMMENTED {comment: '${comment}', date: datetime()}]->(book)
    RETURN comment`;

  handleCommentPostRequest(req, res, query, session);
});

module.exports = router;
