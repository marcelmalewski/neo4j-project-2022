const { Roles } = require("../../consts/consts");
const { txRead } = require("../neo4jSessionUtils");
const { handleNotFound, handleError500 } = require("../routesUtils");

const roleIsValid = (role) => {
  return (
    role !== undefined && (role === Roles.CLIENT || role === Roles.LIBRARIAN)
  );
};

const checkIfPersonWithGivenLoginExists = (req, res, next) => {
  const login = req.params.login;

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
    .catch((error) => handleError500(res, error));
};

module.exports = {
  roleIsValid,
  checkIfPersonWithGivenLoginExists,
};
