const express = require("express");
const {
  sendRegisterRequest,
  validPersonParams,
  hashPassword,
} = require("../../utils/authUtils");
const {
  handleInvalidQueryParameter,
  authenticateToken,
  authenticateRoleForLibrarian,
} = require("../../utils/routesUtils");
const {
  roleIsValid,
  checkIfPersonWithGivenLoginExists,
} = require("../../utils/librarianUtils/librarianPersonsUtils");
const { txWrite } = require("../../utils/neo4jSessionUtils");
const router = express.Router({ mergeParams: true });

router.post(
  "/",
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
    return await sendRegisterRequest(res, query, message);
  }
);

router.put(
  "/",
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
    return await sendRegisterRequest(res, query, message);
  }
);

router.delete(
  "/:login",
  authenticateToken,
  authenticateRoleForLibrarian,
  checkIfPersonWithGivenLoginExists,
  (req, res) => {
    const { login } = req.params;
    const query = `
            MATCH (person:Person {login: '${login}'})
            DETACH DELETE person
            `;
    const writeTxResult = txWrite(query);
    writeTxResult
      .then(() => {
        return res.json("Person Deleted");
      })
      .catch((error) => {
        res.status(500).send({ message: "error", error: error });
      });
  }
);

module.exports = router;
