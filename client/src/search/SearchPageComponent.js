/**
 * A search page that sends queries to the API server based on the user selected search.
 * Can be instantiated with url to load directly into a query.
 *
 * Will read sorting options from Redux Store, and send those with the query.
 * Caches the result in Redux Store, to not require loading that data again if the user navigates back and forth in the
 * app.
 *
 */


import React, {Component} from 'react';
import {withRouter, Link } from 'react-router-dom';
import { connect } from 'react-redux';
import queryString from 'query-string';
import axios from 'axios';


import { addResults, addSorting, addSearchError } from '../redux/actions/actions';
import { getAPIAddress, SEARCH_PAGE_OFFSET } from '../constants';
import { compareObjects } from '../functions/helpers';

import SearchFieldComponent from './SearchFieldComponent';
import MovieListContainer from '../common/movieList/MovieListContainer';
import SortingComponent from '../sorting/presentational/SortingComponent';
import ConnectionError from '../common/error/ConnectionError';


class SearchPageComponent extends Component {
    constructor(props) {
        super(props);

        this.performSearch = this.performSearch.bind(this);
    }


    /**
     * Returns the wanted results.
     * If there are no query parameters (e.g. the user has not requested any specific search), `null` is returned
     * If the requested search is already in the Redux Store, the results from Redux Store are returned.
     * If the requested search is not in the Redux Store (i.e. the store has no results or
     * the last search result is in the store), then it performs a new query to the API through performSearch,
     * which in turn will write the new results to the store.
     *
     * To check if the results in store are the wanted results, the query parameters (title, director, startYear, etc)
     * and the sorting parameters (e.g. {value: 'imdbRating', dir: 'desc'}) are compared.
     * @return {*}
     */
    getResults() {
        const sorting = this.props.searchSorting;
        const params = this.getParams();

        // Only need to get results if there are search params
        if (params) {
            const results = this.getFromStore();
            if (
                results
                && compareObjects(params, results.searchParams)
                // Only comparing sorting if sorting parameters actually exist
                // FIXME: check this out a bit more. What happens if there are results with sorting in store, but user does not have any sorting???
                && ((sorting === null || !sorting.value) || compareObjects(sorting, results.sorting))
            ) {
                return results; // Results in Redux Store are wanted
            } else {
                this.performSearch();
            }
        }
        return null
    }


    /**
     * Returns the query params from the url if they exist. Returns an object of parmeters if they exist.
     * Otherwise returns false
     *
     * false or object of search parameters.
     * @return {*}
     */
    getParams() {
        if (this.props.location && this.props.location.search) {
            const params = queryString.parse(this.props.location.search);

            if (Object.keys(params).length > 0) {
                Object.keys(params).forEach(key => {
                    params[key] = params[key].toLowerCase();
                });
                return params;
            }
            // If there are no search parameters
            return false;
        }
    }


    /**
     * Retrieves searchResults from Redux Store.
     * Returns the data from store if valid (e.g. it has results and searchParams).
     * Returns `null` otherwise
     * @return {*}
     */
    getFromStore(){
        const newResults = this.props.searchResults;
        if (newResults && newResults.results && newResults.searchParams) {
            return newResults;
        }
        return null;
    }


    /**
     * Retrieves searchSorting (search result sorting options) from Redux Store.
     * Returns the data from store if valid (e.g. it has value and dir).
     * Returns `null` otherwise
     * @return {*}
     */
    getSortingParams(){
        const sorting = this.props.searchSorting;

        if (sorting && sorting.dir && sorting.value) {
            return sorting
        } else {
            return false;
        }
    }

    /**
     * Returns true if there are searchResults and they are not marked as endOfResults.
     * Returns false otherwise.
     *
     * "mightExist", as we have loaded 100 results, and there are exactly 100 results in the full query from the
     * db, endOfResults is not set yet. However, trying to load more results after this will result in
     * endOfResults being set.
     * @return {Boolean}
     */
    mightExistMoreResults() {
        if (!this.props.searchResults.results) {
            return false;
        }
        return (this.props.searchResults && !this.props.searchResults.endOfResults)
    }






    /**
     * Retrieves data from the API if the search parameter `title` is set and then writes it to the Redux Store.
     *
     * Will not perform query if we are requesting the "next page" of a result and it is determined that we are at the
     * end of the results, i.e. a new query would return an empty result.
     *
     * Applies all search parameters (and sorting parameters if they exist) to the request, as well as a limit and
     * a offset.
     * Will not set any offset if we are not requesting the next page in a query, rather a totally new request.
     *
     * After receiving data from the API, if it determines that we are at the end of the result (i.e. it received fewer
     * results than the page limitation), it sets the endOfResult flag on the result object
     * before writing it to the Redux Store
     *
     * @param nextPage <Boolean> if false, it will not apply any offset, nor check for endOfResult before quering.
     */
    performSearch(nextPage) {
        // TODO: Maybe errors should be written to the store?
        const params = this.getParams(); // params need to include filter params from store as well
        let endOfResults = false;

        if (params && params.title) {


            // Only applicable if we are requesting next page
            if (nextPage && this.props.searchResults && this.props.searchResults.results && this.props.searchResults.results.length > 0 && this.props.searchResults.endOfResults ){
                endOfResults = true;
            }


            if (!endOfResults) {
                let requestString = `${getAPIAddress()}/search?${queryString.stringify(params)}`;

                const {value, dir} = this.getSortingParams();
                if(value && dir && value !== 'imdbID') {
                    // Sorted on imdbID is the natural sorting, no need to specify in request
                    const sortingParsed = queryString.stringify({sortOn: value, sortDir: dir});
                    requestString += `&${sortingParsed}`
                }


                if (nextPage) {
                    // If we are requesting the next page of a query, we need to add a offset
                    requestString += `&limit=${SEARCH_PAGE_OFFSET}&offset=${getCurrentPage(this.props.searchResults.results) * SEARCH_PAGE_OFFSET}`;
                } else {
                    // No need for a offset if we are requesting the beginning of a result
                    requestString += `&limit=${SEARCH_PAGE_OFFSET}`;
                }


                axios.get(requestString).then(res => {
                    let sortingObj = {
                        value: null,
                        dir: null
                    };

                    // Applying sorting options if those are set
                    if (this.props.searchSorting) {
                        sortingObj = this.props.searchSorting
                    }

                    // Applying endOfResult flag if it determines that we are at the end of the result
                    if (res.data.length < SEARCH_PAGE_OFFSET) {
                        // We just received the last results of this query.
                        endOfResults = true
                    }


                    let newResults;
                    if (nextPage && this.props.searchResults && this.props.searchResults.results && this.props.searchResults.results.length > 0) {
                        // If we are requesting the next page of a query, we add the received results to those already in the Redux Store
                        newResults = this.props.searchResults.results.concat(res.data);
                    } else {
                        newResults = res.data;
                    }
                    this.writeResultsToStore(
                        {
                            searchParams: params,
                            results: newResults,
                            sorting: sortingObj,
                            endOfResults: endOfResults
                        }
                    );
                }).catch(error => {
                    // TODO: Errors should be presented to user, now they only see 'Loading movies' if there is an error
                    console.error(error);
                    if (error.response) {
                        console.error(error.response.data.message);
                        console.error(error.response.data.details);
                    }

                    this.props.addSearchError(error);
                })
            }
        } else {
            console.error('Required title search parameter missing!')
        }
    }


    /**
     * Writes data to the store if it contains a result and searchParams.
     * Resetting searchError as well.
     * Logs error to the console otherwise.
     * @param data
     */
    writeResultsToStore(data) {
        // Checking for validity
        if (data && data.searchParams && data.results) {
            // Sending data to the store
            this.props.addResults(data);
            this.clearError();
        } else {
            console.error('Missing data, cannot dispatch data to store!')
        }
    }

    clearError() {
        this.props.addSearchError(null); // Removing searchError
    }




    render() {
        if (this.props.searchError) {
            return (
                <ConnectionError
                    error={this.props.searchError}
                    linkComponent={
                        (<a href="/search/">Gå tilbake til søkeforsiden</a>)
                    }
                    // Using anchor instead of Link as we might want to remount the app when there is an error
                />
            );
        } else {
            let body = null;
            // Retrieving results if there are no errors.
            let results = this.getResults();

            if (results && results.results && results.results.length < 1){
                body = (
                    <div>
                        <h4>Det finnes ingen filmer som tilfredsstiller søket ditt.</h4>
                        <Link to="/search/"> Tilbake til søkeforsiden </Link>
                    </div>
                );
            } else if (results) {
                body = (<div>
                        <MovieListContainer movies={results.results}/>
                    </div>
                );

            } else if (this.getParams()) {
                // There are search params, but no results, means we are waiting for response from API
                body = (
                    <h3>Laster resultater ...</h3>
                );
            } else {
                // There are no search params and no results
                body = (
                    <div>
                        <p>Søk på noe kult i søkeboksen da vel!</p>
                    </div>
                );
            }

            return (
                <div className="searchPageComponent">
                    <SearchFieldComponent params={this.getParams()}/>
                    {
                        /**
                         * Only showing sortingComponent if there are more than one result.
                         * No need in sorting 0 or 1 result, as that won't make much difference
                         */
                        results && results.results && results.results.length > 1 &&
                        <SortingComponent options={[
                            {value: 'Year', dir: 'asc', name: 'År lav-høy'},
                            {value: 'Year', dir: 'desc', name: 'År høy-lav'},
                            {value: 'imdbRating', dir: 'asc', name: 'IMDB-rangering lav-høy'},
                            {value: 'imdbRating', dir: 'desc', name: 'IMDB-rangering høy-lav'},
                            {value: 'Title', dir: 'asc', name: 'Tittel A-Z'},
                            {value: 'Title', dir: 'desc', name: 'Tittel Z-A'},
                            {value: 'Director', dir: 'asc', name: 'Regissør A-Z'},
                            {value: 'Director', dir: 'desc', name: 'Regissør Z-A'},
                        ]}/>

                    }
                    {body}

                    {this.mightExistMoreResults() &&
                    // Hidden if there are no more results in this query
                    <button type="button"
                            onClick={(evt) => {
                                evt.preventDefault();
                                this.performSearch(true);
                            }}>
                        Vis flere resultater
                    </button>
                    }
                </div>
            );
        }
    }
}



/**
 * Calculates which "page number" is the current one.
 * @param results the full results object from Redux Store
 * @return {number}
 */
const getCurrentPage = results => {
    if (results && results.length) {
        return Math.ceil(results.length/SEARCH_PAGE_OFFSET);
    } else {
        return 1;
    }
};


/**
 * Maps which store values that should be props for this component
 * @param state
 * @return {{searchResults: *, searchSorting: *, searchError: *}}
 */
const mapStateToProps = state => {
    const { searchResults, searchSorting, searchError } = state;
    return { searchResults, searchSorting, searchError };
};

export default connect(mapStateToProps, { addResults, addSorting, addSearchError })(withRouter(SearchPageComponent));
