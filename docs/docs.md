# Mini dokumentacja
## Podstawowe endpointy:

### 1. Pobierz wszystkie książki
#### Endpoint: GET /books
#### Opcjonalne parametry:
* `title` - filtrowanie po tytule
* `authors` - filtrowanie po autorach
* `genres` - filtrowanie po gatunkach: `Fantasy`, `Romance`, `Fiction`, `Magical Realism`, `Adventure`, `Mystery`
* `sortBy` - sortowanie po wartościach: `title`|`releaseDate`|`avgRating`
* `sortOrder` - sortowanie rosnąco lub malejąco: `asc`|`desc` (default: `asc`)
#### Przykładowe zapytanie:
http://localhost:5000/books?title=The Great Gatsby&genres=Fiction     ,Romance&author=F. Scott Fitzgerald

### 2. Pobierz popularne książki (najczęściej oceniane)
#### Endpoint: GET /books/popular/:limit
#### parametry:
* `limit` - limit wyników (liczba większa od zera)
#### Przykładowe zapytanie:
http://localhost:5000/books/popular/5

### 3. Pobierz szczegóły książki po id
#### Endpoint: GET /books/details/:bookId
#### zwraca:
tytuł, zdjecie o ile istnieje, opis, data, gatunki, autorów, wydawnictwo, rok wydania, srednia ocen z iloscia glosow
#### Przykładowe zapytanie:
http://localhost:5000/books/details/11

### 4. Dodawanie komentarza do książki
#### Endpoint: POST:
* dla zalogowanej osoby komentarz przypisany będzie do niej
  POST /books/:bookId/comments
* dla niezalogowanej osoby komentarz będzie anonimowy
  POST /books/:bookId/comments/not-logged-in-client
#### zawartość body:
* `comment` - komentarz
#### Przykładowe zapytanie dla niezalogowanej osoby:
http://localhost:5000/books/11/comments/not-logged-in-client
#### Przykładowe zapytanie dla zalogowanej osoby:
http://localhost:5000/books/11/comments

### 5. Dodawanie oceny książki
* możliwe tylko dla zalogowanych użytkowników
#### Endpoint: POST /books/:bookId/ratings
#### zawartość body:
* `rating` - ocena
* `expiryDate` - kiedy ocena wygasa (opcjonalne)
#### Przykładowe zapytanie:
http://localhost:5000/books/11/ratings

### 6. Rezerwacja książki
* możliwe tylko dla zalogowanych użytkowników
#### Endpoint: POST /books/:bookId/reservations
to stany rezerwacji przeniesc do czesci gdzie są wszystkie encje
#### stany rezerwacji:
* `not confirmed`
* `confirmed`
* `waiting`
* `rented out`
* `returned`
#### Body:
* `rentalPeriod` - na ile dni chcemy wypożyczyć książkę
#### Przykładowe zapytanie:
http://localhost:5000/books/11/reservations

### 7. Potwierdzenie rezerwacji
* możliwe tylko dla zalogowanych użytkowników
* rezerwacja musi istnieć
* można potwierdzić tylko rezerwacje o stanie `not confirmed`
#### Endpoint: PATCH /books/:bookId/reservations/confirm
#### Przykładowe zapytanie:
http://localhost:5000/books/11/reservations/confirm

### 8. Edycja rezerwacji
* możliwe tylko dla zalogowanych użytkowników
* rezerwacja musi istnieć
* możliwe tylko dla rezerwacji o stanie `not confirmed`
#### Endpoint: PATCH /books/:bookId/reservations
#### Body:
* `rentalPeriodInDays` - na ile dni chcemy wypożyczyć książkę
#### Przykładowe zapytanie:
http://localhost:5000/books/11/reservations

#### 9. Usuwanie rezerwacji
* rezerwacja musi istnieć
* możliwe tylko dla rezerwacji o stanie `not confirmed`
* możliwe tylko dla zalogowanych użytkowników
#### Endpoint: DELETE /books/:bookId/reservations
#### Przykładowe zapytanie:
http://localhost:5000/books/11/reservations

### 10. Pobranie historii rezerwacji
Rezerwacje, które już się zakończyły, posortowane po dacie, kiedy zostały oddane (stan `returned`).
Posortowane malejąco.
* możliwe tylko dla zalogowanych użytkowników
#### Endpoint: GET /books/:bookId/reservations/history
#### Przykładowe zapytanie:
http://localhost:5000/books/11/reservations/history

## Panel administracyjny
W kodzie jest to nazwane jako `librarian` bardziej tematycznie

### 1. Dodawanie książki
* możliwe tylko dla zalogowanego bibliotekarza
#### Endpoint: POST /librarian/books
#### Body:
* `title` - tytuł
* `description` - opis
* `releaseDate` - data wydania
* `imageLink` - link do zdjęcia
* `genres` - gatunki
* `authors` - autorzy
* `publishingHouse` - wydawnictwo
#### Przykładowe zapytanie:
http://localhost:5000/books

### 2. Edycja książki
* możliwe tylko dla zalogowanego bibliotekarza
* książka musi istnieć
#### Endpoint: PATCH /librarian/books/:bookId
#### Body:
* `title` - tytuł
* `description` - opis
* `releaseDate` - data wydania
* `imageLink` - link do zdjęcia
* `genres` - gatunki
* `authors` - autorzy
* `publishingHouse` - wydawnictwo
#### Przykładowe zapytanie:
http://localhost:5000/books/11

### 3. Usuwanie książki
* możliwe tylko dla zalogowanego bibliotekarza
* książka musi istnieć
#### Endpoint: DELETE /books/:bookId
#### Przykładowe zapytanie:
http://localhost:5000/books/11

