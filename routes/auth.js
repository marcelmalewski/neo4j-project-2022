const express = require("express");
const router = express.Router({ mergeParams: true });
const driver = require("../config/neo4jDriver");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { txRead } = require("../utils/neo4jSessionUtils");
const {
  handleNotFound,
  handleInvalidQueryParameter,
} = require("../utils/routesUtils");
const {
  isLoginValid,
  isNameValid,
  isPasswordValid,
  sendRegisterRequest,
} = require("../utils/authUtils");

router.post("/register", async (req, res) => {
  const { login, name, password } = req.body;
  if (!isLoginValid(login))
    return handleInvalidQueryParameter(res, "login", login);

  if (!isNameValid(name)) return handleInvalidQueryParameter(res, "name", name);

  if (!isPasswordValid(password))
    return handleInvalidQueryParameter(res, "password", password);

  try {
    const salt = await bcrypt.genSalt();
    const hashedPassword = await bcrypt.hash(req.body.password, salt);
    return await sendRegisterRequest(res, login, name, hashedPassword);
  } catch {
    res.status(500).send();
  }
});

router.post("/login", async (req, res) => {
  const session = driver.session();
  const { login, password } = req.body;
  const query = `MATCH (person:Person {login: '${login}'}) RETURN person`;

  const writeTxResult = txRead(session, query);
  writeTxResult
    .then(async (result) => {
      if (result.records.length === 0)
        return handleNotFound("Person", "login", login);

      const foundPerson = result.records[0].get("person").properties;
      //TODO stestowac czy jak cos sie wytwali to jak zareaguje catch nizej
      if (await bcrypt.compare(password, foundPerson.password)) {
        //success
      } else {
        return res
          .status(401)
          .send({ message: "Password or login is incorrect" });
      }
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());

  const client = "clientData";
});

module.exports = router;
