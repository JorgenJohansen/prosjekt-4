/**
 * Retrieves the watchlist from LocalStorage. Returns empty object if it does not exist.
 * @return {*}
 */
const getWatchlistLocalStorage = () => {
    const result = JSON.parse(localStorage.getItem('watchList'));
    if ( result !== null) {
        return result;
    }
    return {}
};

/**
 * Writes data to watchlist in localStorage
 * @param data
 */
const writeWatchlistLocalStorage = data =>  {
    localStorage.setItem('watchList', JSON.stringify(data));
};

module.exports = {
  getWatchlistLocalStorage,
  writeWatchlistLocalStorage
};
