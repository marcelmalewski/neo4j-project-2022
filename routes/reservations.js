const express = require("express");
const router = express.Router({ mergeParams: true });
const driver = require("../config/neo4jDriver");
const { txWrite, txRead } = require("../utils/neo4jSessionUtils");
const {
  authenticateToken,
  checkIfBookWithGivenUuidExists,
  handleInvalidQueryParameter,
} = require("../utils/routesUtils");
const {
  checkIfReservationExistsAndIsNotConfirmed,
  isRentalPeriodInDaysValid,
  checkIfBookIsAlreadyReserved,
} = require("../utils/reservationsUtils");
const { ReservationState } = require("../utils/consts");
//TODO dodać endpoint do każdego zmianu stanu rezerwacji

router.get(
  "/history",
  authenticateToken,
  checkIfBookWithGivenUuidExists,
  (req, res) => {
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
  checkIfBookIsAlreadyReserved,
  (req, res) => {
    const bookUuid = req.params.uuid;
    const personLogin = req.person.login;
    const rentalPeriodInDays = req.body.rentalPeriodInDays;
    if (!isRentalPeriodInDaysValid(rentalPeriodInDays))
      return handleInvalidQueryParameter(
        res,
        "rentalPeriodInDays",
        rentalPeriodInDays
      );

    const session = driver.session();
    const query = `
    MATCH (person:Person {login: '${personLogin}'})
    MATCH (book:Book {uuid: '${bookUuid}'})
    CREATE (person)-[reserved:RESERVED {rental_period_in_days: ${rentalPeriodInDays}, creation_date: date(), state_update_date: date(), state: '${ReservationState.NOT_CONFIRMED}'}]->(book)
    RETURN reserved`;

    const writeTxResultPromise = txWrite(session, query);
    writeTxResultPromise
      .then((result) => {
        res.json(result.records[0].get("reserved").properties);
      })
      .catch((error) => res.status(500).send(error))
      .then(() => session.close());
  }
);

router.patch(
  "/",
  authenticateToken,
  checkIfBookWithGivenUuidExists,
  checkIfReservationExistsAndIsNotConfirmed,
  (req, res) => {
    const personLogin = req.person.login;
    const bookUuid = req.params.uuid;
    const rentalPeriodInDays = req.body.rentalPeriodInDays;

    if (!isRentalPeriodInDaysValid(rentalPeriodInDays))
      return handleInvalidQueryParameter(
        res,
        "rentalPeriodInDays",
        rentalPeriodInDays
      );

    const session = driver.session();
    const query = `
      MATCH (p:Person {login: '${personLogin}'})-[reserved:RESERVED]->(b:Book {uuid: '${bookUuid}'})
      SET reserved.rental_period_in_days = ${rentalPeriodInDays}
      RETURN reserved`;

    const writeTxResultPromise = txWrite(session, query);
    writeTxResultPromise
      .then((result) => {
        res.json(result.records[0].get("reserved").properties);
      })
      .catch((error) => res.status(500).send(error))
      .then(() => session.close());
  }
);

router.patch(
  "/confirm",
  authenticateToken,
  checkIfBookWithGivenUuidExists,
  checkIfReservationExistsAndIsNotConfirmed,
  (req, res) => {
    const session = driver.session();
    const personLogin = req.person.login;
    const bookUuid = req.params.uuid;
    const query = `
    MATCH (p:Person {login: '${personLogin}'})-[reserved:RESERVED]->(b:Book {uuid: '${bookUuid}'})
    SET reserved.state = '${ReservationState.CONFIRMED}', reserved.state_update_date = date()
    RETURN reserved`;

    const writeTxResultPromise = txWrite(session, query);
    writeTxResultPromise
      .then((result) => {
        res.json(result.records[0].get("reserved").properties);
      })
      .catch((error) => res.status(500).send(error))
      .then(() => session.close());
  }
);

router.delete(
  "/",
  authenticateToken,
  checkIfBookWithGivenUuidExists,
  checkIfReservationExistsAndIsNotConfirmed,
  (req, res) => {
    const session = driver.session();
    const personLogin = req.person.login;
    const bookUuid = req.params.uuid;
    const query = `
      MATCH (p:Person {login: '${personLogin}'})-[reserved:RESERVED]->(b:Book {uuid: '${bookUuid}'})
      DELETE reserved`;

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
