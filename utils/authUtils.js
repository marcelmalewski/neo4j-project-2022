const {
  isParamEmpty,
  handleInvalidQueryParameter,
  handleError500,
  handleNotFound,
} = require("./routesUtils");
const { txWrite, txRead } = require("./neo4jSessionUtils");
const bcrypt = require("bcrypt");
const { NotLoggedPerson, ReservationState } = require("../consts/consts");

const isLoginValid = (login) => {
  if (isParamEmpty(login)) return false;

  return login.length > 3 && login.length < 20;
};

const isNameValid = (name) => {
  if (isParamEmpty(name) || name === NotLoggedPerson.NAME) return false;

  return name.split(" ").length === 2 && name.length < 20;
};

const isPasswordValid = (password) => {
  if (isParamEmpty(password)) return false;

  return password.length > 8 && password.length < 20;
};

const validPersonParams = (req, res, next) => {
  const { login, name, password } = req.body;
  if (!isLoginValid(login))
    return handleInvalidQueryParameter(res, "login", login);

  if (!isNameValid(name)) return handleInvalidQueryParameter(res, "name", name);

  if (!isPasswordValid(password))
    return handleInvalidQueryParameter(res, "password", password);

  next();
};

const sendRegisterRequest = async (res, query, message, login) => {
  const writeTxResult = txWrite(query);
  writeTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleNotFound("Person", "login", login, res);

      res.status(201).send({
        message: message,
      });
    })
    .catch((error) => {
      if (error.code === "Neo.ClientError.Schema.ConstraintValidationFailed")
        return res.status(400).send({ message: "Login is already used." });

      handleError500(res, error);
    });
};

const hashPassword = async (req, res, next) => {
  const password = req.body.password;
  try {
    const salt = await bcrypt.genSalt();
    req.hashedPassword = await bcrypt.hash(password, salt);
    next();
  } catch {
    return res
      .status(500)
      .send({ message: "error", error: "Error while hashing password" });
  }
};

const checkIfPersonDoNotHaveRentedBookWithLoginWrapper = (getParamLogin) => {
  return (req, res, next) => {
    let personLogin = "";
    if (getParamLogin) personLogin = req.params.login;
    else personLogin = req.person.login;

    const query = `
    MATCH (:Book)<-[reserved:RESERVED]-(:Person {login: '${personLogin}'})
    WHERE reserved.state = '${ReservationState.RENTED_OUT}' 
    RETURN reserved
    `;
    const readTxResult = txRead(query);
    readTxResult
      .then((result) => {
        if (result.records.length > 0)
          return res.status(400).send({
            message: `Person with login: '${personLogin}' have reservation with state: '${ReservationState.RENTED_OUT}'.`,
          });

        next();
      })
      .catch((error) => handleError500(res, error));
  };
};

module.exports = {
  isLoginValid,
  isNameValid,
  isPasswordValid,
  sendRegisterRequest,
  validPersonParams,
  hashPassword,
  checkIfPersonDoNotHaveRentedBookWithLoginWrapper,
};
