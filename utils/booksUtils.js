const { SortBy, SortOrder } = require("../consts/consts");
const { validateGenresArr } = require("./routesUtils");
const { txRead } = require("./neo4jSessionUtils");

generateGetBooksQuery = (req) => {
  const { title, authors, genres, sortBy, sortOrder } = req.query;
  let query =
    sortBy === SortBy.AVGRATING
      ? "MATCH (book:Book)<-[rated:RATED]-(:Person)"
      : "MATCH (book:Book) ";
  let whereConditions = [];

  if (title) {
    whereConditions.push(`book.title = "${title}"`);
  }
  if (authors) {
    const authorsArr = authors.split(",");
    authorsArr.forEach((author) => {
      whereConditions.push(`(book)-[:WRITTEN_BY]->(:Author {name: '${author}'`);
    });
  }
  if (genres) {
    const genresAsArr = genres
      .split(",")
      .map((genre) => genre.trim().toUpperCase());
    genresAsArr.forEach((genre) => {
      whereConditions.push(`(book)-[:HAS_GENRE]->(:Genre {name: '${genre}'})`);
    });
  }
  if (whereConditions.length > 0) {
    query += `WHERE ${whereConditions.join(" AND ")} `;
  }
  if (sortBy === SortBy.AVGRATING) {
    query += `WITH book, round(avg(rated.rating), 2) as average_rating `;
  }

  query += "RETURN book";

  if (sortBy) {
    const parsedSortOrder = sortOrder ? sortOrder : SortOrder.ASC;
    if (sortBy === SortBy.TITLE) {
      query += ` ORDER BY book.title ${parsedSortOrder}`;
    } else if (sortBy === SortBy.RELEASEDATE) {
      query += ` ORDER BY book.release_date ${parsedSortOrder}`;
    } else {
      query += ` ORDER BY average_rating ${parsedSortOrder}`;
    }
  }

  return query;
};

const isSortByValid = (sortBy) => {
  return (
    sortBy === undefined ||
    sortBy === SortBy.TITLE ||
    sortBy === SortBy.RELEASEDATE ||
    sortBy === SortBy.AVGRATING
  );
};

const isSortOrderValid = (sortOrder) => {
  return (
    sortOrder === undefined ||
    sortOrder === SortOrder.ASC ||
    sortOrder === SortOrder.DESC
  );
};

const areGenresValid = (genres) => {
  if (genres === undefined) return true;

  const genresAsArr = genres.split(",");
  validateGenresArr(genresAsArr);
};

const isLimitValid = (limit) => {
  const num = Number(limit);
  return limit === undefined || (Number.isInteger(num) && num > 0);
};

const handleSimpleBooksReadQuery = (query, res) => {
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      res.json(result.records.map((record) => record.get("book").properties));
    })
    .catch((error) => res.status(500).send({ message: "error", error: error }));
};

module.exports = {
  generateGetBooksQuery,
  isSortByValid,
  isSortOrderValid,
  areGenresValid,
  isLimitValid,
  handleSimpleBooksReadQuery,
};
