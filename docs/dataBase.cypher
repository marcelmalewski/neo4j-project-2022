CREATE (Fantasy:Genre {name: "Fantasy"})
CREATE (romance:Genre {name: "Romance"})
CREATE (fiction:Genre {name: "Fiction"})
CREATE (magicalRealism:Genre {name: "Magical Realism"})
CREATE (adventure:Genre {name: "Adventure"})
CREATE (mystery:Genre {name: "Mystery"})

CREATE
  (b1:Book {id: "1", title: "Pride and Prejudice", description: "Classic nove", release_date: date("1813-01-01"), image_link: "example.com" })-[:WRITTEN_BY]->(:Author { id: "1", name: "Jane Austen" }),
  (b2:Book {id: "2", title: "The Great Gatsby", description: "Tragedy novel", release_date: date("1925-01-01"), image_link: "" })-[:WRITTEN_BY]->(:Author { id:"2", name: "F. Scott Fitzgerald" }),
  (b3:Book {id: "3", title: "To Kill a Mockingbird", description: "Award-winnin", release_date: date("1960-01-01"), image_link: "" })-[:WRITTEN_BY]->(:Author { id:"3", name: "Harper Lee" }),
  (b4:Book {id: "4", title: "One Hundred Years of Solitude", description: "Magical real", release_date: date("1967-01-01"), image_link: "" })-[:WRITTEN_BY]->(:Author { id:"4", name: "Gabriel García Márquez" }),
  (b5:Book {id: "5", title: "Moby-Dick", description: "Adventure nov", release_date: date("1851-01-01"), image_link: "" })-[:WRITTEN_BY]->(:Author { id:"5", name: "Herman Melville" }),
  (b6:Book {id: "6", title: "Jane Eyre", description: "Romantic nove", release_date: date("1847-01-01"), image_link: "" })-[:WRITTEN_BY]->(:Author { id:"6", name: "Charlotte Brontë" }),
  (b7:Book {id: "7", title: "Wuthering Heights", description: "Romantic nove", release_date: date("1847-01-01"), image_link: "" })-[:WRITTEN_BY]->(:Author { id:"7", name: "Emily Brontë" }),
  (b8:Book {id: "8", title: "The Catcher in the Rye", description: "Coming-of-age", release_date: date("1951-01-01"), image_link: "" })-[:WRITTEN_BY]->(:Author { id:"8", name: "J.D. Salinger" }),
  (b9:Book {id: "9", title: "The Picture of Dorian Gray", description: "Gothic nove", release_date: date("1890-01-01"), image_link: "" })-[:WRITTEN_BY]->(:Author { id:"9", name: "Oscar Wilde" }),
  (b10:Book {id: "10", title: "The Adventures of Huckleberry Finn", description: "Adventure nov", release_date: date("1884-01-01"), image_link: "" })-[:WRITTEN_BY]->(:Author { id:"10", name: "Mark Twain" }),
  (Harry:Book {id: "11", title: "Harry Potter", description: "Cool book", release_date: date("2020-05-12"), image_link: ""})-[:WRITTEN_BY]->(Rowling:Author {id: "11", name: "J.K Rowling"})

CREATE (b1)-[:YEAR_OF_PUBLICATION]->(y1:Year {year: "1813"})
CREATE (b2)-[:YEAR_OF_PUBLICATION]->(y2:Year {year: "1925"})
CREATE (b3)-[:YEAR_OF_PUBLICATION]->(y3:Year {year: "1960"})
CREATE (b4)-[:YEAR_OF_PUBLICATION]->(y4:Year {year: "1967"})
CREATE (b5)-[:YEAR_OF_PUBLICATION]->(y5:Year {year: "1851"})
CREATE (b6)-[:YEAR_OF_PUBLICATION]->(y6:Year {year: "1847"})
CREATE (b7)-[:YEAR_OF_PUBLICATION]->(y7:Year {year: "1847"})
CREATE (b8)-[:YEAR_OF_PUBLICATION]->(y8:Year {year: "1951"})
CREATE (b9)-[:YEAR_OF_PUBLICATION]->(y9:Year {year: "1890"})
CREATE (b10)-[:YEAR_OF_PUBLICATION]->(y10:Year {year: "1884"})
CREATE (Harry)-[:YEAR_OF_PUBLICATION]->(y11:Year {year: "2020"})

CREATE (p1:PublishingHouse {name: "Penguin Books"})
CREATE (p2:PublishingHouse {name: "HarperCollins"})
CREATE (p3:PublishingHouse {name: "Penguin Classics"})
CREATE (p4:PublishingHouse {name: "Penguin Random House"})
CREATE (p5:PublishingHouse {name: "Penguin Books"})

CREATE (b1)-[:PUBLISHED_BY]->(p1)
CREATE (b2)-[:PUBLISHED_BY]->(p2)
CREATE (b3)-[:PUBLISHED_BY]->(p3)
CREATE (b4)-[:PUBLISHED_BY]->(p4)
CREATE (b5)-[:PUBLISHED_BY]->(p5)
CREATE (b6)-[:PUBLISHED_BY]->(p1)
CREATE (b7)-[:PUBLISHED_BY]->(p2)
CREATE (b8)-[:PUBLISHED_BY]->(p3)
CREATE (b9)-[:PUBLISHED_BY]->(p4)
CREATE (b10)-[:PUBLISHED_BY]->(p5)
CREATE (Harry)-[:PUBLISHED_BY]->(p1)

CREATE (b1)-[:HAS_GENRE]->(romance)
CREATE (b2)-[:HAS_GENRE]->(romance)
CREATE (b2)-[:HAS_GENRE]->(fiction)
CREATE (b3)-[:HAS_GENRE]->(fiction)
CREATE (b4)-[:HAS_GENRE]->(magicalRealism)
CREATE (b5)-[:HAS_GENRE]->(adventure)
CREATE (b6)-[:HAS_GENRE]->(romance)
CREATE (b7)-[:HAS_GENRE]->(romance)
CREATE (b8)-[:HAS_GENRE]->(fiction)
CREATE (b9)-[:HAS_GENRE]->(fiction)
CREATE (b10)-[:HAS_GENRE]->(adventure)
CREATE (Harry)-[:HAS_GENRE]->(Fantasy)

CREATE (notLoggedClient:Client {id: "1", name: "Not logged client"})
CREATE (client:Client {id: "2", name: "Jan Kowalski"})
CREATE (client2:Client {id: "3", name: "Adam Nowak"})
CREATE (client3:Client {id: "4", name: "Krzysztof Krawczyk"})
CREATE (client4:Client {id: "5", name: "Janusz Kowalski"})

CREATE (client)-[:RATED {rating: 5, expiry_date: datetime("2023-12-26T11:17:10.022000000Z")}]->(Harry)
CREATE (client2)-[:RATED {rating: 4, expiry_date: datetime("2023-12-26T11:17:10.022000000Z")}]->(Harry)
CREATE (client3)-[:RATED {rating: 2, expiry_date: datetime("2023-12-26T11:17:10.022000000Z")}]->(Harry)
CREATE (client4)-[:RATED {rating: 9, expiry_date: datetime("2023-12-26T11:17:10.022000000Z")}]->(b9)
CREATE (client4)-[:RATED {rating: 2, expiry_date: datetime("2023-12-26T11:17:10.022000000Z")}]->(b10)

CREATE (client)-[:COMMENTED {comment: "Great book!", date: datetime("2022-12-26T11:17:10.022000000Z")}]->(Harry)
CREATE (client2)-[:COMMENTED {comment: "Not bad", date: datetime("2022-12-27T11:17:10.022000000Z")}]->(Harry)
CREATE (client3)-[:COMMENTED {comment: "I don't like it", date: datetime("2022-12-28T11:17:10.022000000Z")}]->(Harry)
CREATE (notLoggedClient)-[:COMMENTED {comment: "I don't like it", date: datetime("2022-12-28T11:17:10.022000000Z")}]->(Harry)
