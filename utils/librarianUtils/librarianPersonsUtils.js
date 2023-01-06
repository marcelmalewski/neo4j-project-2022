const { Roles } = require("../../consts/consts");
const { txRead } = require("../neo4jSessionUtils");
const { handleNotFound } = require("../routesUtils");

const roleIsValid = (role) => {
  return (
    role !== undefined && (role === Roles.CLIENT || role === Roles.LIBRARIAN)
  );
};

const checkIfPersonWithGivenLoginExists = (req, res, next) => {
  const login = req.param.login;

  const query = `
        MATCH (p:Person {login: '${login}'})
        RETURN p
        `;
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleNotFound("Person", "login", login, res);

      next();
    })
    .catch((error) => res.status(500).send({ message: "error", error: error }));
};

module.exports = {
  roleIsValid,
  checkIfPersonWithGivenLoginExists,
};
