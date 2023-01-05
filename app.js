const express = require("express");
const app = express();
const books = require("./routes/books");
const comments = require("./routes/comments");
const ratings = require("./routes/ratings");
const reservations = require("./routes/reservations");
const auth = require("./routes/auth");
const librarian = require("./routes/librarian");
const { driver } = require("neo4j-driver");
const { createConstraints } = require("./utils/appUtils");

app.use(express.json());

//TODO Przerobic na scrypt ktory trzeba odpalic przed uruchomieniem aplikacji
//TODO dodac to do jakiejs instrukcji
//Przy pierwszym uruchomieniu aplikacji odkomentować poniższą wersja startu serwera
// i zakomentować tą niżej, ponieważ w darmowej wersji neo4j nie można można dodać
// tworzenie constraintow pod warunkiem ,że nie istnieją

// try {
//   app.use("/books", books);
//   app.use("/books/:id/comments", comments);
//   app.use("/books/:id/ratings", ratings);
//   app.use("/books/:id/reservations", reservations);
//
//   console.log(`Connected to Neo4J.`);
//   createConstraints().then(() => {
//     const port = process.env.PORT || 5000;
//     app.listen(port, () => {
//       console.log(`API server listening at http://localhost:${port}`);
//     });
//   });
// } catch (err) {
//   console.error("Error connecting to Neo4J", err);
// }

try {
  app.use("/books", books);
  app.use("/books/:uuid/comments", comments);
  app.use("/books/:uuid/ratings", ratings);
  app.use("/books", reservations);
  app.use("", auth);
  app.use("", librarian);

  console.log(`Connected to Neo4J.`);
  const port = process.env.PORT || 5000;
  app.listen(port, () => {
    console.log(`API server listening at http://localhost:${port}`);
  });
} catch (err) {
  console.error("Error connecting to Neo4J", err);
}
