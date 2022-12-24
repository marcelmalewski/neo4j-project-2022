CREATE (Harry:Book {title: "Harry Potter", description: "Cool book", releaseDate: "2020-05-12T16:50:21.817Z"})
CREATE (Rowling:Author {name: "J.K Rowling"})
CREATE (Harry)-[:WRITTEN_BY]->(Rowling)

CREATE (Fantasy:Genre {name: "Fantasy"})
CREATE (romance:Genre {name: "Romance"})
CREATE (fiction:Genre {name: "Fiction"})
CREATE (magicalRealism:Genre {name: "Magical Realism"})
CREATE (adventure:Genre {name: "Adventure"})

CREATE
  (b1:Book { title: "Pride and Prejudice", description: "Classic nove", releaseDate: "1813-01-01T00:00:00.000Z" })-[:WRITTEN_BY]->(:Author { name: "Jane Austen" }),
  (b2:Book { title: "The Great Gatsby", description: "Tragedy novel", releaseDate: "1925-01-01T00:00:00.000Z" })-[:WRITTEN_BY]->(:Author { name: "F. Scott Fitzgerald" }),
  (b3:Book { title: "To Kill a Mockingbird", description: "Award-winnin", releaseDate: "1960-01-01T00:00:00.000Z" })-[:WRITTEN_BY]->(:Author { name: "Harper Lee" }),
  (b4:Book { title: "One Hundred Years of Solitude", description: "Magical real", releaseDate: "1967-01-01T00:00:00.000Z" })-[:WRITTEN_BY]->(:Author { name: "Gabriel García Márquez" }),
  (b5:Book { title: "Moby-Dick", description: "Adventure nov", releaseDate: "1851-01-01T00:00:00.000Z" })-[:WRITTEN_BY]->(:Author { name: "Herman Melville" }),
  (b6:Book { title: "Jane Eyre", description: "Romantic nove", releaseDate: "1847-01-01T00:00:00.000Z" })-[:WRITTEN_BY]->(:Author { name: "Charlotte Brontë" }),
  (b7:Book { title: "Wuthering Heights", description: "Romantic nove", releaseDate: "1847-01-01T00:00:00.000Z" })-[:WRITTEN_BY]->(:Author { name: "Emily Brontë" }),
  (b8:Book { title: "The Catcher in the Rye", description: "Coming-of-age", releaseDate: "1951-01-01T00:00:00.000Z" })-[:WRITTEN_BY]->(:Author { name: "J.D. Salinger" }),
  (b9:Book { title: "The Picture of Dorian Gray", description: "Gothic nove", releaseDate: "1890-01-01T00:00:00.000Z" })-[:WRITTEN_BY]->(:Author { name: "Oscar Wilde" }),
  (b10:Book { title: "The Adventures of Huckleberry Finn", description: "Adventure nov", releaseDate: "1884-01-01T00:00:00.000Z" })-[:WRITTEN_BY]->(:Author { name: "Mark Twain" })


CREATE (b1)-[:HAS_GENRE]->(romance)
CREATE (b2)-[:HAS_GENRE]->(romance)
CREATE (b2)-[:HAS_GENRE]->(fiction)
CREATE (b3)-[:HAS_GENRE]->(fiction)
CREATE (b4)-[:HAS_GENRE]->(magicalRealism)
CREATE (b5)-[:HAS_GENRE]->(adventure)
CREATE (Harry)-[:HAS_GENRE]->(Fantasy)


CREATE (client:Client {name: "Jan Kowalski"})
CREATE (client2:Client {name: "Adam Nowak"})
CREATE (client3:Client {name: "Krzysztof Krawczyk"})
CREATE (client4:Client {name: "Janusz Kowalski"})

CREATE (client)-[:RATED {rating: 5}]->(Harry)
CREATE (client2)-[:RATED {rating: 4}]->(Harry)
CREATE (client3)-[:RATED {rating: 2}]->(Harry)
CREATE (client4)-[:RATED {rating: 9}]->(b9)
CREATE (client4)-[:RATED {rating: 2}]->(b10)
