/**
 * A component showing an extended list of information about a movie. It also contains buttons to control the given
 * movie's watchlist status, i.e. add and remove from 'want to watch' and 'has watched'
 *
 * Is given imdbID as props from a search, or direct url and uses this to request more information of the from the
 * database via axios. The returned information is checked for errors and rendered if all is good. If not an error
 * message describing the issue is presented to the user.
 */

import React, { Component } from 'react';
import axios from 'axios';
import { checkForNA, checkForEmptyArr } from '../../functions/helpers';
import { getAPIAddress } from '../../constants';
import { WANT_TO_WATCH, RM_WANT_TO_WATCH, HAS_WATCHED, RM_HAS_WATCHED } from '../../watchlist/constants';
import { getWatchlistLocalStorage, writeWatchlistLocalStorage } from '../../watchlist/helpers.js';

import YearComp from '../presentational/Year';
import PosterComp from '../presentational/Poster';
import TitleComp from '../presentational/Title';
import RatedComp from '../presentational/Rated';
import GenreComp from '../presentational/Genre';
import DirectorComp from '../presentational/Director';
import WriterComp from '../presentational/Writer';
import ActorsComp from '../presentational/Actors';
import ImdbRatingComp from '../presentational/ImdbRating';
import ConnectionError from "../../common/error/ConnectionError";

import './MovieDetails.css';

export default class MovieDetails extends Component {

    constructor(props){
        super(props);

        this.state = {
            movie: null,
            error: {
                message: null,
                details: null
            }
        }
    }


    componentDidMount(){
        let imdbID = this.props.imdbID;
        let requestString = `${getAPIAddress()}/movie/${imdbID}`;
        //axios gjør en get request for å hente filmen vi ønsker å vise
        axios.get(requestString).then(res => {
            if (res.data.length > 0){
                this.setState({movie: res.data[0]});
            } else {
                this.setState({
                    error: {
                        message: "Fant ingen filmer med ID: " + this.props.imdbID
                    }
                });
                console.error("No movie found with that ID");
            }
        }).catch(error => {
            if (error.response){
                // The server is alive and responding
                let errorObj = {
                    message: "Feil under henting av data",
                    details: error.response ? error.response.data.message : null,
                    code: error.response.status
                };
                this.setState({
                    error: errorObj
                });
                console.error('Error retrieving data from API in DetailsContainer:', errorObj);
            } else {
                // Couldn't connect to server
                this.setState({
                    error: {
                        message: "Fikk ikke kontakt med server"
                    }
                });
                console.error('Could not connect to server:', error);
            }
        })
    }

    //Funksjon som bare returnerer filmen som ligger i this.state
    getData = () => {
        // TODO: consider if we should cache recent movies in Redux
        return this.state.movie;
    };

    handleClick = (e) =>{
        e.preventDefault();
        const clicked = e.target;
        const watchList = getWatchlistLocalStorage();
        const imdbID = this.props.imdbID;


        switch (clicked.value) {
            case WANT_TO_WATCH:
                watchList[imdbID] = WANT_TO_WATCH;
                break;
            case RM_WANT_TO_WATCH:
                delete watchList[imdbID];
                break;
            case HAS_WATCHED:
                watchList[imdbID] = HAS_WATCHED;
                break;
            case RM_HAS_WATCHED:
                delete watchList[imdbID];
                break;
            default:
                console.warn('Illegal action in handleClick!!', clicked.value);
                return;
        }

        writeWatchlistLocalStorage(watchList);
        this.forceUpdate();
    };

    render(){

        const watchList = getWatchlistLocalStorage();
        let watchStatus;
        if (watchList && watchList[this.props.imdbID]) {
            watchStatus = watchList[this.props.imdbID];
        }


        if (this.state.movie !== null){
            const {Title, Poster, Year, Rated, Genre, Director, Writer, Actors, imdbRating } = this.getData();

            const showMovie = (<div>
                {checkForNA(<TitleComp title={Title} />, Title)}

                {checkForNA(<PosterComp src={Poster} />, Poster)}

                {checkForNA(<YearComp year={Year} />, Year)}

                {checkForNA(<RatedComp rated={Rated} />, Rated)}

                {checkForNA(<GenreComp genre={Genre} />, Genre)}

                {checkForNA(<DirectorComp director={Director} />,Director)}

                {checkForEmptyArr(<WriterComp writer={Writer} />, Writer)}

                {checkForEmptyArr(<ActorsComp actors={Actors} />, Actors)}

                {checkForNA(<ImdbRatingComp imdbRating={imdbRating} />, imdbRating)}

            </div>);

            return(
                <div className='movie-details'>
                    {showMovie}

                    {watchStatus !== WANT_TO_WATCH && watchStatus !== HAS_WATCHED  &&
                    <button value={WANT_TO_WATCH} className='btn' onClick={this.handleClick}>Vil se </button>
                    }

                    {watchStatus === WANT_TO_WATCH  &&
                    <button value={RM_WANT_TO_WATCH} className='btn' onClick={this.handleClick}>Fjern fra 'Vil se' </button>
                    }


                    { watchStatus !== HAS_WATCHED &&
                    <button value={HAS_WATCHED} className='btn' onClick={this.handleClick}>Har sett </button>
                    }

                    { watchStatus === HAS_WATCHED &&
                    <button value={RM_HAS_WATCHED} className='btn' onClick={this.handleClick}> Fjern fra 'Har sett' </button>
                    }
                </div>
            )
        } else if (this.state.error) {
            return(
                <div className='movie-details'>
                    <ConnectionError
                        error={this.state.error}
                        linkComponent={
                            (<a href="/">Gå tilbake til forsiden</a>)
                        }
                    />
                </div>
            )
        }
        else {
            return (
                <div className='movie-details'>
                    <h1>Loading your movie...</h1>
                </div>
            );
        }



    }
}
