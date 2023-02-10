const driver = require("../config/neo4jDriver");
const {txWrite} = require("../utils/neo4jSessionUtils");

const createConstraints = async () => {
  const session = driver.session();
  try {
    const query1 = "CREATE CONSTRAINT FOR (book:Book) REQUIRE book.uuid IS UNIQUE";
    const query2 = "CREATE CONSTRAINT FOR (genre:Genre) REQUIRE genre.name IS UNIQUE";
    const query3 = "CREATE CONSTRAINT FOR (author:Author) REQUIRE author.uuid IS UNIQUE";
    const query4 = "CREATE CONSTRAINT FOR (publishingHouse:PublishingHouse) REQUIRE publishingHouse.name IS UNIQUE";
    const query5 = "CREATE CONSTRAINT FOR (person:Person) REQUIRE person.login IS UNIQUE";
    const queries = [query1, query2, query3, query4, query5];

    await Promise.all(
        queries.map(query =>
            txWrite(query)
                .then(() => console.log(`Successfully created constraint with query: ${query}`))
                .catch(error => {
                  console.error(`Error creating constraint with query: ${query}`);
                  //console.error(error);
                }))
        )
  } finally {
    await session.close()
    await driver.close()
  }
};

createConstraints();
