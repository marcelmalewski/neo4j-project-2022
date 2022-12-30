const express = require("express");
const router = express.Router({ mergeParams: true });
const driver = require("../config/neo4jDriver");
const { txWrite, txRead } = require("../utils/neo4jSessionUtils");
const {
  generateGetBooksQuery,
  isSortByValid,
  areGenresValid,
  isSortOrderValid,
  isLimitValid,
} = require("../utils/booksUtils");

router.get("/", async (req, res) => {
  if (!isSortByValid(req.query.sortBy))
    return res.status(400).send("Invalid sortBy query parameter");

  if (!isSortOrderValid(req.query.sortOrder))
    return res.status(400).send("Invalid sortOrder query parameter");

  if (!areGenresValid(req.query.genres))
    return res.status(400).send("Invalid genres query parameter");

  const session = driver.session();
  const query = generateGetBooksQuery(req);

  const readTxResultPromise = txRead(session, query);
  readTxResultPromise
    .then((result) => {
      res.json(result.records.map((record) => record.get("book").properties));
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

router.get("/popular/:limit", async (req, res) => {
  if (!isLimitValid(req.params.limit))
    return res.status(400).send("Invalid limit parameter");

  const session = driver.session();
  const limit = req.params.limit;
  const query = `
    MATCH (book:Book)
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

router.get("/details/:uuid", async (req, res) => {
  const session = driver.session();
  const uuid = req.params.uuid;
  const query = `
    MATCH (a:Author)<-[:WRITTEN_BY]-(book:Book {uuid: '${uuid}'})-[:HAS_GENRE]->(g:Genre),
      (book)-[:PUBLISHED_BY]->(p:PublishingHouse)
    OPTIONAL MATCH (book)<-[rated:RATED]-(:Client)
    WITH book,
      collect(distinct g.name) as genres,
      collect(distinct properties(a)) as authors,
      p, count(rated.rating) as number_of_ratings, round(avg(rated.rating), 2) as average_rating
    RETURN
      book.title as title,
      book.uuid as uuid,
      book.image_link as image_link,
      book.description as description,
      book.release_date as release_date,
      genres,
      authors,
      p.name as publishing_house,
      apoc.temporal.format(book.release_date, "yyyy") as release_year,
      number_of_ratings,
      average_rating`;

  const readTxResultPromise = txRead(session, query);
  readTxResultPromise
    .then((result) => {
      if (result.records.length === 0)
        res
          .status(400)
          .send({ message: `Book with uuid: ${uuid} do not exist` });

      const bookDetails = {
        uuid: result.records[0].get("uuid"),
        title: result.records[0].get("title"),
        image_link: result.records[0].get("image_link"),
        description: result.records[0].get("description"),
        release_date: result.records[0].get("release_date"),
        genres: result.records[0].get("genres"),
        authors: result.records[0].get("authors"),
        publishing_house: result.records[0].get("publishing_house"),
        release_year: result.records[0].get("release_year"),
        number_of_ratings: result.records[0].get("number_of_ratings"),
        average_rating: result.records[0].get("average_rating"),
      };
      res.json(bookDetails);
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

//TODO brak rezultatu rowna sie 400
router.put("/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  const title = req.body.title;
  const description = req.body.description;
  const releaseDate = req.body.releaseDate;
  const imageLink = req.body.imageLink;

  const session = driver.session();
  const readTxResultPromise = txWrite(
    session,
    "MATCH (book:Book {uuid: $uuid}) " +
      "SET book.title = $title, book.description = $description, book.releaseDate = $releaseDate, book.imageLink = $imageLink " +
      "RETURN book",
    {
      uuid,
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
router.delete("/:uuid", async (req, res) => {
  const uuid = req.params.uuid;
  const session = driver.session();
  const readTxResultPromise = txWrite(
    session,
    "MATCH (book:Book {uuid: $uuid}) DETACH DELETE book",
    { uuid }
  );

  readTxResultPromise
    .then(() => {
      res.json({ message: "Deleted book with uuid: " + uuid });
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
