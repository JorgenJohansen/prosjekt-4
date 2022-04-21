import React, { Component } from 'react';
import {Link} from "react-router-dom";
import MovieListContainer from "./common/movieList/MovieListContainer";

class Home extends Component {
    favourites = [
        {
            imdbID: 'tt0035665',
        },
        {
            imdbID: 'tt0120338',
        },
        {
            imdbID: 'tt0372784',
        },
        ];

    render() {
        return (
            <div className="home">
                <h1>Velkommen til denne søkesiden for filmer</h1>

                <p>Hvis du vil sjekke ut en spesiell film kan du <Link to='/search/'>søke her</Link>.</p>
                <p>Du kan også legge til filmer du har sett og filmer du ønsker å se i <Link to='/watchlist/'>Watchlist</Link>.</p>
                <p>Her er noen av våre favoritter du kan se nærmere på:</p>
                <MovieListContainer movies={this.favourites}/>
            </div>
        );
    }
}

export default Home;
