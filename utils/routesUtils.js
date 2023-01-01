const jwt = require("jsonwebtoken");
const driver = require("../config/neo4jDriver");
const { txRead } = require("./neo4jSessionUtils");

const handleNotFound = (name, withWhat, withWhatValue, res) => {
  return res.status(400).send({
    message: `${name} with ${withWhat}: '${withWhatValue}' not found.`,
  });
};

const handleInvalidQueryParameter = (res, parameterName, parameterValue) => {
  return res.status(400).send({
    message: `Invalid query parameter: ${parameterName} with value: '${parameterValue}'.`,
  });
};

const isParamEmpty = (param) => {
  return param === undefined || param.trim() === "";
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token === null)
    return res.status(401).send({ message: "jwt is not present" });

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, person) => {
    if (err) return res.sendStatus(403);
    req.person = person;
    next();
  });
};

const checkIfBookWithGivenUuidExists = (req, res, next) => {
  const bookUuid = req.params.uuid;
  const query = `
    MATCH (book:Book {uuid: '${bookUuid}'})
    RETURN book
    `;

  const session = driver.session();
  const readTxResult = txRead(session, query);
  readTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleNotFound("Book", "uuid", bookUuid, res);

      next();
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
};

module.exports = {
  handleNotFound,
  isParamEmpty,
  handleInvalidQueryParameter,
  authenticateToken,
  checkIfBookWithGivenUuidExists,
};
