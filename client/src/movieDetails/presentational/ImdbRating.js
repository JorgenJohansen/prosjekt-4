import React, { Component } from 'react';
/**
 * Dette skal være en presentational component som bare viser fram innhold og en skillelinje
 */
export default class ImdbRating extends Component {

    render(){
        return(
            <div className='movie-score'>
                <h3>IMDB-rangering: {this.props.imdbRating}</h3>
                <hr />
            </div>
        )
    }
}
