/**
 * Component which shows lists of movies you 'want to watch' or 'has watched'.
 * The component uses localStorage, via a helper function i helpers.js, to get the imdbIDs of the movies, and is
 * therefore linked to the user via its browser. If no movies are saved to any of these lists, a message explaining how
 * movies can be added is showed.
 * The presentation of the lists is taken care of by MovieListContainer and movieListItem by passing them the imdbIDs.
 */

import React, { Component } from 'react';
import { Link } from "react-router-dom";
import { WANT_TO_WATCH, HAS_WATCHED } from './constants';
import MovieListContainer from "../common/movieList/MovieListContainer";
import { getWatchlistLocalStorage } from '../watchlist/helpers.js';
import './Watchlist.css';

class Watchlist extends Component {

    /**
     * Returns two arrays with movies from the watchlist in LocalStorage
     * @return {{hasWatched: Array, wantToWatch: Array}}
     */
    populateWatchlists = () => {
        let hasWatched = [];
        let wantToWatch = [];
        const watchlist = getWatchlistLocalStorage();

        for(let key of Object.keys(watchlist)) {
            // TODO: Check with API if movie exists in DB, remove it from watchlist if it does not exist
            if (watchlist[key] === HAS_WATCHED) {
                hasWatched.push({imdbID: key});
            } else if(watchlist[key] === WANT_TO_WATCH){
                wantToWatch.push({imdbID: key});
            }
        }
        return { hasWatched, wantToWatch };
    };

    render(){
        const watchlists = this.populateWatchlists();

        if (watchlists.wantToWatch.length === 0 && watchlists.hasWatched.length === 0) {
            return(
                <div className='watchlist'>
                    <h1>Du har ingen filmer i din Watchlist</h1>
                    <p> Du kan finne filmer på <Link to='/search/'>søkesiden,</Link> klikke deg inn på dem, og legge dem til i din Watchlist.
                    </p>
                </div>
            );
        } else {
            
            return(
                <div className='watchlist'>
                    {watchlists.wantToWatch.length !== 0 && <h1>Filmene du ønsker å se</h1> }
                    <MovieListContainer movies={watchlists.wantToWatch}/>
                    {watchlists.hasWatched.length !== 0 && <h1>Filmene du har sett</h1> }
                    <MovieListContainer movies={watchlists.hasWatched}/>
                </div>
            );
        }
    }
}

export default Watchlist;
