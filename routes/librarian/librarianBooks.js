const express = require("express");
const router = express.Router({ mergeParams: true });
const { txWrite } = require("../../utils/neo4jSessionUtils");
const {
  authenticateToken,
  handleNotFound,
  authenticateRoleForLibrarian,
  checkIfBookWithGivenUuidExists,
  handleError500,
} = require("../../utils/routesUtils");
const {
  checkIfPublishingHouseIsValid,
  createPostBookQuery,
  validateBookParams,
  createPutBookQuery,
  checkIfAuthorsAreValid,
  checkIfBookIsReturned,
} = require("../../utils/librarianUtils/librarianBooksUtils");

router.post(
  "",
  authenticateToken,
  authenticateRoleForLibrarian,
  checkIfAuthorsAreValid,
  checkIfPublishingHouseIsValid,
  validateBookParams,
  (req, res) => {
    const {
      title,
      description,
      releaseDate,
      imageLink,
      genres,
      authorsUuids,
      publishingHouse,
    } = req.body;

    const parsedGenres = genres.map((genre) => genre.trim().toUpperCase());
    const year = releaseDate.substring(0, 4);
    const query = createPostBookQuery(
      title,
      description,
      releaseDate,
      imageLink,
      parsedGenres,
      authorsUuids,
      publishingHouse,
      year
    );

    const writeTxResult = txWrite(query);
    writeTxResult
      .then((result) => {
        res.status(201).send({
          message: "success",
          data: result.records[0].get("b").properties,
        });
      })
      .catch((error) => handleError500(res, error));
  }
);

router.put(
  "/:uuid",
  authenticateToken,
  authenticateRoleForLibrarian,
  checkIfAuthorsAreValid,
  checkIfPublishingHouseIsValid,
  validateBookParams,
  (req, res) => {
    const uuid = req.params.uuid;
    const {
      title,
      description,
      releaseDate,
      imageLink,
      genres,
      authorsUuids,
      publishingHouse,
    } = req.body;

    const parsedGenres = genres.map((genre) => genre.trim().toUpperCase());
    const year = releaseDate.substring(0, 4);
    const query = createPutBookQuery(
      uuid,
      title,
      description,
      releaseDate,
      imageLink,
      parsedGenres,
      authorsUuids,
      publishingHouse,
      year
    );

    const writeTxResult = txWrite(query);
    writeTxResult
      .then((result) => {
        if (result.records.length === 0)
          return handleNotFound("Book", "uuid", uuid, res);

        res.json({
          message: "success",
          data: result.records[0].get("b").properties,
        });
      })
      .catch((error) => handleError500(res, error));
  }
);

router.delete(
  "/:bookUuid",
  authenticateToken,
  authenticateRoleForLibrarian,
  checkIfBookWithGivenUuidExists,
  checkIfBookIsReturned,
  (req, res) => {
    const uuid = req.params.bookUuid;
    const query = `
      MATCH (book:Book {uuid: '${uuid}'})
      DETACH DELETE book`;

    const readTxResultPromise = txWrite(query);
    readTxResultPromise
      .then(() => {
        res.json({ message: "Book deleted" });
      })
      .catch((error) => handleError500(res, error));
  }
);

module.exports = router;
