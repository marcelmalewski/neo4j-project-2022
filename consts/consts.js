const Genres = [
  "FANTASY",
  "ROMANCE",
  "FICTION",
  "MAGICAL REALISM",
  "ADVENTURE",
  "MYSTERY",
];

const Roles = {
  CLIENT: "CLIENT",
  LIBRARIAN: "LIBRARIAN",
};

const SortBy = {
  TITLE: "TITLE",
  RELEASEDATE: "RELEASEDATE",
  AVGRATING: "AVGRATING",
};

const SortOrder = {
  ASC: "ASC",
  DESC: "DESC",
};

const ReservationState = {
  NOT_CONFIRMED: "NOT CONFIRMED",
  CONFIRMED: "CONFIRMED",
  WAITING: "WAITING",
  RENTED_OUT: "RENTED OUT",
  RETURNED: "RETURNED",
};

const NotLoggedPerson = {
  LOGIN: "1",
  NAME: "Not logged person",
};

module.exports = {
  Genres,
  Roles,
  SortBy,
  SortOrder,
  ReservationState,
  NotLoggedPerson,
};
