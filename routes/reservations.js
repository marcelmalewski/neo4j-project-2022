const express = require("express");
const router = express.Router({ mergeParams: true });
const driver = require("../config/neo4jDriver");
const { txWrite, txRead } = require("../utils/neo4jSessionUtils");
const {
  authenticateToken,
  checkIfBookWithGivenUuidExists,
} = require("../utils/routesUtils");
const { sendReservationRequest } = require("../utils/reservationsUtils");
//TODO dodać endpoint do każdego zmianu stanu rezerwacji

router.get(
  "/history",
  authenticateToken,
  checkIfBookWithGivenUuidExists,
  async (req, res) => {
    const session = driver.session();
    const clientId = "5";
    const bookId = req.params.id;
    const query = `MATCH (c:Client {id: '${clientId}'})-[r:RESERVED]->(b:Book {id: '${bookId}'})
                WHERE r.state = 'RETURNED'
                RETURN r ORDER BY r.state_update_date DESC`;

    const readTxResultPromise = txRead(session, query);
    readTxResultPromise
      .then((result) => {
        res.json(result.records[0].get("r").properties);
      })
      .catch((error) => res.status(500).send(error))
      .then(() => session.close());
  }
);

router.post(
  "/",
  authenticateToken,
  checkIfBookWithGivenUuidExists,
  async (req, res) => {
    const session = driver.session();
    const bookUuid = req.params.uuid;
    const personLogin = req.person.login;
    const query = `
      MATCH (:Book {uuid: '${bookUuid}'})<-[reserved:RESERVED]-(:Person {login: '${personLogin}'})
      RETURN reserved
      `;

    console.log(query);
    const readTxResult = txRead(session, query);
    readTxResult
      .then((result) => {
        if (result.records.length > 0)
          return res.status(400).send({
            message: `You already reserved book with uuid: '${bookUuid}'`,
          });

        return sendReservationRequest(
          bookUuid,
          personLogin,
          req.body.rentalPeriodInDays,
          res
        );
      })
      .catch((error) => res.status(500).send(error))
      .then(() => session.close());
  }
);

router.patch(
  "/",
  authenticateToken,
  checkIfBookWithGivenUuidExists,
  async (req, res) => {
    //TODO dodac sprawdzenie czy rezerwacja istnieje i czy miala stan not confirmed bo tylko wtedy mozna ją edytowac
    const session = driver.session();
    const clientId = "5";
    const bookId = req.params.id;
    //TODO walidacja czy rentalPeriod zostal podany i czy nie przekracza 60 dni
    const rentalPeriodInDays = req.body.rentalPeriodInDays;
    const query = `
    MATCH (c:Client {id: '${clientId}'})-[r:RESERVED]->(b:Book {id: '${bookId}'})
    SET r.rental_period_in_days = ${rentalPeriodInDays}
    RETURN r`;

    const writeTxResultPromise = txWrite(session, query);
    writeTxResultPromise
      .then((result) => {
        res.json(result.records[0].get("r").properties);
      })
      .catch((error) => res.status(500).send(error))
      .then(() => session.close());
  }
);

router.patch(
  "/confirm",
  authenticateToken,
  checkIfBookWithGivenUuidExists,
  async (req, res) => {
    const session = driver.session();
    const clientId = "5";
    const bookId = req.params.id;
    const query = `
    MATCH (c:Client {id: '${clientId}'})-[r:RESERVED]->(b:Book {id: '${bookId}'})
    SET r.state = 'CONFIRMED', r.state_update_date = date()
    RETURN r`;

    const writeTxResultPromise = txWrite(session, query);
    writeTxResultPromise
      .then((result) => {
        res.json(result.records[0].get("r").properties);
      })
      .catch((error) => res.status(500).send(error))
      .then(() => session.close());
  }
);

//TODO przetestowac dziala i dodac do doksow
router.delete(
  "/",
  authenticateToken,
  checkIfBookWithGivenUuidExists,
  async (req, res) => {
    //TODO dodac sprawdzenie czy rezerwacja istnieje i czy miala stan not confirmed bo tylko wtedy mozna ją usunąć
    const session = driver.session();
    const clientId = "5";
    const bookId = req.params.id;
    const query = `
    MATCH (c:Client {id: '${clientId}'})-[r:RESERVED]->(b:Book {id: '${bookId}'})
    DELETE r`;

    const writeTxResultPromise = txWrite(session, query);
    writeTxResultPromise
      .then(() => {
        res.json("Reservation deleted");
      })
      .catch((error) => res.status(500).send(error))
      .then(() => session.close());
  }
);

module.exports = router;
