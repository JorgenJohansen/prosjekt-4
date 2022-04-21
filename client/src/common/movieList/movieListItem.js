/**
 * Component showing a preview of movie details, used in MovieListContainer which is used by both search results and
 * watchlist. Is given imdbID as props from MovieListContainer and uses this to request more information of the from
 * the database via axios. The returned information is checked for errors and rendered if all is good. If not,
 * additional requests are sent, or an error message describing the issue is presented to the user.
 */

import React, {Component} from 'react';
import { Link } from "react-router-dom";
import { getAPIAddress } from '../../constants';
import './MovieListItem.css'
const axios = require('axios');
let helpers = require('../../functions/helpers.js');


class MovieListItem extends Component {
    movie = this.props.movie;
    error = null;

    getFromAPI() {
        // Sending request to get data from API. Minimized parameter means that we only get the needed "columns"
        let requestString = `${getAPIAddress()}/movie/${this.props.movie.imdbID}?minimized=true`;
        axios.get(requestString).then(res => {
            if (res.data.length > 0){
                this.movie = res.data[0];
            } else {
                this.error = { message: "Fant ingen filmer med ID: " + this.props.movie.imdbID };
                console.error("No movie found with ID:", this.props.movie.imdbID);
            }
            this.forceUpdate();
        }).catch(error => {
            console.error('error from axios!', error);
            if (error.response){
                // The server is alive and responding
                const errorObj = {
                    message: "Feil under henting av data",
                    details: error.response ? error.response.data.message : null,
                    code: error.response.status
                };
                this.error = errorObj;
                console.error('Error retrieving data from API in DetailsContainer:', errorObj);
            } else {
                // Couldn't connect to server
                this.error = {
                    message: "Fikk ikke kontakt med server"
                };
                console.error('Could not connect to server:', error);
            }
            this.forceUpdate();
        })
    }


    render() {
        if (this.error){
            return (
                <div className="movie-list-item">
                    <h3>{this.error.message}</h3>
                    {this.error.details && <p>{this.error.details}</p>}
                    {this.error.code && <p>{this.error.code}</p>}
                </div>
            );
        }
        else if (!this.movie.Title || !this.movie.Year){
            // All movies should have these parameters.
            // If they are missing, that implies that the movie object only has the imdbID
            this.getFromAPI(); // Request additional information from API
            return (
                <div className="movie-list-item">
                    <Link to={`/movie/${this.movie.imdbID}`}>
                        <div className={`image-container no-image`} />
                        <p>Laster ...</p>
                    </Link>
                </div>
            );
        } else {
            return (
                <div className="movie-list-item">
                    <Link to={`/movie/${this.movie.imdbID}`} className={"grid"}>
                        <div className={`image-container ${this.movie.Poster === 'N/A' ? 'no-image' : ''}`}>
                            {helpers.checkForNA(
                                <img src={this.movie.Poster}
                                     alt={this.movie.title} />,
                                this.movie.Poster) }
                        </div>
                        <div className={'text-container'}>
                            <h4>{this.movie.Title}</h4>
                            {helpers.checkForNA(<h5>{this.movie.Year}</h5>, this.movie.Year ) }
                            {helpers.checkForNA(<h5>{this.movie.Director}</h5>, this.movie.Director) }
                            {helpers.checkForNA(<h5>Imdb-rangering: {this.movie.imdbRating}</h5>, this.movie.imdbRating)}
                        </div>
                    </Link>
                </div>
            );
        }
    }
}

export default MovieListItem;
