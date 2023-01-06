# Mini dokumentacja

## Uruchamianie serwera:
#### 1. Przygotowanie pliku .env, musi się znajdować w folderze `config` i mieć nazwę `.env`

#### 2. Uruchamianie
* #### 1. Serwer wersja developerska (wymaga nodemon) dwie opcje:
pytanie, czy przy puszu te developerskie rzeczy są obecne

* #### 2. Serwer wersja produkcyjna (nie wymaga nodemon) dwie opcje:
  * npm run prodStart
  * yarn prodStart

#### 3. Logowanie się:
Konto, na które można się zalogować:
* login: `123456`
* name: `"jan library"`
* password: `1234523452345`
Albo po prostu używać tokenu:
* accessToken: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJsb2dpbiI6IjEyMzQ1NiIsInJvbGUiOiJMSUJSQVJJQU4iLCJpYXQiOjE2NzMwNDM2MDZ9.s00FbBPb8j8Vl7OAlL4JVKSLR7cOAtFeRFPbSJ4BuFA`
ale w .env trzeba ustawić:
* ACCESS_TOKEN_SECRET=d4eac626c1ed78819dd78908c9c8dc9192316503ea416e0fafa3c245857f32bb34e53e63d9fa8c7cfd4d63a8559239e6da4ab5fc784028d3b3a72e0
  b1cbd8274

## Encje:
to stany rezerwacji przeniesc do czesci gdzie są wszystkie encje
#### stany rezerwacji:
* `NOT CONFIRMED`
* `CONFIRMED`
* `WAITING`
* `RENTED OUT`
* `RETURNED`

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
#### zawartość body:
* `comment` - komentarz (nie może być pusty albo samymi spacjami, krótszy niż 100 znaków)
#### Przykładowe zapytanie dla niezalogowanej osoby:
http://localhost:5000/books/11/comments/not-logged-in-person
#### Przykładowe zapytanie dla zalogowanej osoby:
http://localhost:5000/books/11/comments

### 5. Pobierz komentarze do książki
* Książka musi istnieć
#### Endpoint: GET /books/:bookUuid/comments
#### Przykładowe zapytanie:
http://localhost:5000/books/11/comments

### 5. Dodawanie oceny książki
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

### 6. Edycja oceny książki
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

### 6. Rezerwacja książki
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

### 7. Potwierdzenie rezerwacji
* Książka musi istnieć
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
* rezerwacja musi istnieć
* można potwierdzić tylko rezerwacje o stanie `NOT CONFIRMED`
#### Endpoint: PATCH /books/:bookId/reservations/confirm
#### Przykładowe zapytanie:
http://localhost:5000/books/11/reservations/confirm

### 8. Edycja rezerwacji
* Książka musi istnieć
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
* rezerwacja musi istnieć
* możliwe tylko dla rezerwacji o stanie `NOT CONFIRMED`
#### Endpoint: PATCH /books/:bookId/reservations
#### Body:
* `rentalPeriodInDays` - na ile dni chcemy wypożyczyć książkę
(liczba, ale może być też jako string np. `"5"`, mniejsza niż 60 i większa od 0)
#### Przykładowe zapytanie:
http://localhost:5000/books/11/reservations

#### 9. Usuwanie rezerwacji
* Książka musi istnieć
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
* rezerwacja musi istnieć
* możliwe tylko dla rezerwacji o stanie `NOT CONFIRMED`
#### Endpoint: DELETE /books/:bookId/reservations
#### Przykładowe zapytanie:
http://localhost:5000/books/11/reservations

### 10. Pobranie historii rezerwacji
Rezerwacje, które już się zakończyły, posortowane po dacie, kiedy zostały oddane (stan `RETURNED`).
Posortowane malejąco.
* możliwe tylko dla zalogowanych użytkowników
* wymagany header: `Authorization: 'Bearer twoj_token'`
#### Endpoint: GET /books/:bookId/reservations/history
#### Przykładowe zapytanie:
http://localhost:5000/books/11/reservations/history

### 11. Rejestracja
#### Endpoint: POST /register
#### Body:
* login (unikalny, 20 > długość > 3, nie może to być: `Not logged client`)
* name (imie + spacje + nazwisko, np. "Jan Kowalski", 20 > długość)
* password (20 > długość > 8)
#### Przykładowe zapytanie:
http://localhost:5000/register

### 12. Logowanie
#### Endpoint: POST /login
#### Body:
* login
* password
#### Body w responsie:
* `accessToken` (używamy go przy endpointach wymajających bycia zalogowanym)
#### Przykładowe zapytanie:
http://localhost:5000/register

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
#### Endpoint: PATCH /librarian/books/:bookId
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
#### Endpoint: DELETE /librarian/books/:bookId
#### Przykładowe zapytanie:
http://localhost:5000/librarian/books/11

### 4. Dodawanie użytkownika
Tutaj możesz wybrać role.
* możliwe tylko dla zalogowanego bibliotekarza
* wymagany header: `Authorization: 'Bearer twoj_token'`
#### Endpoint: POST /librarian/persons
#### Body:
* `login` - login (unikalny, 20 > długość > 3, nie może to być: `Not logged client`)
* `name` - imie + spacje + nazwisko, np. "Jan Kowalski", 20 > długość
* `password` - hasło (20 > długość > 8)
* `role` - rola (może być tylko `CLIENT` lub `LIBRARIAN`)
#### Przykładowe zapytanie:
http://localhost:5000/librarian/persons

### 5. Edycja użytkownika
Tutaj możesz wybrać role.
* możliwe tylko dla zalogowanego bibliotekarza
* wymagany header: `Authorization: 'Bearer twoj_token'`
* użytkownik musi istnieć
#### Endpoint: PUT /librarian/persons
#### Body:
* `login` - login (unikalny, 20 > długość > 3, nie może to być: `Not logged client`)
* `name` - imie + spacje + nazwisko, np. "Jan Kowalski", 20 > długość
* `password` - hasło (20 > długość > 8)
* `role` - rola (może być tylko `CLIENT` lub `LIBRARIAN`)
#### Przykładowe zapytanie:
http://localhost:5000/librarian/persons

### 6. Usuwanie użytkownika
Można usunąć dowolnego użytkownika
* możliwe tylko dla zalogowanego bibliotekarza
* wymagany header: `Authorization: 'Bearer twoj_token'`
* użytkownik musi istnieć
#### Endpoint: DELETE /librarian/persons/:personId
#### Przykładowe zapytanie:
http://localhost:5000/librarian/persons/11

### 7. Dodawanie komentarza
* Może użyć endpointu do dodawania komentarza dostępnego dla każdej zalogowanej osoby.

### 8. Edycja komentarza
Może edytować dowolny komentarz dowolnego użytkownika.
* możliwe tylko dla zalogowanego bibliotekarza
* wymagany header: `Authorization: 'Bearer twoj_token'`
* komentarz musi istnieć
#### Endpoint: PUT /librarian/comments/:commentId
#### Body:
* `comment` - komentarz (nie może być pusty ani samymi spacjami, ani krótszy niż 100 znaków)
#### Przykładowe zapytanie:
http://localhost:5000/librarian/comments/11

### 9. Usuwanie komentarza
Może usunąć dowolny komentarz dowolnego użytkownika.
* możliwe tylko dla zalogowanego bibliotekarza
* wymagany header: `Authorization: 'Bearer twoj_token'`
* komentarz musi istnieć
#### Endpoint: DELETE /librarian/comments/:commentId
#### Przykładowe zapytanie:
http://localhost:5000/librarian/comments/11

