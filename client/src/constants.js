const API_HOST_NAME = 'localhost';
const API_PORT = 8080;
const API_ROOT_PATH = '/api';

const getAPIAddress = () => {
    return `http://${API_HOST_NAME}:${API_PORT}${API_ROOT_PATH}`
};

const SEARCH_PAGE_OFFSET = 50;

// The first known motion picture in history was made in 1878, all our movies should be made that year or later
const MIN_SEARCH_YEAR = 1878;
const MAX_SEARCH_YEAR = 2100;

module.exports = {
    API_HOST_NAME,
    API_PORT,
    API_ROOT_PATH,
    getAPIAddress,
    SEARCH_PAGE_OFFSET,
    MIN_SEARCH_YEAR,
    MAX_SEARCH_YEAR
};
