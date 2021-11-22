const ANIME_FAVORITES_STORAGE = 'kitsu2-anime-favorites';

const animeRow = $('#animeSection .row');
const animeTitle = $('#animeSectionTitle');
const animeInfo = $('#animeInfo');
const animePagination = $('#animePagination');
const animeFirst = $('#animeFirst');
const animePrev = $('#animePrev');
const animeNext = $('#animeNext');
const animeLast = $('#animeLast');
let animePageNumber = 1;
let currentAnimeFavorites = JSON.parse(localStorage.getItem(ANIME_FAVORITES_STORAGE)) ?? [];

class Anime {
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
    this.episodes = response.attributes?.episodeCount;
    this.durationPerEpisode = response.attributes?.episodeLength;
    this.rating = response.attributes?.averageRating;
    this.ratingRank = response.attributes?.ratingRank;
    this.nextRelease = response.attributes?.nextRelease;
    this.createdAt = response.attributes?.createdAt;
    this.showType = response.attributes?.showType;
    this.ageRating = response.attributes?.ageRating;
  }
}

function dataToAnimeArray(data) {
  const arr = [];

  data.forEach((e) => {
    const anime = new Anime(e);
    if (!anime.nsfw) arr.push(anime);
  });

  return arr;
}

function getTrendingAnime() {
  return axios
    .get(`${BASE_URL}/trending/anime`, {})
    .then((response) => {
      return dataToAnimeArray(response.data.data);
    })
    .catch((e) => {
      console.log(e);
    });
}

function getBySearchAnime(str) {
  return axios
    .get(`${BASE_URL}/anime`, {
      params: {
        'filter[text]': str,
      },
    })
    .then(function (response) {
      return {
        animes: dataToAnimeArray(response.data.data),
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

function getByPaginationAnime(str) {
  return axios
    .get(str, {})
    .then(function (response) {
      return {
        animes: dataToAnimeArray(response.data.data),
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

function getByIdAnime(id) {
  return axios
    .get(`${BASE_URL}/anime/${id}`, {})
    .then(function (response) {
      return new Anime(response.data.data);
    })
    .catch((e) => {
      console.log(e);
    });
}

async function setFavoritesAnime(id) {
  const favorites = JSON.parse(localStorage.getItem(ANIME_FAVORITES_STORAGE)) ?? [];
  favorites.push(id);
  localStorage.setItem(ANIME_FAVORITES_STORAGE, JSON.stringify(favorites));
  currentAnimeFavorites = favorites;
}

async function removeFavoritesAnime(id) {
  const favorites =
    JSON.parse(localStorage.getItem(ANIME_FAVORITES_STORAGE)).filter((v) => v != id) ?? [];
  localStorage.setItem(ANIME_FAVORITES_STORAGE, JSON.stringify(favorites));
  currentAnimeFavorites = favorites;
}

async function getFavoritesAnime() {
  const favorites = JSON.parse(localStorage.getItem(ANIME_FAVORITES_STORAGE));
  if (!favorites || !favorites.length) return [];
  for (let i = 0; i < favorites.length; i++) favorites[i] = await getByIdAnime(favorites[i]);
  return favorites;
}
