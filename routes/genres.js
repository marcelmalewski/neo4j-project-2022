const express = require("express");
const { txRead } = require("../utils/neo4jSessionUtils");
const { handleError500 } = require("../utils/routesUtils");
const router = express.Router({ mergeParams: true });

router.get("/all-genres-as-string", (req, res) => {
  const query = `
    MATCH (g:Genre)
    WITH collect(
        apoc.text.capitalize(
            apoc.text.clean(
                g.name
        ))) as genres
    RETURN
     apoc.text.join
    (genres, ', ') as genres
    `;

  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      const data = result.records[0].get("genres");
      res.json({ message: "success", data: data });
    })
    .catch((error) => handleError500(res, error));
});

router.get("/number_of_books_per_genre", (req, res) => {
  const query = `
    MATCH (b:Book)-[:HAS_GENRE]->(g:Genre)
    RETURN g.name as genre, count(b) as numberOfBooks
    ORDER BY numberOfBooks DESC
    `;

  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      const statistics = result.records.map((record) => {
        return {
          genre: record.get("genre"),
          numberOfBooks: record.get("numberOfBooks"),
        };
      });
      res.json({ message: "success", data: statistics });
    })
    .catch((error) => handleError500(res, error));
});

module.exports = router;
