/**
 * Component showing a list of previews of movie details, used in both SearchPageComponent and WatchList.
 * Is given a list of imdbIDs as props from the parent (SearchPageComponent or WatchList) which passed on to the
 * movieListItems it renders
 */

import React, {Component} from 'react';
import MovieListItem from "./movieListItem";
import './MovieListContainer.css'

class MovieListContainer extends Component {

    render() {
        let movieList = [];
        this.props.movies.forEach((movie) => {
            movieList.push(
                <MovieListItem key={movie.imdbID} movie={movie}/>
            )
        });

        return (
            <div className="movie-list-container">
                <div>{movieList}</div>
            </div>
        );
    }
}

export default MovieListContainer;
