const express = require("express");
const router = express.Router({ mergeParams: true });
//TODO kazda książka musi mieć przynajmniej jednego autora i jeden gatunek moze jakas walidacja
const { txWrite } = require("../utils/neo4jSessionUtils");
const {
  isParamEmpty,
  handleInvalidQueryParameter,
  isDateValid,
  authenticateToken,
} = require("../utils/routesUtils");
const {
  areGenresValid,
  checkIfPublishingHouseIsValid,
  createQuery,
} = require("../utils/librarianUtils");
const { checkIfAuthorsAreValid } = require("../utils/librarianUtils");

router.post(
  "/books",
  authenticateToken,
  checkIfAuthorsAreValid,
  checkIfPublishingHouseIsValid,
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

    if (isParamEmpty(title))
      return handleInvalidQueryParameter(res, "title", title);

    if (isParamEmpty(description))
      return handleInvalidQueryParameter(res, "description", description);

    if (!isDateValid(releaseDate))
      return handleInvalidQueryParameter(res, "releaseDate", releaseDate);

    if (imageLink === undefined)
      return handleInvalidQueryParameter(res, "imageLink", imageLink);

    if (!areGenresValid(genres))
      return handleInvalidQueryParameter(res, "genres", genres);

    const parsedGenres = genres.map((genre) => genre.trim().toUpperCase());
    const year = releaseDate.substring(0, 4);
    const query = createQuery(
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
        res.status(201).send(result.records[0].get("b").properties);
      })
      .catch((error) => res.status(500).send(error));
  }
);

router.put("/books/:id", async (req, res) => {
  const id = req.params.id;
  const {
    title,
    description,
    releaseDate,
    imageLink,
    genres,
    authors,
    publishingHouse,
  } = req.body;
  //TODO walidacja podanych danych, tez autora i gatunkow
  const query = `
      MATCH (book:Book {id: '${id}'})
      SET book.title = '${title}', book.description = '${description}', book.release_date = '${releaseDate}', book.image_link = '${imageLink}'
      RETURN book`;

  const readTxResultPromise = txWrite(query);
  readTxResultPromise
    .then((result) => {
      res.json(result.records[0].get("book").properties);
    })
    .catch((error) => res.status(500).send(error));
});

router.delete("/books/:id", async (req, res) => {
  const id = req.params.id;
  const query = `
      MATCH (book:Book {id: '${id}'})
      DETACH DELETE book
      RETURN book`;

  const readTxResultPromise = txWrite(query);
  readTxResultPromise
    .then((result) => {
      res.json(result.records[0].get("book").properties);
    })
    .catch((error) => res.status(500).send(error));
});

module.exports = router;
