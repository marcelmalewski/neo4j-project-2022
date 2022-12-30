const handleNotFound = (name, withWhat, withWhatValue, res) => {
  return res
    .status(400)
    .send({ message: `${name} with ${withWhat}: ${withWhatValue} not found.` });
};

const handleInvalidQueryParameter = (res, parameterName, parameterValue) => {
  return res.status(400).send({
    message: `Invalid query parameter: ${parameterName} with value: ${parameterValue}.`,
  });
};

const isParamEmpty = (param) => {
  return param === undefined || param.trim() === "";
};

module.exports = {
  handleNotFound,
  isParamEmpty,
  handleInvalidQueryParameter,
};
