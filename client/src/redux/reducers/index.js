import { ADD_SORTING, ADD_RESULTS, ADD_SEARCH_ERROR } from '../constants/actionTypes';


const initialState = {
    searchSorting: {
        value: null,
        dir: null
    },
    searchResults: [],
    searchParams: {},
    endOfResults: false
};


// simple sorting reducer
const rootReducer = (state = initialState, action) => {
    switch(action.type){
        case ADD_SORTING:
            // console.log("sorting options have been updated");
            return {
                ...state,
                searchSorting: {
                    value: action.payload.value,
                    dir: action.payload.dir,
                }
            };
        case ADD_RESULTS:
            // console.log("results have been updated");
            return {
                ...state,
                searchResults: action.payload,
            };
        case ADD_SEARCH_ERROR:
            // console.log('Search error added');
            return {
                ...state,
                searchError: action.payload,
            };
        default:
            // console.log("Nothing was added");
            return state;
    }
};

export default rootReducer;
