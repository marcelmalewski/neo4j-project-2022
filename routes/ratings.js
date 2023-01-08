const express = require("express");
const router = express.Router({ mergeParams: true });
const { txWrite } = require("../utils/neo4jSessionUtils");
const {
  authenticateToken,
  handleNotFound,
  checkIfBookWithGivenUuidExists,
} = require("../utils/routesUtils");
const {
  checkIfBookIsAlreadyRated,
  validateRatingParams,
  checkIfThisRatingExistsAndIsYours,
  deleteExpiredRatings,
} = require("../utils/ratingsUtils");

router.get(
  "/books/:bookUuid/ratings",
  checkIfBookWithGivenUuidExists,
  deleteExpiredRatings,
  (req, res) => {
    const bookUuid = req.params.bookUuid;
    const query = `
        MATCH (:Book {uuid: '${bookUuid}'})<-[r:RATED]-(:Person)
        WHERE r.expiry_date >= date() 
        RETURN r`;

    const readTxResult = txWrite(query);
    readTxResult
      .then((result) => {
        res.json(result.records.map((record) => record.get("r").properties));
      })
      .catch((error) =>
        res.status(500).send({ message: "error", error: error })
      );
  }
);

router.post(
  "/books/:bookUuid/ratings",
  authenticateToken,
  checkIfBookIsAlreadyRated,
  validateRatingParams,
  (req, res) => {
    const { rating, expiryDate } = req.body;

    const bookUuid = req.params.bookUuid;
    const personLogin = req.person.login;
    const parsedExpiryDate =
      expiryDate === undefined ? null : `date('${expiryDate}')`;
    const query = `
    MATCH (book:Book {uuid: '${bookUuid}'})
    MATCH (person:Person {login: '${personLogin}'})
    CREATE (person)-[rated:RATED {uuid: apoc.create.uuid() ,rating: ${rating}, expiry_date: ${parsedExpiryDate}}]->(book)
    RETURN rated`;

    const writeTxResult = txWrite(query);
    writeTxResult
      .then((result) => {
        if (result.records.length === 0)
          return handleNotFound("Book", "uuid", bookUuid, res);

        res.json(result.records[0].get("rated").properties);
      })
      .catch((error) =>
        res.status(500).send({ message: "error", error: error })
      );
  }
);

router.put(
  "/ratings/:ratingUuid",
  authenticateToken,
  checkIfThisRatingExistsAndIsYours,
  validateRatingParams,
  (req, res) => {
    const { rating, expiryDate } = req.body;
    const ratingUuid = req.params.ratingUuid;
    const parsedExpiryDate =
      expiryDate === undefined ? null : `date('${expiryDate}')`;

    const query = `
        MATCH (:Book)<-[r:RATED {uuid: '${ratingUuid}'}]-(:Person)
        SET r.rating = ${rating}, r.expiry_date = ${parsedExpiryDate}
        RETURN r`;

    const writeTxResult = txWrite(query);
    writeTxResult
      .then((result) => {
        res.json(result.records[0].get("r").properties);
      })
      .catch((error) =>
        res.status(500).send({ message: "error", error: error })
      );
  }
);

module.exports = router;
