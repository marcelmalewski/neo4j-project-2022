const express = require("express");
const router = express.Router({ mergeParams: true });
const { txWrite, txRead } = require("../utils/neo4jSessionUtils");
const {
  authenticateToken,
  handleInvalidQueryParameter,
  handleNotFound,
  handleError500,
} = require("../utils/routesUtils");
const {
  isRentalPeriodInDaysValid,
  checkIfBookIsAlreadyReserved,
  handleSimpleReservationWriteQuery,
  validateReservation,
  isHistoryParamValid,
} = require("../utils/reservationsUtils");
const { ReservationState } = require("../consts/consts");

router.get("/reservations", authenticateToken, (req, res) => {
  const personLogin = req.person.login;
  const history = req.query.history;

  if (!isHistoryParamValid(history))
    return handleInvalidQueryParameter(res, "history", history);

  let query = `MATCH (:Person {login: '${personLogin}'})-[reserved:RESERVED]->(b:Book) `;

  if (history === undefined || history === "false")
    query += `RETURN reserved, b ORDER BY reserved.state_update_date DESC`;
  else
    query += `WHERE reserved.state = 'RETURNED' 
              RETURN reserved, b ORDER BY reserved.state_update_date DESC`;

  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      const reservations = [];
      result.records.forEach((record) => {
        const reservation = record.get("reserved").properties;
        reservation.book = record.get("b").properties;
        reservations.push(reservation);
      });
      res.send({ message: "success", data: reservations });
    })
    .catch((error) => handleError500(res, error));
});

router.post(
  "/books/:bookUuid/reservations",
  authenticateToken,
  checkIfBookIsAlreadyReserved,
  (req, res) => {
    const bookUuid = req.params.bookUuid;
    const personLogin = req.person.login;
    const rentalPeriodInDays = req.body.rentalPeriodInDays;
    if (!isRentalPeriodInDaysValid(rentalPeriodInDays))
      return handleInvalidQueryParameter(
        res,
        "rentalPeriodInDays",
        rentalPeriodInDays
      );

    const query = `
    MATCH (person:Person {login: '${personLogin}'})
    MATCH (book:Book {uuid: '${bookUuid}'})
    CREATE (person)-[reserved:RESERVED {uuid: apoc.create.uuid(), rental_period_in_days: ${rentalPeriodInDays}, creation_date: date(), state_update_date: date(), state: '${ReservationState.NOT_CONFIRMED}'}]->(book)
    RETURN reserved`;

    const writeTxResult = txWrite(query);
    writeTxResult
      .then((result) => {
        if (result.records.length === 0)
          return handleNotFound("Book", "uuid", bookUuid, res);

        const data = result.records[0].get("reserved").properties;
        res.json({ message: "success", data: data });
      })
      .catch((error) => handleError500(res, error));
  }
);

router.patch(
  "/reservations/:reservationUuid",
  authenticateToken,
  validateReservation(ReservationState.NOT_CONFIRMED),
  (req, res) => {
    const reservationUuid = req.params.reservationUuid;
    const rentalPeriodInDays = req.body.rentalPeriodInDays;

    if (!isRentalPeriodInDaysValid(rentalPeriodInDays))
      return handleInvalidQueryParameter(
        res,
        "rentalPeriodInDays",
        rentalPeriodInDays
      );

    const query = `
      MATCH (:Person)-[reserved:RESERVED {uuid: '${reservationUuid}'}]->(:Book)
      SET reserved.rental_period_in_days = ${rentalPeriodInDays}
      RETURN reserved`;

    handleSimpleReservationWriteQuery(query, res);
  }
);

router.patch(
  "/reservations/:reservationUuid/confirm",
  authenticateToken,
  validateReservation(ReservationState.NOT_CONFIRMED),
  (req, res) => {
    const reservationUuid = req.params.reservationUuid;
    const query = `
    MATCH (:Person)-[reserved:RESERVED {uuid: '${reservationUuid}'}]->(:Book)
    SET reserved.state = '${ReservationState.CONFIRMED}', reserved.state_update_date = date()
    RETURN reserved`;

    handleSimpleReservationWriteQuery(query, res);
  }
);

router.patch(
  "/reservations/:reservationUuid/waiting",
  authenticateToken,
  validateReservation(ReservationState.CONFIRMED),
  (req, res) => {
    const reservationUuid = req.params.reservationUuid;
    const query = `
    MATCH (:Person)-[reserved:RESERVED {uuid: '${reservationUuid}'}]->(:Book)
    SET reserved.state = '${ReservationState.WAITING}', reserved.state_update_date = date()
    RETURN reserved`;

    handleSimpleReservationWriteQuery(query, res);
  }
);

router.patch(
  "/reservations/:reservationUuid/rented-out",
  authenticateToken,
  validateReservation(ReservationState.WAITING),
  (req, res) => {
    const reservationUuid = req.params.reservationUuid;
    const query = `
    MATCH (:Person)-[reserved:RESERVED {uuid: '${reservationUuid}'}]->(:Book)
    SET reserved.state = '${ReservationState.RENTED_OUT}', reserved.state_update_date = date()
    RETURN reserved`;

    handleSimpleReservationWriteQuery(query, res);
  }
);

router.patch(
  "/reservations/:reservationUuid/returned",
  authenticateToken,
  validateReservation(ReservationState.RENTED_OUT),
  (req, res) => {
    const reservationUuid = req.params.reservationUuid;
    const query = `
    MATCH (:Person)-[reserved:RESERVED {uuid: '${reservationUuid}'}]->(:Book)
    SET reserved.state = '${ReservationState.RETURNED}', reserved.state_update_date = date()
    RETURN reserved`;

    handleSimpleReservationWriteQuery(query, res);
  }
);

router.delete(
  "/reservations/:reservationUuid",
  authenticateToken,
  validateReservation(ReservationState.NOT_CONFIRMED),
  (req, res) => {
    const reservationUuid = req.params.reservationUuid;
    const query = `
      MATCH (:Person)-[reserved:RESERVED {uuid: '${reservationUuid}'}]->(:Book)
      DELETE reserved`;

    const writeTxResult = txWrite(query);
    writeTxResult
      .then(() => {
        res.json({ message: "Reservation deleted" });
      })
      .catch((error) => handleError500(res, error));
  }
);

module.exports = router;
