const { txRead } = require("./neo4jSessionUtils");
const {
  isDateValid,
  handleInvalidQueryParameter,
  handleNotFound,
} = require("./routesUtils");

const checkIfBookIsAlreadyRated = (req, res, next) => {
  const bookUuid = req.params.uuid;
  const personLogin = req.person.login;
  const query = `
    MATCH (:Book {uuid: '${bookUuid}'})<-[rated:RATED]-(:Person {login: '${personLogin}'})
    RETURN rated
    `;

  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      if (result.records.length > 0)
        return res.status(400).send({
          message: `You already rated book with uuid: '${bookUuid}'`,
        });

      next();
    })
    .catch((error) => res.status(500).send({ message: "error", error: error }));
};

const isRatingValid = (rating) => {
  const num = Number(rating);
  return rating !== undefined && Number.isInteger(num) && 10 >= num && num >= 1;
};

const isExpiryDateValid = (expiryDate) => {
  if (expiryDate === undefined) return true;

  if (!isDateValid(expiryDate)) return false;

  const currentDate = new Date();
  const expiryDateObject = new Date(expiryDate);
  return expiryDateObject > currentDate;
};

const validateRatingParams = (req, res, next) => {
  const { rating, expiryDate } = req.body;

  if (!isRatingValid(rating))
    return handleInvalidQueryParameter(res, "rating", rating);

  if (!isExpiryDateValid(expiryDate))
    return handleInvalidQueryParameter(res, "expiryDate", expiryDate);

  next();
};
//message: `You can only edit your own rating`,
const checkIfThisRatingExistsAndIsYours = (req, res, next) => {
  const ratingUuid = req.params.ratingUuid;
  const personLogin = req.person.login;
  const query = `
        MATCH (:Book)<-[r:RATED {uuid: '${ratingUuid}'}]-(p:Person)
        RETURN r, p
        `;

  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleNotFound("Rating", "uuid", ratingUuid, res);

      const person = result.records[0].get("p").properties;
      if (person.login !== personLogin)
        return res.status(403).send({
          message: `You can only edit your own rating`,
        });

      next();
    })
    .catch((error) => res.status(500).send({ message: "error", error: error }));
};

module.exports = {
  checkIfBookIsAlreadyRated,
  isRatingValid,
  isExpiryDateValid,
  validateRatingParams,
  checkIfThisRatingExistsAndIsYours,
};
