const express = require("express");
const router = express.Router({ mergeParams: true });
const driver = require("../config/neo4jDriver");
const { txWrite, txRead } = require("../utils/neo4jSessionUtils");

router.get("/history", async (req, res) => {
  const session = driver.session();
  const clientId = "5";
  const bookId = req.params.id;
  const query = `MATCH (c:Client {id: '${clientId}'})-[r:RESERVED]->(b:Book {id: '${bookId}'})
                WHERE r.state = 'returned'
                RETURN r ORDER BY r.state_update_date DESC`;

  const readTxResultPromise = txRead(session, query);
  readTxResultPromise
    .then((result) => {
      res.json(result.records[0].get("r").properties);
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

//TODO endpoint do każdego zmianu stanu rezerwacji
router.post("/", async (req, res) => {
  //TODO gdy probuje drugi raz zarezerwowac tą samą książkę to error
  const session = driver.session();
  const clientId = "5";
  const bookId = req.params.id;
  const query = `MATCH (c:Client {id: '${clientId}'})
                MATCH (b:Book {id: '${bookId}'})
                CREATE (c)-[r:RESERVED {creation_date: date(), state_update_date: date(), state: 'not confirmed'}]->(b)
                RETURN r`;

  const writeTxResultPromise = txWrite(session, query);
  writeTxResultPromise
    .then((result) => {
      res.json(result.records[0].get("r").properties);
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

router.patch("/", async (req, res) => {
  //TODO dodac sprawdzenie czy rezerwacja istnieje i czy miala stan not confirmed bo tylko wtedy mozna ją edytowac
  const session = driver.session();
  const clientId = "5";
  const bookId = req.params.id;
  //TODO walidacja czy rentalPeriod zostal podany i czy nie przekracza 60 dni
  const rentalPeriodInDays = req.body.rentalPeriodInDays;
  const query = `MATCH (c:Client {id: '${clientId}'})-[r:RESERVED]->(b:Book {id: '${bookId}'})
                SET r.rental_period_in_days = ${rentalPeriodInDays}
                RETURN r`;

  const writeTxResultPromise = txWrite(session, query);
  writeTxResultPromise
    .then((result) => {
      res.json(result.records[0].get("r").properties);
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

router.patch("/confirm", async (req, res) => {
  //TODO dodac sprawdzenie czy rezerwacja istnieje i czy miala stan not confirmed
  const session = driver.session();
  const clientId = "5";
  const bookId = req.params.id;
  const query = `MATCH (c:Client {id: '${clientId}'})-[r:RESERVED]->(b:Book {id: '${bookId}'})
                SET r.state = 'confirmed', r.state_update_date = date()
                RETURN r`;

  const writeTxResultPromise = txWrite(session, query);
  writeTxResultPromise
    .then((result) => {
      res.json(result.records[0].get("r").properties);
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

//TODO przetestowac dziala i dodac do doksow
router.delete("/", async (req, res) => {
  //TODO dodac sprawdzenie czy rezerwacja istnieje i czy miala stan not confirmed bo tylko wtedy mozna ją usunąć
  const session = driver.session();
  const clientId = "5";
  const bookId = req.params.id;
  const query = `MATCH (c:Client {id: '${clientId}'})-[r:RESERVED]->(b:Book {id: '${bookId}'})
                DELETE r`;

  const writeTxResultPromise = txWrite(session, query);
  writeTxResultPromise
    .then(() => {
      res.json("Reservation deleted");
    })
    .catch((error) => res.status(500).send(error))
    .then(() => session.close());
});

module.exports = router;
