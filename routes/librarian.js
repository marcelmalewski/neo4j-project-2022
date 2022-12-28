//Panel administratora
const express = require("express");
const router = express.Router({ mergeParams: true });
//TODO kazda książka musi mieć przynajmniej jednego autora i jeden gatunek moze jakas walidacja
const driver = require("../config/neo4jDriver");
const { txWrite } = require("../utils/neo4jSessionUtils");

router.post("/books", async (req, res) => {
  const session = driver.session();
  const {
    id,
    title,
    description,
    releaseDate,
    imageLink,
    genres,
    authors,
    publishingHouse,
  } = req.body;
  //TODO walidacja podanych danych, tez autora i gatunkow
  //dopytac chatgpt bo jezeli authorzy juz istnieją to uzyc ich jak nie to stworzyć
  //genresl moge lokanie testowac
  const query = `
      MATCH (publishingHouse:PublishingHouse {name: '${publishingHouse}'})
      CREATE (book:Book {id: '${id}', title: '${title}', description: '${description}', release_date: '${releaseDate}', image_link: '${imageLink}'})
      CREATE (book)-[:PUBLISHED_BY]->(publishingHouse)
      RETURN book`;

  const readTxResultPromise = txWrite(session, query);

  readTxResultPromise
    .then((result) => {
      res.json(result.records[0].get("book").properties);
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

router.put("/books/:id", async (req, res) => {
  const session = driver.session();
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
  //dopytac chatgpt bo jezeli authorzy juz istnieją to uzyc ich jak nie to stworzyć
  //genresl moge lokanie testowac
  const query = `
      MATCH (book:Book {id: '${id}'})
      SET book.title = '${title}', book.description = '${description}', book.release_date = '${releaseDate}', book.image_link = '${imageLink}'
      RETURN book`;

  const readTxResultPromise = txWrite(session, query);
  readTxResultPromise
    .then((result) => {
      res.json(result.records[0].get("book").properties);
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

router.delete("/books/:id", async (req, res) => {
  const session = driver.session();
  const id = req.params.id;
  const query = `
      MATCH (book:Book {id: '${id}'})
      DETACH DELETE book
      RETURN book`;

  const readTxResultPromise = txWrite(session, query);
  readTxResultPromise
    .then((result) => {
      res.json(result.records[0].get("book").properties);
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

module.exports = router;
