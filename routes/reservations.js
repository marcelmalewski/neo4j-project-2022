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

router.get("/reservations/history", authenticateToken, (req, res) => {
  const session = driver.session();
  const personLogin = req.person.login;
  const query = `MATCH (p:Person {id: '${personLogin}'})-[reserved:RESERVED]->(:Book)
                WHERE reserved.state = 'RETURNED'
                RETURN reserved ORDER BY reserved.state_update_date DESC`;

  const readTxResult = txRead(session, query);
  readTxResult
    .then((result) => {
      res.json(result.records[0].get("reserved").properties);
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

router.post(
  "/:uuid/reservations",
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

    const writeTxResult = txWrite(session, query);
    writeTxResult
      .then((result) => {
        res.json(result.records[0].get("reserved").properties);
      })
      .catch((error) => res.status(500).send(error))
      .then(() => session.close());
  }
);

router.patch(
  "/:uuid/reservations",
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

    const writeTxResult = txWrite(session, query);
    writeTxResult
      .then((result) => {
        res.json(result.records[0].get("reserved").properties);
      })
      .catch((error) => res.status(500).send(error))
      .then(() => session.close());
  }
);

router.patch(
  "/:uuid/reservations/confirm",
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

    const writeTxResult = txWrite(session, query);
    writeTxResult
      .then((result) => {
        res.json(result.records[0].get("reserved").properties);
      })
      .catch((error) => res.status(500).send(error))
      .then(() => session.close());
  }
);

router.delete(
  "/:uuid/reservations",
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

    const writeTxResult = txWrite(session, query);
    writeTxResult
      .then(() => {
        res.json("Reservation deleted");
      })
      .catch((error) => res.status(500).send(error))
      .then(() => session.close());
  }
);

module.exports = router;
