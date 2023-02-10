const { handleNotFound, handleError500 } = require("./routesUtils");
const { txRead, txWrite } = require("./neo4jSessionUtils");
const { ReservationState } = require("../consts/consts");

const validateReservation = (correctReservationState) => {
  return (req, res, next) => {
    const personLogin = req.person.login;
    const reservationUuid = req.params.reservationUuid;

    const query = `
    MATCH (p:Person)-[reserved:RESERVED {uuid: '${reservationUuid}'}]->(:Book)
    RETURN reserved, p
    `;
    const readTxResult = txRead(query);
    readTxResult
      .then((result) => {
        if (result.records.length === 0)
          return handleNotFound(`Reservation`, "uuid", reservationUuid, res);

        const personLoginFromReservation =
          result.records[0].get("p").properties.login;
        if (personLoginFromReservation !== personLogin)
          return res.status(401).send({
            message: `Reservation with uuid: '${reservationUuid}' is not yours.`,
          });

        const currentState = result.records[0].get("reserved").properties.state;
        if (currentState !== correctReservationState)
          return handleWrongState(
            correctReservationState,
            currentState,
            reservationUuid,
            res
          );

        next();
      })
      .catch((error) => handleError500(res, error));
  };
};

const checkIfBookIsAlreadyReserved = (req, res, next) => {
  const bookUuid = req.params.bookUuid;
  const personLogin = req.person.login;

  const query = `
    MATCH (:Book {uuid: '${bookUuid}'})<-[reserved:RESERVED]-(:Person {login: '${personLogin}'})
    RETURN reserved
    `;
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      if (result.records.length > 0) {
        let bookHaveReservation = false;

        result.records.forEach((record) => {
          if (
            record.get("reserved").properties.state !==
            ReservationState.RETURNED
          )
            bookHaveReservation = true;
        });

        if (bookHaveReservation)
          return res.status(400).send({
            message: `Book with uuid: '${bookUuid}' is already reserved.`,
          });
      }

      next();
    })
    .catch((error) => handleError500(res, error));
};

const handleWrongState = (correctState, currentState, uuid, res) => {
  return res.status(400).send({
    message: `To make this action reservation with uuid: '${uuid}' should have state: '${correctState}', but current state is: '${currentState}'`,
  });
};

const handleSimpleReservationWriteQuery = (query, res) => {
  const writeTxResult = txWrite(query);
  writeTxResult
    .then((result) => {
      const data = result.records[0].get("reserved").properties;
      res.json({ message: "success", data: data });
    })
    .catch((error) => handleError500(res, error));
};

const isRentalPeriodInDaysValid = (rentalPeriodInDays) => {
  const num = Number(rentalPeriodInDays);
  return (
    rentalPeriodInDays !== undefined &&
    Number.isInteger(num) &&
    num > 0 &&
    num < 60
  );
};

const isHistoryParamValid = (history) => {
  return history === undefined || history === "true" || history === "false";
};

module.exports = {
  isRentalPeriodInDaysValid,
  validateReservation,
  checkIfBookIsAlreadyReserved,
  handleSimpleReservationWriteQuery,
  isHistoryParamValid,
  handleWrongState,
};
