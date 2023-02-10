const express = require("express");
const app = express();
const books = require("./routes/Books/books");
const comments = require("./routes/Comments/comments");
const ratings = require("./routes/ratings");
const reservations = require("./routes/reservations");
const auth = require("./routes/auth");
const librarianBooks = require("./routes/librarian/librarianBooks");
const librarianPersons = require("./routes/librarian/librarianPersons");
const librarianComments = require("./routes/librarian/librarianComments");
const bookStatistics = require("./routes/Books/booksStatistics");
const authors = require("./routes/Authors/authors");
const genres = require("./routes/genres");
const persons = require("./routes/persons");
const commentsStatistics = require("./routes/Comments/commentsStatistics");
const authorsStatistics = require("./routes/Authors/authorsStatistics");
const librarianRatings = require("./routes/librarian/librarianRatings");

app.use(express.json());

try {
  app.use("/books", books);
  app.use("/books/statistics", bookStatistics);
  app.use("", comments);
  app.use("/comments/statistics", commentsStatistics);
  app.use("", ratings);
  app.use("", reservations);
  app.use("/auth", auth);
  app.use("/authors", authors);
  app.use("/authors/statistics", authorsStatistics);
  app.use("/genres", genres);
  app.use("/persons", persons);
  app.use("/librarian/books", librarianBooks);
  app.use("/librarian/persons", librarianPersons);
  app.use("/librarian/comments", librarianComments);
  app.use("/librarian/ratings", librarianRatings);

  console.log(`Connected to Neo4J.`);
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
  });
} catch (err) {
  console.error("Error connecting to Neo4J", err);
}
