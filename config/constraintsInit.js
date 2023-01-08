const driver = require("../config/neo4jDriver");

//TODO dokończyć
//TODO spytac chat jak stworzyc skrypt ktory sie odpali zrobi te zapytania i się wyłączy w js
//TODO dopisac w doksach ze inne rodzaje contraintow są tylko dla neo4j enterprise
const createConstraints = async () => {
  const session = driver.session();
  try {
    await session.run(`
      CREATE CONSTRAINT FOR (book:Book) REQUIRE book.uuid IS UNIQUE;
      CREATE CONSTRAINT FOR (genre:Genre) REQUIRE genre.name IS UNIQUE;
      CREATE CONSTRAINT FOR (author:Author) REQUIRE author.uuid IS UNIQUE;
      CREATE CONSTRAINT FOR (publishingHouse:PublishingHouse) REQUIRE publishingHouse.name IS UNIQUE;
      CREATE CONSTRAINT FOR (person:Person) REQUIRE person.login IS UNIQUE;
      `);
    console.log("Constraints created successfully");
  } catch (error) {
    console.error(error);
  } finally {
    await session.close();
  }
};

createConstraints();
