const express = require("express");
const { txRead } = require("../../utils/neo4jSessionUtils");
const { handleError500 } = require("../../utils/routesUtils");
const router = express.Router({ mergeParams: true });

router.get("/number_of_comments_per_book", (req, res) => {
  const query = `
        MATCH (b:Book)<-[c:COMMENTED]-(:Person)
        WITH b, count(c) as number_of_comments
        RETURN b.title as book_title, number_of_comments
        ORDER by number_of_comments DESC
        `;
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      const statistics = result.records.map((record) => {
        return {
          book: record.get("book_title"),
          numberOfComments: record.get("number_of_comments"),
        };
      });
      res.json({ message: "success", data: statistics });
    })
    .catch((error) => handleError500(res, error));
});

module.exports = router;
