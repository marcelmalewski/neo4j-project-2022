const express = require("express");
const router = express.Router({ mergeParams: true });
const driver = require("../config/neo4jDriver");
const { txWrite, txRead } = require("../utils/neo4jSessionUtils");
//error = res.status.send
//TODO jaki error status kiedy
//TODO dodac unique id
//ok = res.json

router.get("/", async (req, res) => {
  const session = driver.session();
  const { title, author, genres } = req.query;
  let query = "MATCH (book:Book) ";
  let whereConditions = [];

  if (title) {
    whereConditions.push(`book.title = "${title}"`);
  }
  if (author) {
    whereConditions.push(`(book)-[:WRITTEN_BY]->(:Author {name: '${author}'})`);
  }
  if (genres) {
    const genresAsArr = genres.split(",").map((genre) => genre.trim());
    genresAsArr.forEach((genre) => {
      whereConditions.push(`(book)-[:HAS_GENRE]->(:Genre {name: '${genre}'})`);
    });
  }
  if (whereConditions.length > 0) {
    query += `WHERE ${whereConditions.join(" AND ")} `;
  }
  query += "RETURN book";

  const readTxResultPromise = txRead(session, query);
  readTxResultPromise
    .then((result) => {
      res.json(result.records.map((record) => record.get("book").properties));
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

router.get("/popular/{limit}", async (req, res) => {
  const session = driver.session();
  const limit = req.params.limit;
  const query = `MATCH (book:Book)
    OPTIONAL MATCH (:Client)-[r:RATED]->(book)
    WITH book, count(r) as ratings
    RETURN book, COALESCE(ratings, 0) as ratings
    ORDER BY ratings DESC
    LIMIT ${limit}`;

  const readTxResultPromise = txRead(session, query);
  readTxResultPromise
    .then((result) => {
      res.json(result.records.map((record) => record.get("book").properties));
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

router.post("/", async (req, res) => {
  const id = req.body.id;
  const title = req.body.title;
  const description = req.body.description;
  const releaseDate = req.body.releaseDate;
  const imageLink = req.body.imageLink;

  const session = driver.session();
  const readTxResultPromise = txWrite(
    session,
    "CREATE (book:Book {id: $id, title: $title, description: $description, releaseDate: $releaseDate, imageLink: $imageLink}) " +
      "RETURN book",
    {
      id,
      title,
      description,
      releaseDate,
      imageLink,
    }
  );

  readTxResultPromise
    .then((result) => {
      res.json(result.records[0].get("book").properties);
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

//TODO brak rezultatu rowna sie 400 ?
router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const title = req.body.title;
  const description = req.body.description;
  const releaseDate = req.body.releaseDate;
  const imageLink = req.body.imageLink;

  const session = driver.session();
  const readTxResultPromise = txWrite(
    session,
    "MATCH (book:Book {id: $id}) " +
      "SET book.title = $title, book.description = $description, book.releaseDate = $releaseDate, book.imageLink = $imageLink " +
      "RETURN book",
    {
      id,
      title,
      description,
      releaseDate,
      imageLink,
    }
  );

  readTxResultPromise
    .then((result) => {
      res.json(result.records[0].get("book").properties);
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

//TODO moze po rezultacie mozna wywnioskowac czy kasowanie sie udalo
router.delete("/:id", async (req, res) => {
  const id = req.params.id;

  const session = driver.session();
  const readTxResultPromise = txWrite(
    session,
    "MATCH (book:Book {id: $id}) DETACH DELETE book",
    { id }
  );

  readTxResultPromise
    .then(() => {
      res.json({ message: "Deleted book with id: " + id });
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

router.delete("/", async (req, res) => {
  const session = driver.session();
  const readTxResultPromise = txWrite(
    session,
    "MATCH (book:Book) DETACH DELETE book"
  );

  readTxResultPromise
    .then(() => {
      res.json({ message: "Deleted all books" });
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

module.exports = router;
