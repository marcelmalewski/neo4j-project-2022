const express = require("express");
const router = express.Router({ mergeParams: true });
const {
  handleCommentPostRequest,
  isCommentValid,
  checkIfCommentExistsAndIsYours,
} = require("../../utils/commentsUtils");
const {
  authenticateToken,
  checkIfBookWithGivenUuidExists,
  handleError500,
  handleInvalidQueryParameter,
} = require("../../utils/routesUtils");
const { txRead, txWrite } = require("../../utils/neo4jSessionUtils");

router.get(
  "/books/:bookUuid/comments",
  checkIfBookWithGivenUuidExists,
  (req, res) => {
    const bookUuid = req.params.bookUuid;
    const query = `
        MATCH (:Book {uuid: '${bookUuid}'})<-[c:COMMENTED]-(:Person)
        RETURN c
        `;
    const readTxResult = txRead(query);
    readTxResult
      .then((result) => {
        const data = result.records.map((record) => record.get("c").properties);
        res.json({ message: "success", data: data });
      })
      .catch((error) => handleError500(res, error));
  }
);

router.patch("/books/:bookUuid/comments", authenticateToken, (req, res) => {
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

router.put(
  "/comments/:commentUuid",
  authenticateToken,
  checkIfCommentExistsAndIsYours,
  (req, res) => {
    const comment = req.body.comment;
    const commentUuid = req.params.commentUuid;
    if (!isCommentValid(comment))
      return handleInvalidQueryParameter(res, "comment", comment);

    const query = `
    MATCH (:Person)-[comment:COMMENTED {uuid: '${commentUuid}'}]->(:Book)
    SET comment.comment = '${comment}'
    RETURN comment`;
    const writeTxResult = txWrite(query);
    writeTxResult
      .then((result) => {
        const data = result.records[0].get("comment").properties;
        res.json({ message: "success", data: data });
      })
      .catch((error) => handleError500(res, error));
  }
);

router.post("/books/:bookUuid/comments/not-logged-in-person", (req, res) => {
  const comment = req.body.comment;
  const bookUuid = req.params.bookUuid;
  const query = `
    MATCH (book:Book {uuid: '${bookUuid}'})
    MATCH (person:Person {login: "1"})
    CREATE (person)-[comment:COMMENTED {uuid: apoc.create.uuid(), comment: '${comment}', date: datetime()}]->(book)
    RETURN comment`;

  handleCommentPostRequest(req, res, query, bookUuid);
});

router.delete(
  "/comments/:commentUuid",
  authenticateToken,
  checkIfCommentExistsAndIsYours,
  (req, res) => {
    const commentUuid = req.params.commentUuid;
    const query = `
    MATCH (:Person)-[comment:COMMENTED {uuid: '${commentUuid}'}]->(:Book)
    DELETE comment
    `;
    const writeTxResult = txWrite(query);
    writeTxResult
      .then(() => {
        res.json({ message: "Comment deleted" });
      })
      .catch((error) => handleError500(res, error));
  }
);

module.exports = router;
