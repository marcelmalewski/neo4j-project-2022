const express = require("express");
const router = express.Router({ mergeParams: true });
const driver = require("../../config/neo4jDriver");
const { txWrite } = require("../../utils/neo4jSessionUtils");
//TODO dodac updatowanie oceny
router.post("/", (req, res) => {
  //TODO walidacja gdy juz stworzyl swoją ocene to error
  const session = driver.session();
  const clientId = "5";
  const bookId = req.params.id;
  const rating = req.body.rating;
  const expiryDate =
    req.body.expiryDate === undefined
      ? null
      : `datetime('${req.body.expiryDate}')`;
  const query = `
    MATCH (book:Book {id: '${bookId}'})
    MATCH (client:Client {id: '${clientId}'})
    CREATE (client)-[rated:RATED {rating: ${rating}, expiry_date: ${expiryDate}}]->(book)
    RETURN rated`;

  const writeTxResultPromise = txWrite(session, query);
  writeTxResultPromise
    .then((result) => {
      res.json(result.records[0].get("rated").properties);
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

module.exports = router;
