import React, { Component } from 'react';
let helpers = require('../../functions/helpers');
/**
 * Dette skal være en presentational component som bare viser fram innhold og en skillelinje
 * Bruker også en hjelpefunksjon fra helpers til å skille listeelementene vi tar inn med props
 */
export default class Genre extends Component {

    render(){
        let genre = helpers.stringifyArr(this.props.genre);
        return(
            <div className='movie-genre'>
                <h3>Genre: {genre}</h3>
                <hr />
            </div>
        )
    }
}
