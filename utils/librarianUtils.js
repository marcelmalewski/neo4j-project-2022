const { isParamEmpty, handleInvalidQueryParameter } = require("./routesUtils");
const { txRead } = require("./neo4jSessionUtils");
const driver = require("../config/neo4jDriver");

const checkIfAuthorsAreValid = (req, res, next) => {
  const { authors } = req.body;
  const numberOfAuthors = authors.length;

  if (numberOfAuthors === 0)
    return handleInvalidQueryParameter(res, "authors", authors);

  const session = driver.session();
  const query = "MATCH (a:Author) WHERE a.name IN $authors RETURN a";
  const readTxResult = txRead(session, query, { authors });
  readTxResult
    .then((result) => {
      if (result.records.length !== numberOfAuthors)
        return handleInvalidQueryParameter(res, "authors", authors);

      next();
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
};

const checkIfPublishingHouseIsValid = (req, res, next) => {
  const { publishingHouse } = req.body;

  if (isParamEmpty(publishingHouse))
    return handleInvalidQueryParameter(res, "publishingHouse", publishingHouse);

  const session = driver.session();
  const query = `MATCH (ph:PublishingHouse) WHERE ph.name = ${publishingHouse} RETURN ph`;

  const readTxResult = txRead(session, query);
  readTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleInvalidQueryParameter(
          res,
          "publishingHouse",
          publishingHouse
        );

      next();
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
};

module.exports = {
  checkIfAuthorsAreValid,
  checkIfPublishingHouseIsValid,
};
