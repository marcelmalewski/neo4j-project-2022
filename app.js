const express = require("express");
const app = express();
const books = require("./routes/books");
const comments = require("./routes/comments");
const ratings = require("./routes/ratings");
const reservations = require("./routes/reservations");
const auth = require("./routes/auth");
const librarianBooks = require("./routes/librarian/librarianBooks");
const librarianPersons = require("./routes/librarian/librarianPersons");
const librarianComments = require("./routes/librarian/librarianComments");

app.use(express.json());

try {
  app.use("/books", books);
  app.use("/books/:bookUuid/comments", comments);
  app.use("", ratings);
  app.use("", reservations);
  app.use("", auth);
  app.use("/librarian/books", librarianBooks);
  app.use("/librarian/persons", librarianPersons);
  app.use("/librarian/comments", librarianComments);

  console.log(`Connected to Neo4J.`);
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
  });
} catch (err) {
  console.error("Error connecting to Neo4J", err);
}
