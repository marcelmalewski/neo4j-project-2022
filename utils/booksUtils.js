const GENRES = require("./consts");

generateGetBooksQuery = (req) => {
  const { title, authors, genres, sortBy, sortOrder } = req.query;
  let query =
    sortBy === "avgRating"
      ? "MATCH (book:Book)<-[rated:RATED]-(:Client)"
      : "MATCH (book:Book) ";
  let whereConditions = [];

  if (title) {
    whereConditions.push(`book.title = "${title}"`);
  }
  if (authors) {
    const authorsArr = authors.split(",").map((author) => author.trim());
    authorsArr.forEach((author) => {
      whereConditions.push(`(book)-[:WRITTEN_BY]->(:Author {name: '${author}'`);
    });
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
  if (sortBy === "avgRating") {
    query += `WITH book, round(avg(rated.rating), 2) as average_rating `;
  }

  query += "RETURN book";

  if (sortBy) {
    const parsedSortOrder = sortOrder ? sortOrder : "asc";
    if (sortBy === "title") {
      query += ` ORDER BY book.title ${parsedSortOrder}`;
    } else if (sortBy === "releaseDate") {
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
    sortBy === "title" ||
    sortBy === "releaseDate" ||
    sortBy === "avgRating"
  );
};

const isSortOrderValid = (sortOrder) => {
  return sortOrder === undefined || sortOrder === "asc" || sortOrder === "desc";
};

const areGenresValid = (genres) => {
  if (genres === undefined) return true;
  let genresAreValid = true;

  const genresAsArr = genres.split(",").map((genre) => genre.trim());
  genresAsArr.forEach((genre) => {
    if (!GENRES.includes(genre)) genresAreValid = false;
  });

  return genresAreValid;
};

const isLimitValid = (limit) => {
  const num = Number(limit);
  return limit === undefined || (Number.isInteger(num) && num > 0);
};

module.exports = {
  generateGetBooksQuery,
  isSortByValid,
  isSortOrderValid,
  areGenresValid,
  isLimitValid,
};
