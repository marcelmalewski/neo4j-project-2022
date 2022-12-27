generateGetBooksQuery = (req) => {
  //TODO dodac walidacje parametrow
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

module.exports = {
  generateGetBooksQuery,
};
