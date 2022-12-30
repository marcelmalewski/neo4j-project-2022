const { isParamEmpty } = require("./routesUtils");
const driver = require("../config/neo4jDriver");
const { txWrite } = require("./neo4jSessionUtils");
const { Roles } = require("./consts");

const isLoginValid = (login) => {
  if (isParamEmpty(login)) return false;

  return login.length > 3;
};

const isNameValid = (name) => {
  if (isParamEmpty(name)) return false;

  return name.split(" ").length === 2;
};

const isPasswordValid = (password) => {
  if (isParamEmpty(password)) return false;

  return password.length > 8;
};

const sendRegisterRequest = async (res, login, name, hashedPassword) => {
  const session = driver.session();
  const query = `
    CREATE (person:Person {login: '${login}', name: '${name}', role: '${Roles.CLIENT}', password: '${hashedPassword}'})
    RETURN person
    `;

  const writeTxResult = txWrite(session, query);
  writeTxResult
    .then((result) => {
      return res.status(201).json(result.records[0].get("person").properties);
    })
    .catch((error) => {
      if (error.code === "Neo.ClientError.Schema.ConstraintValidationFailed")
        return res.status(400).send({ message: "Login is already used." });

      res.status(500).send(error);
    })
    .then(() => session.close());
};

module.exports = {
  isLoginValid,
  isNameValid,
  isPasswordValid,
  sendRegisterRequest,
};
