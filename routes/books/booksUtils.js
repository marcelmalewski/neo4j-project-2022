generateGetBooksQuery = (req) => {
  const { title, authors, genres } = req.query;
  let query = "MATCH (book:Book) ";
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
  query += "RETURN book";

  return query;
};

module.exports = {
  generateGetBooksQuery,
};
