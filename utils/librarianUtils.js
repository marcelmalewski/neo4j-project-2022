const {
  isParamEmpty,
  handleInvalidQueryParameter,
  validateGenresArr,
  handleNotFound,
} = require("./routesUtils");
const { txRead } = require("./neo4jSessionUtils");

const createQuery = (
  title,
  description,
  releaseDate,
  imageLink,
  genres,
  authorsUuids,
  publishingHouse,
  year
) => {
  let query = `
        CREATE (b:Book {
          title:' ${title}',
          description: '${description}',
          releaseDate: date('${releaseDate}'),
          imageLink: '${imageLink}'
        }) 
        WITH b`;

  for (let i = 0; i < genres.length; i++) {
    query += `
      MATCH (g${i}:Genre {name: '${genres[i]}'})
      CREATE (b)-[:HAS_GENRE]->(g${i}) 
      WITH b`;
  }

  for (let i = 0; i < authorsUuids.length; i++) {
    query += `
        MATCH (a${i}:Author { uuid: '${authorsUuids[i]}' })
        CREATE (b)-[:WRITTEN]->(a${i}) 
        WITH b`;
  }

  query += `
        MATCH (ph:PublishingHouse { name: '${publishingHouse}' })
        CREATE (b)-[:PUBLISHED_BY]->(ph)
        CREATE (b)-[:YEAR_OF_PUBLICATION]->(:Year {year: ${year}})
        RETURN b
        `;

  return query;
};

const checkIfAuthorsAreValid = (req, res, next) => {
  const { authorsUuids } = req.body;

  if (authorsUuids === undefined || !Array.isArray(authorsUuids))
    return handleInvalidQueryParameter(res, "authorsUuids", authorsUuids);

  const numberOfAuthors = authorsUuids.length;
  if (numberOfAuthors === 0)
    return handleInvalidQueryParameter(res, "authorsUuids", authorsUuids);

  const query = `MATCH (a:Author) WHERE a.uuid IN $authorsUuids RETURN a`;
  const readTxResult = txRead(query, { authorsUuids: authorsUuids });
  readTxResult
    .then((result) => {
      if (result.records.length !== numberOfAuthors)
        return handleNotFound("One of authors", "uuids", authorsUuids, res);

      next();
    })
    .catch((error) => res.status(500).send(error));
};

const checkIfPublishingHouseIsValid = (req, res, next) => {
  const { publishingHouse } = req.body;

  if (isParamEmpty(publishingHouse))
    return handleInvalidQueryParameter(res, "publishingHouse", publishingHouse);

  const query = `MATCH (ph:PublishingHouse) WHERE ph.name = '${publishingHouse}' RETURN ph`;
  const readTxResult = txRead(query);
  readTxResult
    .then((result) => {
      if (result.records.length === 0)
        return handleNotFound("publishingHouse", "name", publishingHouse, res);

      next();
    })
    .catch((error) => res.status(500).send(error));
};

const areGenresValid = (genres) => {
  if (genres === undefined || !Array.isArray(genres)) return false;

  const numberOfGenres = genres.length;
  if (numberOfGenres === 0) return false;

  return validateGenresArr(genres);
};

module.exports = {
  checkIfAuthorsAreValid,
  checkIfPublishingHouseIsValid,
  areGenresValid,
  createQuery,
};
