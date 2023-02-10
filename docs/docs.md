# Mini dokumentacja

## Uruchamianie serwera:
#### 1. (WYMAGANE) Przygotowanie pliku `.env`, musi się znajdować w folderze `config`.
Wymagane zmienne:
* NEO4J_URI - adres do neo4j
* NEO4J_USER - nazwa użytkownika do neo4j
* NEO4J_PASSWORD - hasło do neo4j
* ACCESS_TOKEN_SECRET - sekret do generowania tokenów JWT  
Przykładowa zawartość:
```
NEO4J_URI="bolt://localhost:7687"
NEO4J_USER="neo4j"
NEO4J_PASSWORD="test1234"
ACCESS_TOKEN_SECRET=d4eac626c1ed78819dd78908c9c8dc9192316503ea416e0fafa3c245857f32bb34e53e63d9fa8c7cfd4d63a8559239e6da4ab5fc784028d3b3a72e0
                    b1cbd8274
```


#### 2. (WYMAGANE) Uruchomienie pliku tworzącego constrainty.
Plik jest dodany w `scripts` w `package.json`.  
Więc wystarczy wykonać komendę `npm run createConstraints` lub `yarn createConstraints`.  
##### Uwaga!  
Jeżeli któryś z constraintów już istnieje, w bazie to wyskoczy error, ale tworzenie  
każdego constriantu to odzielne zapytanie więc to nie problem.  
Ponieważ niestety warunkowe tworzenie constraintów jest dostępne tylko w wersji enterprise neo4j.


#### 3. (WYMAGANE) Uruchamianie
* #### 1. Serwer wersja developerska
  * ta wersja używa nodemone'a
  * komenda: `npm run devStart` lub `yarn devStart`

* #### 2. Serwer wersja produkcyjna:
  * nie używa nodemone'a
  * komenda: `npm run prodStart` lub `yarn prodStart`

#### 4. (WYMAGANE) Dodanie potrzebnych danych
Plik jest dodany w `scripts` w `package.json`.  
Więc wystarczy wykonać komendę `npm run createData` lub `yarn createData`.
Jest tam przy okazji trochę danych testowych.

#### 5. Jeżeli dodaliśmy, dane testowe to możemy skorzystać z Obecnego tam konta:
Konto, na które można się zalogować:
* login: `123456`
* name: `"jan library"`
* password: `1234523452345`
* role: `LIBRARIAN`
Albo po prostu używać tokenu:
* accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6IjEyMzQ1NiIsInJvbGUiOiJMSUJSQVJJQU4iLCJpYXQiOjE2NzMwNDM2MDZ9.s00FbBPb8j8Vl7OAlL4JVKSLR7cOAtFeRFPbSJ4BuFA`
ale w .env trzeba ustawić:
* ACCESS_TOKEN_SECRET=d4eac626c1ed78819dd78908c9c8dc9192316503ea416e0fafa3c245857f32bb34e53e63d9fa8c7cfd4d63a8559239e6da4ab5fc784028d3b3a72e0
  b1cbd8274

## Podstawowe endpointy:

### 1. Pobierz wszystkie książki
#### Endpoint: GET /books
#### Opcjonalne parametry:
* `title` - filtrowanie po tytule
* `authors` - filtrowanie po autorach
* `genres` - filtrowanie po gatunkach: `FANTASY`, `ROMANCE`, `FICTION`, `MAGICAL REALISM`, `ADVENTURE`, `MYSTERY` (wielkość liter dowolna)
* `sortBy` - sortowanie po wartościach: `TITLE`|`RELEASEDATE`|`AVGRATING` (wielkość liter dowolna)
* `sortOrder` - sortowanie rosnąco lub malejąco: `ASC`|`DESC` (default: `ASC`) (wielkość liter dowolna)
#### Przykładowe zapytanie:
http://localhost:5000/books?title=The Great Gatsby&genres=Fiction     ,Romance&author=F. Scott Fitzgerald

### 2. Pobierz popularne książki (najczęściej oceniane)
#### Endpoint: GET /books/popular/:limit
#### parametry:
* `limit` - limit wyników (liczba, ale może być też jako string np. `"5"` większa od zera)
#### Przykładowe zapytanie:
http://localhost:5000/books/popular/5

### 3. Pobierz szczegóły książki po uuid
* Książka musi istnieć
#### Endpoint: GET /books/details/:bookUUid
#### zwraca:
* tytuł
* zdjęcie
* opis 
* data
* gatunki
* autorów
* wydawnictwo
* rok wydania
* średnia ocen (o ile istnieją oceny)
* ilość głosów (o ile istnieją oceny)
#### Przykładowe zapytanie:
http://localhost:5000/books/details/11

### 4. Dodawanie komentarza do książki
* Książka musi istnieć
* dla zalogowanej osoby komentarz przypisany będzie do niej
  (wymagany header: `Authorization: 'Bearer twoj_token'`)
  POST /books/:bookId/comments
* dla niezalogowanej osoby komentarz będzie anonimowy
  POST /books/:bookId/comments/not-logged-in-person
#### body:
* `comment` - komentarz (nie może być pusty albo samymi spacjami, krótszy niż 100 znaków)
#### Endpoint: POST /books/:bookId/comments albo POST /books/:bookId/comments/not-logged-in-person
#### Przykładowe zapytanie dla niezalogowanej osoby:
http://localhost:5000/books/11/comments/not-logged-in-person
#### Przykładowe zapytanie dla zalogowanej osoby:
http://localhost:5000/books/11/comments

### 5. Edycja swojego komentarza
* Książka musi istnieć
* Komentarz musi istnieć
* Musi to być twój komentarz
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
#### body:
* `comment` - komentarz (nie może być pusty albo samymi spacjami, krótszy niż 100 znaków)
#### Endpoint: PATCH /comments/:commentId
#### Przykładowe zapytanie:
http://localhost:5000/comments/1

### 6. Pobierz komentarze do książki
* Książka musi istnieć
#### Endpoint: GET /books/:bookUuid/comments
#### Przykładowe zapytanie:
http://localhost:5000/books/11/comments

### 7. Usuń komentarz do książki
* Książka musi istnieć
* Komentarz musi istnieć
* Musi to być twój komentarz
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
#### Endpoint: DELETE /comments/:commentId
#### Przykładowe zapytanie:
http://localhost:5000/comments/1

### 8. Pobierz wszystkie oceny danej książki
* Książka musi istnieć
#### Endpoint: GET /books/:bookUuid/ratings
#### Przykładowe zapytanie:
http://localhost:5000/books/11/ratings

### 9. Dodawanie oceny książki
* Książka musi istnieć
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
#### Endpoint: POST /books/:bookId/ratings
#### zawartość body:
* `rating` - ocena (liczba, 1-10)
* `expiryDate` - kiedy ocena wygasa (opcjonalne, default: `nie wygasa`) 
 przyjmuje tylko date tego typu: "2000-10-01", rok nie może przekraczać roku `4000`,
data musi być w przyszłości.
#### Przykładowe zapytanie:
http://localhost:5000/books/11/ratings

### 10. Edycja oceny książki
* Ocena musi istnieć
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
* możesz edytować tylko swoją ocene
#### Endpoint: PUT /ratings/:ratingId
#### Body:
* `rating` - ocena (liczba, 1-10)
* `expiryDate` - kiedy ocena wygasa (opcjonalne, default: `nie wygasa`)
  przyjmuje tylko date tego typu: "2000-10-01", rok nie może przekraczać roku `4000`, data musi być w przyszłości.
#### Przykładowe zapytanie:
http://localhost:5000/ratings/11

### 11. Rezerwacja książki
* Książka musi istnieć
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
* nie można zarezerwować dwa razy jednej książki (chodzi o uuid, konkretny egzemplarz),
można edytować rezerwacje albo usunąć i stworzyć od nowa
#### Endpoint: POST /books/:bookId/reservations
#### Body:
* `rentalPeriodInDays` - na ile dni chcemy wypożyczyć książkę
(liczba, ale może być też jako string np. `"5"`, mniejsza niż 60 i większa od 0)
#### Przykładowe zapytanie:
http://localhost:5000/books/11/reservations

### 12. Edycja rezerwacji
* Książka musi istnieć
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
* rezerwacja musi istnieć
* rezerwacja musi być twoja
* możliwe tylko dla rezerwacji o stanie `NOT CONFIRMED`
#### Endpoint: PATCH /reservations/:reservationUuid
#### Body:
* `rentalPeriodInDays` - na ile dni chcemy wypożyczyć książkę
  (liczba, ale może być też jako string np. `"5"`, mniejsza niż 60 i większa od 0)
#### Przykładowe zapytanie:
http://localhost:5000/reservations/11

### 13. Potwierdzenie rezerwacji
* Książka musi istnieć
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
* rezerwacja musi istnieć
* rezerwacja musi być twoja
* Tylko rezerwacje o stanie `NOT CONFIRMED`
#### Endpoint: PATCH /reservations/:reservationUuid/confirm
#### Przykładowe zapytanie:
http://localhost:5000/reservations/11/confirm

### 14. Zmiana stanu rezerwacji na "WAITING"
Książka czeka na, klient, który może już ją wypożyczyć
* Książka musi istnieć
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
* rezerwacja musi istnieć
* rezerwacja musi być twoja
* Tylko rezerwacje o stanie `CONFIRMED`
#### Endpoint: PATCH /reservations/:reservationUuid/waiting
#### Przykładowe zapytanie:
http://localhost:5000/reservations/11/waiting

### 15. Zmiana stanu rezerwacji na "RENTED OUT"
Książka jest już wypożyczona
* Książka musi istnieć
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
* rezerwacja musi istnieć
* rezerwacja musi być twoja
* Tylko rezerwacje o stanie `WAITING`
#### Endpoint: PATCH /reservations/:reservationUuid/rented-out
#### Przykładowe zapytanie:
http://localhost:5000/reservations/11/rented-out

### 16. Zmiana stanu rezerwacji na "RETURNED"
Książka jest już wypożyczona
* Książka musi istnieć
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
* rezerwacja musi istnieć
* rezerwacja musi być twoja
* Tylko rezerwacje o stanie `RENTED OUT`
#### Endpoint: PATCH /reservations/:reservationUuid/returned
#### Przykładowe zapytanie:
http://localhost:5000/reservations/11/returned

#### 17. Usuwanie rezerwacji
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
* rezerwacja musi istnieć
* rezerwacja musi być twoja
* możliwe tylko dla rezerwacji o stanie `NOT CONFIRMED`
#### Endpoint: DELETE /reservations/:reservationUuid
#### Przykładowe zapytanie:
http://localhost:5000/reservations/11

### 18. Pobieranie wszystkich rezerwacji danego użytkownika
Wszystkie rezerwacje o każdym stanie
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
#### Optional parameters:
* `history` - jeśli jest ustawione na `true` to zwróci tylko rezerwacje, które już się zakończyły,    
mają stan `RETURNED`
#### Endpoint: GET /reservations
#### return body array obiektów:  
posortowane malejąco po dacie ostatniego zmianu stanu rezerwacji
* `rental_period_in_days` - na ile dni wypożyczono książkę
* `state_update_date` - data ostatniej zmiany stanu rezerwacji
* `state` - stan rezerwacji
* `creation_date` - data utworzenia rezerwacji
* `uuid` - uuid rezerwacji
* `book`:
  * `uuid` - uuid książki
  * `title` - tytuł książki
  * `description` - opis książki
  * `release_date` - data wydania książki
  * `image_link` - link do zdjęcia książki
#### Przykładowe zapytanie:
http://localhost:5000/reservations

### 19. Rejestracja
#### Endpoint: POST /auth/register
#### Body:
* login (unikalny, 20 > długość > 3)
* name (imie + spacje + nazwisko, np. "Jan Kowalski", 20 > długość, nie może to być: `Not logged person`)
* password (20 > długość > 8)
#### Przykładowe zapytanie:
http://localhost:5000/auth/register

### 20. Logowanie
#### Endpoint: POST /auth/login
#### Body:
* login
* password
#### Body w responsie:
* `accessToken` (używamy go przy endpointach wymajających bycia zalogowanym)
#### Przykładowe zapytanie:
http://localhost:5000/auth/login

### 21. Zmiana swoich danych
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
#### Endpoint: PUT /auth/account
#### Body:
* login (unikalny, 20 > długość > 3)
* name (imie + spacje + nazwisko, np. "Jan Kowalski", 20 > długość, nie może to być: `Not logged person`)
* password (20 > długość > 8)
#### Return body:
jeżeli zmienisz login, to w responsie dostaniesz nowy token
* `accessToken` (używamy go przy endpointach wymajających bycia zalogowanym)
#### Przykładowe zapytanie:
http://localhost:5000/auth/account

### 22. Usuwanie konta
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
* nie możesz mieć rezerwacje w stanie: `RENTED OUT`
#### Endpoint: DELETE /auth/account
#### Przykładowe zapytanie:
http://localhost:5000/auth/account

### 23. Sugestia hasła
#### Endpoint: POST /auth/password-suggestion
#### Przykładowe zapytanie:
http://localhost:5000/auth/password-suggestion

### 24. Wszyscy autorzy korzystający z danego domu publikacji
#### Endpoint: GET /authors/by-publishing-house/:publishingHouseName
#### Przykładowe zapytanie:
http://localhost:5000/authors/by-publishing-house/Penguin Books

### 25. Unikalne imiona autorów
#### Endpoint: GET /authors/unique-names
#### Przykładowe zapytanie:
http://localhost:5000/authors/unique-names

### 26. Wszystkie gatunki jako jeden string
#### Endpoint: GET /genres/all-genres-as-string
#### Przykładowe zapytanie:
http://localhost:5000/genres/all-genres-as-string

### 27. Wszystkie osoby, które oceniły te książki, które ty oceniłeś
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
#### Endpoint: GET /persons/who-rated-books-you-rated
#### Przykładowe zapytanie:
http://localhost:5000/persons/who-rated-books-you-rated

## Panel administracyjny
W kodzie jest to nazwane jako `librarian` bardziej tematycznie

### 1. Dodawanie książki
* możliwe tylko dla zalogowanego bibliotekarza (Role: `LIBRARIAN`)
* wymagany header: `Authorization: 'Bearer twoj_token'`
#### Endpoint: POST /librarian/books
#### Body:
* `title` - tytuł
* `description` - opis
* `releaseDate` - data wydania (przyjmuje tylko date tego typu: "2000-10-01")
* `imageLink` - link do zdjęcia (może być pustym stringiem)
* `genres` - gatunki (musi być array, muszą istnieć w bazie)
* `authors` - autorzy (musi być array, muszą istnieć w bazie)
* `publishingHouse` - wydawnictwo (musi istnieć w bazie)
#### Przykładowe zapytanie:
http://localhost:5000/librarian/books

### 2. Edycja książki
* możliwe tylko dla zalogowanego bibliotekarza
* wymagany header: `Authorization: 'Bearer twoj_token'`
* książka musi istnieć
#### Endpoint: PUT /librarian/books/:bookId
#### Body:
* `title` - tytuł
* `description` - opis
* `releaseDate` - data wydania
* `imageLink` - link do zdjęcia
* `genres` - gatunki (musi być array, muszą istnieć w bazie)
* `authors` - autorzy (musi być array, muszą istnieć w bazie)
* `publishingHouse` - wydawnictwo (musi istnieć w bazie)
#### Przykładowe zapytanie:
http://localhost:5000/librarian/books/11

### 3. Usuwanie książki
* możliwe tylko dla zalogowanego bibliotekarza
* wymagany header: `Authorization: 'Bearer twoj_token'`
* książka musi istnieć
* książka musi być w stanie `RETURNED`
#### Endpoint: DELETE /librarian/books/:bookId
#### Przykładowe zapytanie:
http://localhost:5000/librarian/books/11

### 4. Pobieranie wszystkich użytkowników
* możliwe tylko dla zalogowanego bibliotekarza
* wymagany header: `Authorization: 'Bearer twoj_token'`
#### Endpoint: GET /librarian/persons
#### Przykładowe zapytanie:
http://localhost:5000/librarian/persons

### 5. Dodawanie użytkownika
Tutaj możesz wybrać role.
* możliwe tylko dla zalogowanego bibliotekarza
* wymagany header: `Authorization: 'Bearer twoj_token'`
#### Endpoint: POST /librarian/persons
#### Body:
* `login` - login (unikalny, 20 > długość > 3, nie może to być: `Not logged person`)
* `name` - imie + spacje + nazwisko, np. "Jan Kowalski", 20 > długość
* `password` - hasło (20 > długość > 8)
* `role` - rola (może być tylko `CLIENT` lub `LIBRARIAN`)
#### Przykładowe zapytanie:
http://localhost:5000/librarian/persons

### 6. Edycja użytkownika
Tutaj możesz wybrać role.
* możliwe tylko dla zalogowanego bibliotekarza
* wymagany header: `Authorization: 'Bearer twoj_token'`
* użytkownik musi istnieć
#### Endpoint: PUT /librarian/persons
#### Body:
* `login` - login (unikalny, 20 > długość > 3, nie może to być: `Not logged person`)
* `name` - imie + spacje + nazwisko, np. "Jan Kowalski", 20 > długość
* `password` - hasło (20 > długość > 8)
* `role` - rola (może być tylko `CLIENT` lub `LIBRARIAN`)
#### Przykładowe zapytanie:
http://localhost:5000/librarian/persons

### 7. Usuwanie użytkownika
Można usunąć dowolnego użytkownika
* możliwe tylko dla zalogowanego bibliotekarza
* wymagany header: `Authorization: 'Bearer twoj_token'`
* użytkownik musi istnieć
* użytkownik nie może mieć rezerwacji w stanie `RENTED OUT`
#### Endpoint: DELETE /librarian/persons/:personId
#### Przykładowe zapytanie:
http://localhost:5000/librarian/persons/11

### 8. Dodawanie komentarza
* Może użyć endpointu do dodawania komentarza dostępnego dla każdej zalogowanej osoby.

### 9. Edycja komentarza
Może edytować dowolny komentarz dowolnego użytkownika.
* możliwe tylko dla zalogowanego bibliotekarza
* wymagany header: `Authorization: 'Bearer twoj_token'`
* komentarz musi istnieć
#### Endpoint: PATCH /librarian/comments/:commentId
#### Body:
* `comment` - komentarz (nie może być pusty ani samymi spacjami, ani krótszy niż 100 znaków)
#### Przykładowe zapytanie:
http://localhost:5000/librarian/comments/11

### 10. Usuwanie komentarza
Może usunąć dowolny komentarz dowolnego użytkownika.
* możliwe tylko dla zalogowanego bibliotekarza
* wymagany header: `Authorization: 'Bearer twoj_token'`
* komentarz musi istnieć
#### Endpoint: DELETE /librarian/comments/:commentId
#### Przykładowe zapytanie:
http://localhost:5000/librarian/comments/11

### 11. Usuwanie oceny
Może usunąć dowolną ocenę dowolnego użytkownika.
* możliwe tylko dla zalogowanego bibliotekarza
* wymagany header: `Authorization: 'Bearer twoj_token'`
* ocena musi istnieć
#### Endpoint: DELETE /librarian/ratings/:ratingId
#### Przykładowe zapytanie:
http://localhost:5000/librarian/ratings/11

## Zapytania dotyczące statystyk

### 1. Podstawowe Statystyki książek
#### Endpoint: GET /books/statistics/basic-statistics
#### Return body:
* `number_of_all_books` - liczba wszystkich książek
* `earliestRelease` - najwcześniejsza data wydania
* `latestRelease` - najpóźniejsza data wydania
* `avgDescriptionLength` - średnia długość opisu
#### Przykładowe zapytanie:
http://localhost:5000/books/statistics/basic-statistics

### 2. Statystyki lat wydania książek
#### Endpoint: GET /books/statistics/year-of-publication
#### Przykładowe return body:
`{total: 10, min: 1986, minNonZero: 1986.0, max: 2003,  
mean: 1996.8, 0.1: 1986, 0.5: 1997, stdev: 4.3772137256478585}`
#### Przykładowe zapytanie:
http://localhost:5000/books/statistics/year-of-publication

### 3. Statystyki ilość książek na dany gatunek, malejąca
#### Endpoint: GET /statistics/genres/number_of_books_per_genre
#### Return body array obiektów:
* `genre` - gatunek
* `number_of_books` - liczba książek
#### Przykładowe zapytanie:
http://localhost:5000/genres/number_of_books_per_genre

### 4. Statystyki ilość komentarzy na daną książkę, malejąca
#### Endpoint: GET /comments/statistics/number_of_comments_per_book
#### Return body array obiektów:
* `book_name` - tytuł książki
* `number_of_comments` - liczba komentarzy
#### Przykładowe zapytanie:
http://localhost:5000/comments/statistics/number_of_comments_per_book

### 5. Top 5, najpopularniejsi autorzy
Sumujemy liczbę ocen każdej książki, którą napisał autor i sortujemy malejąco.
#### Endpoint: GET /authors/statistics/5_most_popular_authors
#### Przykładowe zapytanie:
http://localhost:5000/authors/statistics/5_most_popular_authors

### 6. Statystyki ilość książek na danego autora, malejąca
#### Endpoint: GET /authors/statistics/number_of_books_per_author
#### Return body array obiektów:
* `author_name` - imię autora
* `number_of_books` - liczba książek
#### Przykładowe zapytanie:
http://localhost:5000/authors/statistics/number_of_books_per_author

### 7. Ilość książek na dany rok wydania, malejąca
#### Endpoint: GET /books/statistics/number_of_books_per_year
#### Return body array obiektów:
* `year` - rok wydania
* `number_of_books` - liczba książek
#### Przykładowe zapytanie:
http://localhost:5000/books/statistics/number_of_books_per_year
