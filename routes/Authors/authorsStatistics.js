const express = require("express");
const { handleError500 } = require("../../utils/routesUtils");
const { txRead } = require("../../utils/neo4jSessionUtils");
const router = express.Router({ mergeParams: true });
router.get("/5_most_popular_authors", (req, res) => {
  const query = `
        MATCH (a:Author)<-[:WRITTEN_BY]-(b:Book)
        MATCH (:Person)-[r:RATED]->(b)
        WITH a, count(r) as number_of_ratings
        RETURN a, number_of_ratings
        LIMIT 5
        `;

  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      const authors = result.records.map((record) => record.get("a"));
      res.json({ message: "success", data: authors });
    })
    .catch((error) => handleError500(res, error));
});

router.get("/number_of_books_per_author", (req, res) => {
  const query = `
        MATCH (a:Author)<-[:WRITTEN_BY]-(b:Book)
        WITH a, count(b) as number_of_books
        RETURN a.name as author_name, number_of_books
        ORDER by number_of_books DESC
        `;

  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      const statistics = result.records.map((record) => {
        return {
          authorName: record.get("author_name"),
          numberOfBooks: record.get("number_of_books"),
        };
      });
      res.json({ message: "success", data: statistics });
    })
    .catch((error) => handleError500(res, error));
});

module.exports = router;
