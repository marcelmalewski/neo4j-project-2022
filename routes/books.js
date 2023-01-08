const express = require("express");
const router = express.Router({ mergeParams: true });
const { txRead } = require("../utils/neo4jSessionUtils");
const {
  generateGetBooksQuery,
  isSortByValid,
  areGenresValid,
  isSortOrderValid,
  isLimitValid,
  handleSimpleBooksReadQuery,
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
  const genres = req.query.genres;

  if (!isSortByValid(sortBy))
    return handleInvalidQueryParameter(res, "sortBy", sortBy);

  if (!isSortOrderValid(sortOrder))
    return handleInvalidQueryParameter(res, "sortOrder", sortOrder);

  if (!areGenresValid(genres))
    return handleInvalidQueryParameter(res, "genres", genres);

  const query = generateGetBooksQuery(req);
  handleSimpleBooksReadQuery(query, res);
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

  handleSimpleBooksReadQuery(query, res);
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
    .catch((error) => res.status(500).send({ message: "error", error: error }));
});

module.exports = router;
