const express = require("express");
const router = express.Router({ mergeParams: true });
const { handleCommentPostRequest } = require("../utils/commentsUtils");
const { authenticateToken } = require("../utils/routesUtils");
const { txRead } = require("../utils/neo4jSessionUtils");
//TODO edycja komentarza gdy jest to twoj komentarz?

router.get("", (req, res) => {
  const bookUuid = req.params.bookUuid;
  const query = `
        MATCH (:Book {uuid: '${bookUuid}'})<-[c:COMMENTED]-(:Person)
        RETURN c
        `;
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      res.json(result.records.map((record) => record.get("c").properties));
    })
    .catch((error) => res.status(500).send({ message: "error", error: error }));
});

router.post("/", authenticateToken, (req, res) => {
  const comment = req.body.comment;
  const clientLogin = req.person.login;
  const bookUuid = req.params.bookUuid;
  const query = `
    MATCH (book:Book {uuid: '${bookUuid}'})
    MATCH (person:Person {login: '${clientLogin}'})
    CREATE (person)-[comment:COMMENTED {uuid: apoc.create.uuid(), comment: '${comment}', date: datetime()}]->(book)
    RETURN comment`;

  handleCommentPostRequest(req, res, query, bookUuid);
});

router.post("/not-logged-in-client", (req, res) => {
  const comment = req.body.comment;
  const bookUuid = req.params.uuid;
  const query = `
    MATCH (book:Book {uuid: '${bookUuid}'})
    MATCH (person:Person {login: "0"})
    CREATE (person)-[comment:COMMENTED {uuid: apoc.create.uuid(), comment: '${comment}', date: datetime()}]->(book)
    RETURN comment`;

  handleCommentPostRequest(req, res, query, bookUuid);
});

module.exports = router;
