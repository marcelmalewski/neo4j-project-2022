const express = require("express");
const router = express.Router({ mergeParams: true });
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { txRead, txWrite } = require("../utils/neo4jSessionUtils");
const {
  handleNotFound,
  handleError500,
  authenticateToken,
} = require("../utils/routesUtils");
const {
  sendRegisterRequest,
  validPersonParams,
  hashPassword,
  checkIfPersonDoNotHaveRentedBookWithLoginWrapper,
} = require("../utils/authUtils");
const { Roles } = require("../consts/consts");
require("dotenv").config();

router.get("/password-suggestion", (req, res) => {
  const query = `
    RETURN apoc.text.random(20, "A-Za-z0-9?!.%") AS password_suggestion;
  `;
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      const data = result.records[0].get("password_suggestion");
      res.json({ message: "success", data: data });
    })
    .catch((error) => handleError500(res, error));
});

router.post("/register", validPersonParams, hashPassword, async (req, res) => {
  const { login, name } = req.body;
  const hashedPassword = req.hashedPassword;
  const query = `
    CREATE (person:Person {login: '${login}', name: '${name}', role: '${Roles.CLIENT}', password: '${hashedPassword}'})
    RETURN person
    `;
  const message = `Person Registered`;
  return await sendRegisterRequest(res, query, message, login);
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
      if (foundPerson.password === undefined)
        return handleNotFound("Person", "login", login, res);

      if (await bcrypt.compare(password, foundPerson.password)) {
        const person = {
          login: foundPerson.login,
          role: foundPerson.role,
        };
        const accessToken = jwt.sign(person, process.env.ACCESS_TOKEN_SECRET);
        return res.json({ message: "success", accessToken: accessToken });
      } else {
        return res.status(401).send({ message: "Password is incorrect" });
      }
    })
    .catch((error) => handleError500(res, error));
});

router.put(
  "/account",
  authenticateToken,
  validPersonParams,
  hashPassword,
  (req, res) => {
    const personLogin = req.person.login;
    const { login, name } = req.body;
    const newHashedPassword = req.hashedPassword;

    const query = `
    MATCH (person:Person {login: '${personLogin}'})
    SET person.login = '${login}', person.name = '${name}', person.password = '${newHashedPassword}'
    RETURN person
    `;

    const writeTxResult = txWrite(query);
    writeTxResult
      .then((result) => {
        const foundPerson = result.records[0].get("person").properties;
        let newAccessToken = null;

        if (personLogin !== login) {
          const person = {
            login: login,
            role: foundPerson.role,
          };
          newAccessToken = jwt.sign(person, process.env.ACCESS_TOKEN_SECRET);
        }

        return res.json({
          message: "Person Updated",
          accessToken: newAccessToken,
        });
      })
      .catch((error) => {
        if (error.code === "Neo.ClientError.Schema.ConstraintValidationFailed")
          return res.status(400).send({ message: "Login is already used." });

        handleError500(res, error);
      });
  }
);

router.delete(
  "/account",
  authenticateToken,
  checkIfPersonDoNotHaveRentedBookWithLoginWrapper(false),
  (req, res) => {
    const personLogin = req.person.login;
    const query = `
    MATCH (person:Person {login: '${personLogin}'})
    DETACH DELETE person
    `;

    const writeTxResult = txWrite(query);
    writeTxResult
      .then(() => {
        return res.json({ message: "Person Deleted" });
      })
      .catch((error) => handleError500(res, error));
  }
);

module.exports = router;
