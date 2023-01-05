const driver = require("../config/neo4jDriver");

//TDOD czy cos jeszcze musi byc uikalne, imie i nazwisko autora moze sie powtarzac tak samo clienta i tytul ksiazki hmm
const createConstraints = async () => {
  const session = driver.session();
  try {
    await session.run(`
      CREATE CONSTRAINT FOR (book:Book) REQUIRE book.uuid IS UNIQUE;
      CREATE CONSTRAINT FOR (author:Author) REQUIRE author.uuid IS UNIQUE;
      CREATE CONSTRAINT FOR (person:Person) REQUIRE person.login IS UNIQUE;`);
    console.log("Constraints created successfully");
  } catch (error) {
    console.log(error);
  } finally {
    await session.close();
  }
};

module.exports = { createConstraints };
