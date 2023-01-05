const express = require("express");
const router = express.Router({ mergeParams: true });
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
require("dotenv").config();

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

router.post("/login", (req, res) => {
  const { login, password } = req.body;
  const query = `MATCH (person:Person {login: '${login}'}) RETURN person`;

  const writeTxResult = txRead(query);
  writeTxResult
    .then(async (result) => {
      if (result.records.length === 0)
        return handleNotFound("Person", "login", login, res);

      const foundPerson = result.records[0].get("person").properties;
      if (await bcrypt.compare(password, foundPerson.password)) {
        const person = {
          login: foundPerson.login,
          role: foundPerson.role,
        };
        const accessToken = jwt.sign(person, process.env.ACCESS_TOKEN_SECRET);
        return res.json({ accessToken: accessToken });
      } else {
        return res
          .status(401)
          .send({ message: "Password or login is incorrect" });
      }
    })
    .catch((error) => {
      res.status(500).send(error);
    });
});

module.exports = router;
