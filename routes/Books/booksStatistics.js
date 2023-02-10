const express = require("express");
const { txRead } = require("../../utils/neo4jSessionUtils");
const { handleError500 } = require("../../utils/routesUtils");
const router = express.Router({ mergeParams: true });

router.get("/basic-statistics", (req, res) => {
  const query = `
    MATCH (b:Book)
    WITH 
      count(b) as number_of_all_books,
      min(b.release_date) as earliestRelease,
      max(b.release_date) as latestRelease,
      round(avg(size(b.description)), 2) as avgDescriptionLength
    RETURN
      number_of_all_books,
      earliestRelease,
      latestRelease,
      avgDescriptionLength
    `;
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      const statistics = {
        numberOfAllBooks: result.records[0].get("number_of_all_books"),
        earliestRelease: result.records[0].get("earliestRelease"),
        latestRelease: result.records[0].get("latestRelease"),
        avgDescriptionLength: result.records[0].get("avgDescriptionLength"),
      };
      res.json({ message: "success", data: statistics });
    })
    .catch((error) => handleError500(res, error));
});

router.get("/year-of-publication", (req, res) => {
  const query = `
    MATCH (:Book)-[:YEAR_OF_PUBLICATION]->(y:Year)
    WITH apoc.agg.statistics(y.year, [0.1, 0.5]) AS stats
    UNWIND keys(stats) AS key
    RETURN key, stats[key] AS value
  `;
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      const stats = {};
      result.records.map((record) => {
        stats[record.get("key")] = record.get("value");
      });
      res.json({ message: "success", data: stats });
    })
    .catch((error) => handleError500(res, error));
});

router.get("/number_of_books_per_year", (req, res) => {
  const query = `
    MATCH (b:Book)-[:YEAR_OF_PUBLICATION]->(y:Year)
    WITH y.year AS year, count(b) AS number_of_books
    RETURN year, number_of_books
    ORDER BY number_of_books DESC
  `;
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      const data = result.records.map((record) => ({
        year: record.get("year"),
        numberOfBooks: record.get("number_of_books"),
      }));
      res.json({ message: "success", data: data });
    })
    .catch((error) => handleError500(res, error));
});

module.exports = router;
