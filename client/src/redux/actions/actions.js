import { ADD_RESULTS, ADD_SORTING, ADD_SEARCH_ERROR } from '../constants/actionTypes.js';

export const addResults = results => ({
    type: ADD_RESULTS,
    payload: results,
});


export const addSorting = sorting => ({
    type: ADD_SORTING,
    payload: sorting,
});


export const addSearchError = error => ({
    type: ADD_SEARCH_ERROR,
    payload: error,
});


