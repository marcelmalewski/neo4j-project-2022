const { handleNotFound } = require("./routesUtils");
const { txRead } = require("./neo4jSessionUtils");
const { ReservationState } = require("../consts/consts");

const checkIfReservationExistsAndIsNotConfirmed = (req, res, next) => {
  const personLogin = req.person.login;
  const bookUuid = req.params.uuid;

  const query = `
    MATCH (:Book {uuid: '${bookUuid}'})<-[reserved:RESERVED]-(:Person {login: '${personLogin}'})
    RETURN reserved
    `;
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleNotFound(`Reservation`, "book uuid", bookUuid, res);

      const currentState = result.records[0].get("reserved").properties.state;

      if (currentState !== ReservationState.NOT_CONFIRMED)
        return handleWrongState(
          ReservationState.NOT_CONFIRMED,
          currentState,
          bookUuid,
          res
        );

      next();
    })
    .catch((error) => res.status(500).send(error));
};

const checkIfBookIsAlreadyReserved = (req, res, next) => {
  const bookUuid = req.params.uuid;
  const personLogin = req.person.login;

  const query = `
    MATCH (:Book {uuid: '${bookUuid}'})<-[reserved:RESERVED]-(:Person {login: '${personLogin}'})
    RETURN reserved
    `;
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      if (result.records.length > 0)
        return res.status(400).send({
          message: `Book with uuid: '${bookUuid}' is already reserved.`,
        });

      next();
    })
    .catch((error) => res.status(500).send(error));
};

const handleWrongState = (correctState, currentState, uuid, res) => {
  return res.status(400).send({
    message: `To make this action book with uuid: '${uuid}' should have state: '${correctState}', but current state is: '${currentState}'`,
  });
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

module.exports = {
  isRentalPeriodInDaysValid,
  checkIfReservationExistsAndIsNotConfirmed,
  checkIfBookIsAlreadyReserved,
};
