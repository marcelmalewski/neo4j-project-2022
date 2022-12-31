const { txWrite } = require("./neo4jSessionUtils");
const { handleInvalidQueryParameter } = require("./routesUtils");
const driver = require("../config/neo4jDriver");
const sendRatingRequest = (rating, expiryDate, bookUuid, personLogin, res) => {
  if (!isRatingValid(rating))
    return handleInvalidQueryParameter(res, "rating", rating);

  if (!isExpiryDateValid(expiryDate))
    return handleInvalidQueryParameter(res, "expiryDate", expiryDate);

  const session = driver.session();
  const parsedExpiryDate =
    expiryDate === undefined ? null : `date('${expiryDate}')`;
  const query = `
    MATCH (book:Book {uuid: '${bookUuid}'})
    MATCH (person:Person {login: '${personLogin}'})
    CREATE (person)-[rated:RATED {rating: ${rating}, expiry_date: ${parsedExpiryDate}}]->(book)
    RETURN rated`;

  const writeTxResult = txWrite(session, query);
  writeTxResult
    .then((result) => {
      res.json(result.records[0].get("rated").properties);
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
};

const isRatingValid = (rating) => {
  const num = Number(rating);
  return rating === undefined || (Number.isInteger(num) && 10 >= num >= 1);
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
  return year <= 4000;
};

module.exports = {
  sendRatingRequest,
};
