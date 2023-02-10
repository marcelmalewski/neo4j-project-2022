const express = require("express");
const {
  sendRegisterRequest,
  validPersonParams,
  hashPassword,
  checkIfPersonDoNotHaveRentedBookWithLoginWrapper,
} = require("../../utils/authUtils");
const {
  handleInvalidQueryParameter,
  authenticateToken,
  authenticateRoleForLibrarian,
  handleError500,
} = require("../../utils/routesUtils");
const {
  roleIsValid,
  checkIfPersonWithGivenLoginExists,
} = require("../../utils/librarianUtils/librarianPersonsUtils");
const { txWrite } = require("../../utils/neo4jSessionUtils");
const router = express.Router({ mergeParams: true });

router.get("", authenticateToken, authenticateRoleForLibrarian, (req, res) => {
  const query = `
    MATCH (person:Person)
    RETURN person
  `;
  const readTxResult = txWrite(query);
  readTxResult
    .then((result) => {
      const data = result.records.map((record) => {
        return record.get("person").properties;
      });
      res.json({ message: "success", data: data });
    })
    .catch((error) => handleError500(res, error));
});

router.post(
  "",
  authenticateToken,
  authenticateRoleForLibrarian,
  validPersonParams,
  hashPassword,
  async (req, res) => {
    const { login, name, role } = req.body;

    if (!roleIsValid(role))
      return handleInvalidQueryParameter(res, "role", role);

    const message = `Person Registered`;
    const hashedPassword = req.hashedPassword;
    const query = `
    CREATE (person:Person {login: '${login}', name: '${name}', role: '${role}', password: '${hashedPassword}'})
    RETURN person
    `;
    return await sendRegisterRequest(res, query, message, login);
  }
);

router.put(
  "",
  authenticateToken,
  authenticateRoleForLibrarian,
  validPersonParams,
  hashPassword,
  async (req, res) => {
    const { login, name, role } = req.body;

    if (!roleIsValid(role))
      return handleInvalidQueryParameter(res, "role", role);

    const message = `Person Updated`;
    const hashedPassword = req.hashedPassword;
    const query = `
        MATCH (person:Person {login: '${login}'})
        SET person.name = '${name}', person.role = '${role}', person.password = '${hashedPassword}'
        RETURN person
        `;
    return await sendRegisterRequest(res, query, message, login);
  }
);

router.delete(
  "/:login",
  authenticateToken,
  authenticateRoleForLibrarian,
  checkIfPersonWithGivenLoginExists,
  checkIfPersonDoNotHaveRentedBookWithLoginWrapper(true),
  (req, res) => {
    const login = req.params.login;

    const query = `
            MATCH (person:Person {login: '${login}'})
            DETACH DELETE person
            `;
    const writeTxResult = txWrite(query);
    writeTxResult
      .then(() => {
        return res.json({ message: `Person with login ${login} deleted` });
      })
      .catch((error) => handleError500(res, error));
  }
);

module.exports = router;
