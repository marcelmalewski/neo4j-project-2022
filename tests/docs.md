## Mini dokumentacja
### 1. Pobierz wszystkie książki
#### Opcjonalne parametry:
* `title` - filtrowanie po tytule
* `authors` - filtrowanie po autorach
* `genres` - filtrowanie po gatunkach
* `sortBy` - sortowanie po wartościach: `title`|`releaseDate`|`avgRating`
* `sortOrder` - sortowanie rosnąco lub malejąco: `asc`|`desc` (default: `asc`)
#### Przykładowy endpoint:
http://localhost:5000/books?title=The Great Gatsby&genres=Fiction     ,Romance&author=F. Scott Fitzgerald
