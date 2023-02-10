const express = require("express");
const { txRead } = require("../utils/neo4jSessionUtils");
const { handleError500, authenticateToken } = require("../utils/routesUtils");
const router = express.Router({ mergeParams: true });

router.get("/who-rated-books-you-rated", authenticateToken, (req, res) => {
  const personLogin = req.person.login;
  const query = `
    MATCH (p:Person {login: '${personLogin}'})
    CALL apoc.neighbors.athop(p, "RATED", 2)
    YIELD node
    RETURN node
    `;

  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      const data = result.records.map(
        (record) => record.get("node").properties
      );
      res.json({ message: "success", data: data });
    })
    .catch((error) => handleError500(res, error));
});

module.exports = router;
