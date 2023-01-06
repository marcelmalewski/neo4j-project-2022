const { isParamEmpty, handleInvalidQueryParameter } = require("./routesUtils");
const { txWrite } = require("./neo4jSessionUtils");
const bcrypt = require("bcrypt");

const isLoginValid = (login) => {
  if (isParamEmpty(login) || login === "Not logged client") return false;

  return login.length > 3 && login.length < 20;
};

const isNameValid = (name) => {
  if (isParamEmpty(name)) return false;

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

const sendRegisterRequest = async (res, query, message) => {
  const writeTxResult = txWrite(query);
  writeTxResult
    .then(() => {
      return res.status(201).json({ message: message });
    })
    .catch((error) => {
      if (error.code === "Neo.ClientError.Schema.ConstraintValidationFailed")
        return res.status(400).send({ message: "Login is already used." });

      res.status(500).send({ message: "error", error: error });
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

module.exports = {
  isLoginValid,
  isNameValid,
  isPasswordValid,
  sendRegisterRequest,
  validPersonParams,
  hashPassword,
};
