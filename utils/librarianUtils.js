const { isParamEmpty } = require("./routesUtils");

const areAuthorsValid = async (authors, res) => {
  return res.status(500).send();
  // if (isParamEmpty(authors)) return false;
  //
  // try {
  //   // Use the 'IN' operator to check if every author is in the database
  //   const result = await session.executeRead(
  //     `MATCH (a:Author) WHERE a.name IN $authors RETURN COUNT(a)`,
  //     { authors: authors }
  //   );
  //
  //   const count = result.records[0].get(0).low;
  //   return count === authors.length;
  // } catch (error) {
  //   // Log the error and return false
  //   console.error(error);
  //   return false;
  // }
};

module.exports = {
  areAuthorsValid,
};
