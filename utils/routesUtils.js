const jwt = require("jsonwebtoken");
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

module.exports = {
  handleNotFound,
  isParamEmpty,
  handleInvalidQueryParameter,
  authenticateToken,
};
