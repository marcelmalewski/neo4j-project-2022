const express = require("express");
const router = express.Router({ mergeParams: true });
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { txRead } = require("../utils/neo4jSessionUtils");
const { handleNotFound } = require("../utils/routesUtils");
const {
  sendRegisterRequest,
  validPersonParams,
  hashPassword,
} = require("../utils/authUtils");
const { Roles } = require("../consts/consts");
require("dotenv").config();

router.post("/register", validPersonParams, hashPassword, async (req, res) => {
  const { login, name } = req.body;
  const hashedPassword = req.hashedPassword;
  const query = `
    CREATE (person:Person {login: '${login}', name: '${name}', role: '${Roles.CLIENT}', password: '${hashedPassword}'})
    RETURN person
    `;
  const message = `Person Registered`;
  return await sendRegisterRequest(res, query, message);
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
        return res.status(401).send({ message: "Password is incorrect" });
      }
    })
    .catch((error) => {
      res.status(500).send({ message: "error", error: error });
    });
});

module.exports = router;
