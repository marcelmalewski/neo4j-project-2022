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

module.exports = {
  Genres,
  Roles,
  SortBy,
  SortOrder,
  ReservationState,
};
