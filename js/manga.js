const MANGA_FAVORITES_STORAGE = 'kitsu2-manga-favorites';

const mangaRow = $('#mangaSection .row');
const mangaTitle = $('#mangaSectionTitle');
const mangaInfo = $('#mangaInfo');
const mangaPagination = $('#mangaPagination');
const mangaFirst = $('#mangaFirst');
const mangaPrev = $('#mangaPrev');
const mangaNext = $('#mangaNext');
const mangaLast = $('#mangaLast');
let mangaPageNumber = 1;
let currentMangaFavorites = JSON.parse(localStorage.getItem(MANGA_FAVORITES_STORAGE)) ?? [];

class Manga {
  constructor(response) {
    this.original = response;
    this.id = response.id;
    this.nsfw = response.attributes?.nsfw;
    this.title = response.attributes?.canonicalTitle;
    this.description = response.attributes?.description;
    this.synopsis = response.attributes?.synopsis;
    this.image =
      response.attributes?.coverImage?.large ??
      response.attributes?.coverImage?.original ??
      response.attributes?.coverImage?.tiny ??
      response.attributes?.coverImage?.small ??
      response.attributes?.posterImage?.large ??
      response.attributes?.posterImage?.original ??
      response.attributes?.posterImage?.medium ??
      response.attributes?.posterImage?.tiny ??
      response.attributes?.posterImage?.small;
    this.alt = response.attributes?.slug;
    this.chapters = response.attributes?.chapterCount;
    this.volumes = response.attributes?.volumeCount;
    this.rating = response.attributes?.averageRating;
    this.status = response.attributes?.status;
    this.createdAt = response.attributes?.createdAt;
    this.mangaType = response.attributes?.mangaType;
    this.ageRating = response.attributes?.ageRating;
  }
}

function dataToMangaArray(data) {
  const arr = [];

  data.forEach((e) => {
    const manga = new Manga(e);
    if (!manga.nsfw) arr.push(manga);
  });

  return arr;
}

function getTrendingManga() {
  return axios
    .get(`${BASE_URL}/trending/manga`, {})
    .then((response) => {
      return dataToMangaArray(response.data.data);
    })
    .catch((e) => {
      console.log(e);
    });
}

function getBySearchManga(str) {
  return axios
    .get(`${BASE_URL}/manga`, {
      params: {
        'filter[text]': str,
      },
    })
    .then(function (response) {
      return {
        mangas: dataToMangaArray(response.data.data),
        firstPage: response.data.links?.first,
        prevPage: response.data.links?.prev,
        nextPage: response.data.links?.next,
        lastPage: response.data.links?.last,
        totalResults: response.data.meta?.count,
      };
    })
    .catch((e) => {
      console.log(e);
    });
}

function getByPaginationManga(str) {
  return axios
    .get(str, {})
    .then(function (response) {
      return {
        mangas: dataToMangaArray(response.data.data),
        firstPage: response.data.links?.first,
        prevPage: response.data.links?.prev,
        nextPage: response.data.links?.next,
        lastPage: response.data.links?.last,
        totalResults: response.data.meta?.count,
      };
    })
    .catch((e) => {
      console.log(e);
    });
}

function getByIdManga(id) {
  return axios
    .get(`${BASE_URL}/manga/${id}`, {})
    .then(function (response) {
      return new Manga(response.data.data);
    })
    .catch((e) => {
      console.log(e);
    });
}

async function setFavoritesManga(id) {
  const favorites = JSON.parse(localStorage.getItem(MANGA_FAVORITES_STORAGE)) ?? [];
  favorites.push(id);
  localStorage.setItem(MANGA_FAVORITES_STORAGE, JSON.stringify(favorites));
  currentMangaFavorites = favorites;
}

async function removeFavoritesManga(id) {
  const favorites =
    JSON.parse(localStorage.getItem(MANGA_FAVORITES_STORAGE)).filter((v) => v != id) ?? [];
  localStorage.setItem(MANGA_FAVORITES_STORAGE, JSON.stringify(favorites));
  currentMangaFavorites = favorites;
}

async function getFavoritesManga() {
  const favorites = JSON.parse(localStorage.getItem(MANGA_FAVORITES_STORAGE));
  if (!favorites || !favorites.length) return [];
  for (let i = 0; i < favorites.length; i++) favorites[i] = await getByIdManga(favorites[i]);
  return favorites;
}
