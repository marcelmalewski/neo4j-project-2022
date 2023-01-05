const express = require("express");
const router = express.Router({ mergeParams: true });
//TODO kazda książka musi mieć przynajmniej jednego autora i jeden gatunek moze jakas walidacja
const { txWrite } = require("../utils/neo4jSessionUtils");
const {
  isParamEmpty,
  handleInvalidQueryParameter,
  isDateValid,
} = require("../utils/routesUtils");
const { areGenresValid } = require("../utils/booksUtils");
const { checkIfAuthorsAreValid } = require("../utils/librarianUtils");

// * `title` - tytuł
// * `description` - opis
// * `releaseDate` - data wydania
// * `imageLink` - link do zdjęcia
// * `genres` - gatunki
//TODO dodac weryfikacja logowania
//TODO stestowac checkIfAuthorsAreValid
// //TODO stestowac checkIfPublishingHouseIsValid
// ,
//   checkIfPublishingHouseIsValid,
router.post("/books", checkIfAuthorsAreValid, (req, res) => {
  const { title, description, releaseDate, imageLink, genres } = req.body;

  if (isParamEmpty(title))
    return handleInvalidQueryParameter(res, "title", title);

  if (isParamEmpty(description))
    return handleInvalidQueryParameter(res, "description", description);

  if (!isDateValid(releaseDate))
    return handleInvalidQueryParameter(res, "releaseDate", releaseDate);

  if (imageLink === undefined)
    return handleInvalidQueryParameter(res, "imageLink", imageLink);

  if (genres === undefined || !areGenresValid(genres))
    return handleInvalidQueryParameter(res, "genres", genres);

  res.status(201).send("yes");

  // const query = `
  //     MATCH (publishingHouse:PublishingHouse {name: '${publishingHouse}'})
  //     CREATE (book:Book {uuid: apoc.create.uuid(), title: '${title}', description: '${description}', release_date: '${releaseDate}', image_link: '${imageLink}'})
  //     CREATE (book)-[:PUBLISHED_BY]->(publishingHouse)
  //     RETURN book`;
  //
  // const readTxResultPromise = txWrite(session, query);
  //
  // const session = driver.session();
  // readTxResultPromise
  //   .then((result) => {
  //     res.status(201).send(result.records[0].get("book").properties);
  //   })
  //   .catch((error) => res.status(500).send(error))
  //   .then(() => session.close());
});

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
