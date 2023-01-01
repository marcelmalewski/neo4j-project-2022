const { txRead } = require("./neo4jSessionUtils");
const driver = require("../config/neo4jDriver");

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

  if (!/^\d{4}-\d{2}-\d{2}$/.test(expiryDate)) return false;

  const parts = expiryDate.split("-");
  const year = parseInt(parts[0]);
  const month = parseInt(parts[1]);
  const day = parseInt(parts[2]);

  if (month === 0 || month > 12) return false;
  if (day === 0 || day > 31) return false;
  if (year > 4000) return false;

  const currentDate = new Date();
  const expiryDateObject = new Date(year, month, day);
  return expiryDateObject > currentDate;
};

module.exports = {
  checkIfBookIsAlreadyRated,
  isRatingValid,
  isExpiryDateValid,
};
