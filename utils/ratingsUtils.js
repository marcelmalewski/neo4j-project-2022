const { txRead } = require("./neo4jSessionUtils");
const driver = require("../config/neo4jDriver");
const { isDateValid } = require("./routesUtils");

const checkIfBookIsAlreadyRated = (req, res, next) => {
  const session = driver.session();
  const bookUuid = req.params.uuid;
  const personLogin = req.person.login;
  const query = `
    MATCH (:Book {uuid: '${bookUuid}'})<-[rated:RATED]-(:Person {login: '${personLogin}'})
    RETURN rated
    `;

  const readTxResult = txRead(session, query);
  readTxResult
    .then((result) => {
      if (result.records.length > 0)
        return res.status(400).send({
          message: `You already rated book with uuid: '${bookUuid}'`,
        });

      next();
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
};

const isRatingValid = (rating) => {
  const num = Number(rating);
  return (
    rating === undefined || (Number.isInteger(num) && 10 >= num && num >= 1)
  );
};

const isExpiryDateValid = (expiryDate) => {
  if (expiryDate === undefined) return true;

  if (!isDateValid(expiryDate)) return false;

  const currentDate = new Date();
  //TODO przetestowac
  const expiryDateObject = new Date(expiryDate);
  return expiryDateObject > currentDate;
};

module.exports = {
  checkIfBookIsAlreadyRated,
  isRatingValid,
  isExpiryDateValid,
};
