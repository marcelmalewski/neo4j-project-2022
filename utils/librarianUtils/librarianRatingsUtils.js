const { txRead } = require("../neo4jSessionUtils");
const { handleNotFound, handleError500 } = require("../routesUtils");

const checkIfRatingWithGivenUuidExists = (req, res, next) => {
  const ratingUuid = req.params.ratingUuid;

  const query = `
        MATCH (:Book)<-[r:RATED {uuid: '${ratingUuid}'}]-(:Person)
        RETURN r
        `;
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleNotFound("Rating", "uuid", ratingUuid, res);

      next();
    })
    .catch((error) => handleError500(res, error));
};

module.exports = {
  checkIfRatingWithGivenUuidExists,
};
