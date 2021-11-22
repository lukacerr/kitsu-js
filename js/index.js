AOS.init();

const BASE_URL = 'https://kitsu.io/api/edge';
const body = $('body');
const modalTitle = $('#modalTitle');
const modalBody = $('#modalBody');
const searchButton = $('#searchButton');
const favoritesButton = $('#favoritesButton');

$(() => {
  $('#themeButton').click(() => {
    toggleTheme();
  });

  const setAnimeGrid = (animes, favorites) => {
    animeRow.empty();
    if (!animes || !animes.length) return animeRow.append('<h4>0 results found.<h4>');

    animes.forEach((e) => {
      const cardId = `#animeCard${e.id}`;
      let favorited = currentAnimeFavorites.includes(e.id);
      animeRow.append(`
        <div class="col-md-12 col-lg-4 col-xl-3" style="padding: 1em" data-aos="fade-up" data-aos-once="true">
          <article class="card" id="${cardId.substring(1)}" title="${e.title}" style="border: ${
        !favorited ? 'none' : '0.25em solid #fd8320'
      }">
            <div class="card-header">${e.title + (favorited ? ' (favorited)' : '')}</div>
  
            <img
              src="${e.image}"
              class="card-img-top"
              alt="${e.alt}"
            />
  
            <div class="card-body">
              <div class="card-title">
                <h5><i class="fas fa-star"></i> RATING: ${e.rating ?? '??'}</h5>
                <h5>${e.showType ?? '??'} - ${e.ageRating ?? '??'}</h5>
              </div>
  
              <p class="card-text">
                ${
                  (!e.synopsis
                    ? 'No synopsis was found for this anime'
                    : e.synopsis?.slice(0, 250)) + '...'
                }
              </p>
  
              <p class="card-text"><small class="text-muted">Status: <span style="color: ${
                e.nextRelease ? '#4fcd68' : '#ed4245'
              }">${e.nextRelease ? 'ON GOING' : 'FINISHED'}</span></small></p>
            </div>
          </article>
        </div> 
      `);

      $(cardId).click(async () => {
        favorited = currentAnimeFavorites.includes(e.id);
        if (!favorites && !favorited) {
          setFavoritesAnime(e.id);
          $(cardId).css('border', '0.25em solid #fd8320');
          $(`${cardId} .card-header`).text(e.title + ' (favorited)');
        } else {
          removeFavoritesAnime(e.id);
          if (favorites) await goToFavorites();
          else {
            $(cardId).css('border', 'none');
            $(`${cardId} .card-header`).text(e.title);
          }
        }
      });

      $(cardId).mousedown((event) => {
        if (event.which == 3) {
          modalTitle.text('[ANIME] ' + e.title);
          modalBody.empty();
          modalBody.append(`<code>${JSON.stringify(e.original, null, 2)}</code>`);
          new bootstrap.Modal(document.getElementById('modal'), {}).show();
        }

        return true;
      });
    });
  };

  const setMangaGrid = (mangas, favorites) => {
    mangaRow.empty();
    if (!mangas || !mangas.length) return mangaRow.append('<h4>0 results found.<h4>');

    mangas.forEach((e) => {
      const cardId = `#mangaCard${e.id}`;
      let favorited = currentMangaFavorites.includes(e.id);
      mangaRow.append(`
        <div class="col-md-12 col-lg-4 col-xl-3" style="padding: 1em" data-aos="fade-up" data-aos-once="true">
          <article class="card" id="${cardId.substring(1)}" title="${e.title}" style="border: ${
        !favorited ? 'none' : '0.25em solid #fd8320'
      }">
            <div class="card-header">${e.title + (favorited ? ' (favorited)' : '')}</div>
  
            <img
              src="${e.image}"
              class="card-img-top"
              alt="${e.alt}"
            />
  
            <div class="card-body">
              <div class="card-title">
                <h5><i class="fas fa-star"></i> RATING: ${e.rating ?? '??'}</h5>
                <h5>${e.mangaType ?? '??'} - ${e.ageRating ?? '??'}</h5>
              </div>
  
              <p class="card-text">
                ${
                  (!e.synopsis
                    ? 'No synopsis was found for this anime'
                    : e.synopsis?.slice(0, 250)) + '...'
                }
              </p>
  
              <p class="card-text"><small class="text-muted">Status: <span style="color: ${
                !e.status || e.status != 'finished' ? '#4fcd68' : '#ed4245'
              }">${e.status?.toUpperCase() ?? 'UNKNOWN'}</span></small></p>
            </div>
          </article>
        </div> 
      `);

      $(cardId).click(async () => {
        favorited = currentMangaFavorites.includes(e.id);
        if (!favorites && !favorited) {
          setFavoritesManga(e.id);
          $(cardId).css('border', '0.25em solid #fd8320');
          $(`${cardId} .card-header`).text(e.title + ' (favorited)');
        } else {
          removeFavoritesManga(e.id);
          if (favorites) await goToFavorites();
          else {
            $(cardId).css('border', 'none');
            $(`${cardId} .card-header`).text(e.title);
          }
        }
      });

      $(cardId).mousedown((event) => {
        if (event.which == 3) {
          modalTitle.text('[MANGA] ' + e.title);
          modalBody.empty();
          modalBody.append(`<code>${JSON.stringify(e.original, null, 2)}</code>`);
          new bootstrap.Modal(document.getElementById('modal'), {}).show();
        }

        return true;
      });
    });
  };

  const init = async () => {
    const animes = await getTrendingAnime();
    const mangas = await getTrendingManga();

    setAnimeGrid(animes);
    setMangaGrid(mangas);
    animeTitle.text('TRENDING ANIMES');
    mangaTitle.text('TRENDING MANGAS');

    animePagination.fadeOut();
    animeInfo.fadeOut();
    mangaPagination.fadeOut();
    mangaInfo.fadeOut();
  };

  async function animeGridSetUp(str, text, isSearch) {
    if (!str) return init();

    const { animes, firstPage, lastPage, nextPage, prevPage, totalResults } = await (isSearch
      ? getBySearchAnime(str)
      : getByPaginationAnime(str));

    setAnimeGrid(animes);

    animeTitle.text(`ANIME RESULTS FOR: ${text}`);

    if (totalResults > 10) {
      const lastPageValue = Math.ceil(totalResults / 10);

      animeInfo.fadeIn();
      animeInfo.text(`Page ${animePageNumber} of ${lastPageValue} (${totalResults} results)`);

      animePagination.fadeIn();

      if (!firstPage || animePageNumber == 1) animeFirst.fadeOut();
      else {
        animeFirst.fadeIn();
        animeFirst.unbind('click');
        animeFirst.click(async () => {
          animePageNumber = 1;
          await animeGridSetUp(firstPage, text, false);
        });
      }

      if (!prevPage) animePrev.fadeOut();
      else {
        animePrev.fadeIn();
        animePrev.unbind('click');
        animePrev.click(async () => {
          animePageNumber--;
          await animeGridSetUp(prevPage, text, false);
        });
      }

      if (!nextPage) animeNext.fadeOut();
      else {
        animeNext.fadeIn();
        animeNext.unbind('click');
        animeNext.click(async () => {
          animePageNumber++;
          await animeGridSetUp(nextPage, text, false);
        });
      }

      if (!lastPage || animePageNumber == lastPageValue) animeLast.fadeOut();
      else {
        animeLast.fadeIn();
        animeLast.unbind('click');
        animeLast.click(async () => {
          animePageNumber = lastPageValue;
          await animeGridSetUp(lastPage, text, false);
        });
      }
    } else {
      if (totalResults != 0) animeInfo.text(`Page 1 of 1 (${totalResults} results)`);
      else animeInfo.fadeOut();

      animePagination.fadeOut();
    }
  }

  async function mangaGridSetUp(str, text, isSearch) {
    if (!str) return init();

    const { mangas, firstPage, lastPage, nextPage, prevPage, totalResults } = await (isSearch
      ? getBySearchManga(str)
      : getByPaginationManga(str));

    setMangaGrid(mangas);

    mangaTitle.text(`MANGA RESULTS FOR: ${text}`);

    if (totalResults > 10) {
      const lastPageValue = Math.ceil(totalResults / 10);

      mangaInfo.fadeIn();
      mangaInfo.text(`Page ${mangaPageNumber} of ${lastPageValue} (${totalResults} results)`);

      mangaPagination.fadeIn();

      if (!firstPage || mangaPageNumber == 1) mangaFirst.fadeOut();
      else {
        mangaFirst.fadeIn();
        mangaFirst.unbind('click');
        mangaFirst.click(async () => {
          mangaPageNumber = 1;
          await mangaGridSetUp(firstPage, text, false);
        });
      }

      if (!prevPage) mangaPrev.fadeOut();
      else {
        mangaPrev.fadeIn();
        mangaPrev.unbind('click');
        mangaPrev.click(async () => {
          mangaPageNumber--;
          await mangaGridSetUp(prevPage, text, false);
        });
      }

      if (!nextPage) mangaNext.fadeOut();
      else {
        mangaNext.fadeIn();
        mangaNext.unbind('click');
        mangaNext.click(async () => {
          mangaPageNumber++;
          await mangaGridSetUp(nextPage, text, false);
        });
      }

      if (!lastPage || mangaPageNumber == lastPageValue) mangaLast.fadeOut();
      else {
        mangaLast.fadeIn();
        mangaLast.unbind('click');
        mangaLast.click(async () => {
          mangaPageNumber = lastPageValue;
          await mangaGridSetUp(lastPage, text, false);
        });
      }
    } else {
      if (totalResults != 0) mangaInfo.text(`Page 1 of 1 (${totalResults} results)`);
      else mangaInfo.fadeOut();

      mangaPagination.fadeOut();
    }
  }

  async function goToSearch() {
    const str = $('#searchInput')[0].value;
    animePageNumber = 1;
    mangaPageNumber = 1;

    await animeGridSetUp(str, str, true);
    await mangaGridSetUp(str, str, true);
  }

  searchButton.click(async (e) => {
    await goToSearch();
  });

  $(document).keypress(async (e) => {
    if (e.which == 13) await goToSearch();
  });

  async function goToFavorites() {
    const animes = await getFavoritesAnime();
    const mangas = await getFavoritesManga();

    setAnimeGrid(animes, true);
    setMangaGrid(mangas, true);

    animeTitle.text('YOUR ANIME FAVORITES');
    animePagination.fadeOut();
    animeInfo.fadeOut();

    mangaTitle.text('YOUR MANGA FAVORITES');
    mangaPagination.fadeOut();
    mangaInfo.fadeOut();
  }

  favoritesButton.click(async (e) => {
    await goToFavorites();
  });

  init();
  themeInit();
});
