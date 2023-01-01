const express = require("express");
const router = express.Router({ mergeParams: true });
const driver = require("../config/neo4jDriver");
const { txWrite } = require("../utils/neo4jSessionUtils");
const {
  authenticateToken,
  checkIfBookWithGivenUuidExists,
  handleInvalidQueryParameter,
} = require("../utils/routesUtils");
const {
  isRatingValid,
  isExpiryDateValid,
  checkIfBookIsAlreadyRated,
} = require("../utils/ratingsUtils");
//TODO dodac updatowanie oceny

router.post(
  "/",
  authenticateToken,
  checkIfBookWithGivenUuidExists,
  checkIfBookIsAlreadyRated,
  (req, res) => {
    const { rating, expiryDate } = req.body;

    if (!isRatingValid(rating))
      return handleInvalidQueryParameter(res, "rating", rating);

    if (!isExpiryDateValid(expiryDate))
      return handleInvalidQueryParameter(res, "expiryDate", expiryDate);

    const session = driver.session();
    const bookUuid = req.params.uuid;
    const personLogin = req.person.login;
    const parsedExpiryDate =
      expiryDate === undefined ? null : `date('${expiryDate}')`;
    const query = `
    MATCH (book:Book {uuid: '${bookUuid}'})
    MATCH (person:Person {login: '${personLogin}'})
    CREATE (person)-[rated:RATED {rating: ${rating}, expiry_date: ${parsedExpiryDate}}]->(book)
    RETURN rated`;

    const writeTxResult = txWrite(session, query);
    writeTxResult
      .then((result) => {
        res.json(result.records[0].get("rated").properties);
      })
      .catch((error) => res.status(500).send(error))
      .then(() => session.close());
  }
);

module.exports = router;
