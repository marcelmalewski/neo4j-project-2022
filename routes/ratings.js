const express = require("express");
const router = express.Router({ mergeParams: true });
const { txWrite } = require("../utils/neo4jSessionUtils");
const {
  authenticateToken,
  handleInvalidQueryParameter,
  handleNotFound,
} = require("../utils/routesUtils");
const {
  isRatingValid,
  isExpiryDateValid,
  checkIfBookIsAlreadyRated,
} = require("../utils/ratingsUtils");
//TODO dodac updatowanie oceny

router.post("/", authenticateToken, checkIfBookIsAlreadyRated, (req, res) => {
  const { rating, expiryDate } = req.body;

  if (!isRatingValid(rating))
    return handleInvalidQueryParameter(res, "rating", rating);

  if (!isExpiryDateValid(expiryDate))
    return handleInvalidQueryParameter(res, "expiryDate", expiryDate);

  const bookUuid = req.params.uuid;
  const personLogin = req.person.login;
  const parsedExpiryDate =
    expiryDate === undefined ? null : `date('${expiryDate}')`;
  const query = `
    MATCH (book:Book {uuid: '${bookUuid}'})
    MATCH (person:Person {login: '${personLogin}'})
    CREATE (person)-[rated:RATED {rating: ${rating}, expiry_date: ${parsedExpiryDate}}]->(book)
    RETURN rated`;

  const writeTxResult = txWrite(query);
  writeTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleNotFound("Book", "uuid", bookUuid, res);

      res.json(result.records[0].get("rated").properties);
    })
    .catch((error) => res.status(500).send(error));
});

//TODO jezeli updatuje ocene to powody braku rezultaty mogą być wiec middlewary

module.exports = router;
