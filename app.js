const express = require("express");
const app = express();
const books = require("./routes/books");
const comments = require("./routes/comments");
const ratings = require("./routes/ratings");
const reservations = require("./routes/reservations");
//TODO dodac jakies "/api/v1/" do kazdego endpointu
//TODO dodac constrainty na start
//TODO nie uzywam średnikow

require("dotenv").config();
app.use(express.json());

try {
  require("./config/neo4jDriver");

  app.use("/books", books);
  app.use("/books/:id/comments", comments);
  app.use("/books/:id/ratings", ratings);
  app.use("/books/:id/reservations", reservations);

  console.log(`Connected to Neo4J.`);
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
  });
} catch (err) {
  console.error("Error connecting to Neo4J", err);
}
