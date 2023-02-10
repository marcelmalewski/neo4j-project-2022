const express = require("express");
const { handleError500 } = require("../../utils/routesUtils");
const { txRead } = require("../../utils/neo4jSessionUtils");
const { handleSimpleAuthorsGetQuery } = require("../../utils/authorsUtils");
const router = express.Router({ mergeParams: true });

router.get("/by-publishing-house/:publishingHouseName", (req, res) => {
  const publishingHouseName = req.params.publishingHouseName;
  const query = `
    MATCH (:PublishingHouse {name: '${publishingHouseName}'})<-[:PUBLISHED_BY]-(:Book)-[:WRITTEN_BY]->(a:Author)
    RETURN a
   `;
  handleSimpleAuthorsGetQuery(res, query);
});

router.get("/unique-names", (req, res) => {
  const query = `
    MATCH (a:Author)
    WITH apoc.text.split(a.name, ' ')[0] as first_name
    WITH collect(first_name) as first_names
    WITH apoc.convert.toSet(first_names) as unique_first_names
    RETURN unique_first_names
   `;
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      const data = result.records[0].get("unique_first_names");
      res.json({ message: "success", data: data });
    })
    .catch((error) => handleError500(res, error));
});

module.exports = router;
