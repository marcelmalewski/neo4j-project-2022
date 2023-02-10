const { txRead } = require("./neo4jSessionUtils");
const { handleError500 } = require("./routesUtils");
const handleSimpleAuthorsGetQuery = (res, query) => {
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      const data = result.records.map((record) => record.get("a").properties);
      res.json({ message: "success", data: data });
    })
    .catch((error) => handleError500(res, error));
};

module.exports = {
  handleSimpleAuthorsGetQuery,
};
