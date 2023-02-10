const express = require("express");
const {
  authenticateToken,
  authenticateRoleForLibrarian,
  handleError500,
} = require("../../utils/routesUtils");
const {
  checkIfRatingWithGivenUuidExists,
} = require("../../utils/librarianUtils/librarianRatingsUtils");
const { txWrite } = require("../../utils/neo4jSessionUtils");
const router = express.Router({ mergeParams: true });

router.delete(
  "/:ratingUuid",
  authenticateToken,
  authenticateRoleForLibrarian,
  checkIfRatingWithGivenUuidExists,
  (req, res) => {
    const ratingUuid = req.params.ratingUuid;
    const query = `MATCH (:Book)<-[r:RATED {uuid: '${ratingUuid}'}]-(:Person) DELETE r`;

    const writeTxResult = txWrite(query);
    writeTxResult
      .then(() => {
        res.send({ message: "Rated deleted" });
      })
      .catch((error) => handleError500(res, error));
  }
);

module.exports = router;
