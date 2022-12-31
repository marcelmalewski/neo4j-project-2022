const express = require("express");
const router = express.Router({ mergeParams: true });
const driver = require("../config/neo4jDriver");
const { txRead } = require("../utils/neo4jSessionUtils");
const { authenticateToken } = require("../utils/routesUtils");
const { sendRatingRequest } = require("../utils/ratingsUtils");
//TODO dodac updatowanie oceny
router.post("/", authenticateToken, (req, res) => {
  const session = driver.session();
  const bookUuid = req.params.uuid;
  const personLogin = req.person.login;
  const query = `
    MATCH (:Book {uuid: '${bookUuid}'})<-[rated:RATED]-(:Person {login: '${personLogin}'})
    RETURN rated
    `;

  const readTxResult = txRead(session, query);
  readTxResult
    .then((result) => {
      if (result.records.length > 0)
        return res
          .status(400)
          .send({ message: `You already rated book with uuid: '${bookUuid}'` });

      return sendRatingRequest(
        req.body.rating,
        req.body.expiryDate,
        bookUuid,
        personLogin,
        res
      );
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

module.exports = router;
