const { txWrite, txRead } = require("./neo4jSessionUtils");
const driver = require("../config/neo4jDriver");
const { handleInvalidQueryParameter } = require("./routesUtils");
const sendReservationRequest = (
  bookUuid,
  personLogin,
  rentalPeriodInDays,
  res
) => {
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
    CREATE (person)-[reserved:RESERVED {rental_period_in_days: ${rentalPeriodInDays}, creation_date: date(), state_update_date: date(), state: 'NOT CONFIRMED'}]->(book)
    RETURN reserved`;

  const writeTxResultPromise = txWrite(session, query);
  writeTxResultPromise
    .then((result) => {
      res.json(result.records[0].get("reserved").properties);
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
};

const checkIfBookWithGivenUuidExistsAndIsNotConfirmed = (req, res, next) => {
  const session = driver.session();
  const bookUuid = req.params.uuid;
  const query = `
    MATCH (book:Book {uuid: '${bookUuid}', state: 'NOT CONFIRMED})
    RETURN book
    `;

  const readTxResult = txRead(session, query);
  readTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleNotFound("Book", "uuid", bookUuid, res);

      next();
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
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
  sendReservationRequest,
};
