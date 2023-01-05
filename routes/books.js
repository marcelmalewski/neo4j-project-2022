const express = require("express");
const router = express.Router({ mergeParams: true });
const { txWrite, txRead } = require("../utils/neo4jSessionUtils");
const {
  generateGetBooksQuery,
  isSortByValid,
  areGenresValid,
  isSortOrderValid,
  isLimitValid,
} = require("../utils/booksUtils");
const {
  handleNotFound,
  handleInvalidQueryParameter,
} = require("../utils/routesUtils");

router.get("/", (req, res) => {
  const sortBy = req.query.sortBy ? req.query.sortBy.toUpperCase() : undefined;
  const sortOrder = req.query.sortOrder
    ? req.query.sortOrder.toUpperCase()
    : undefined;

  if (!isSortByValid(sortBy))
    return handleInvalidQueryParameter(res, "sortBy", sortBy);

  if (!isSortOrderValid(sortOrder))
    return handleInvalidQueryParameter(res, "sortOrder", sortOrder);

  if (!areGenresValid(req.query.genres))
    return handleInvalidQueryParameter(res, "genres", req.query.genres);

  const query = generateGetBooksQuery(req);
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      res.json(result.records.map((record) => record.get("book").properties));
    })
    .catch((error) => res.status(500).send(error));
});

router.get("/popular/:limit", (req, res) => {
  if (!isLimitValid(req.params.limit))
    return handleInvalidQueryParameter(res, "limit", req.params.limit);

  const limit = req.params.limit;
  const query = `
    MATCH (book:Book)
    OPTIONAL MATCH (:Person)-[r:RATED]->(book)
    WITH book, count(r) as ratings
    RETURN book, COALESCE(ratings, 0) as ratings
    ORDER BY ratings DESC
    LIMIT ${limit}`;

  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      res.json(result.records.map((record) => record.get("book").properties));
    })
    .catch((error) => res.status(500).send(error));
});

router.get("/details/:uuid", (req, res) => {
  const uuid = req.params.uuid;
  const query = `
    MATCH (a:Author)<-[:WRITTEN_BY]-(book:Book {uuid: '${uuid}'})-[:HAS_GENRE]->(g:Genre),
      (book)-[:PUBLISHED_BY]->(p:PublishingHouse)
    OPTIONAL MATCH (book)<-[rated:RATED]-(:Person)
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

  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleNotFound("Book", "uuid", uuid);

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
    .catch((error) => res.status(500).send(error));
});

//TODO brak rezultatu rowna sie 400
//TODO przeniesc do librarian
router.put("/:uuid", (req, res) => {
  const uuid = req.params.uuid;
  const title = req.body.title;
  const description = req.body.description;
  const releaseDate = req.body.releaseDate;
  const imageLink = req.body.imageLink;

  const query = `
    MATCH (book:Book {uuid: '${uuid}'})
    SET book.title = '${title}', book.description = '${description}', book.release_date = date('${releaseDate}'), book.image_link = '${imageLink}' 
    RETURN book`;
  const readTxResult = txWrite(query);
  readTxResult
    .then((result) => {
      res.json(result.records[0].get("book").properties);
    })
    .catch((error) => res.status(500).send(error));
});

//TODO moze po rezultacie mozna wywnioskowac czy kasowanie sie udalo
//TODO albo uzyc checkIfBookWithGivenUuidExists
router.delete("/:uuid", (req, res) => {
  const uuid = req.params.uuid;
  const query = `
    MATCH (book:Book {uuid: '${uuid}'})
    DETACH DELETE book`;
  const writeTxResult = txWrite(query);
  writeTxResult
    .then(() => {
      res.json({ message: "Deleted book with uuid: " + uuid });
    })
    .catch((error) => res.status(500).send(error));
});

module.exports = router;
