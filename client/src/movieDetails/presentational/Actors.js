import React, { Component } from 'react';
let helpers = require('../../functions/helpers');
/**
 * Dette skal være en presentational component som bare viser fram innhold og en skillelinje
 * Bruker også en hjelpefunksjon fra helpers til å skille listeelementene vi tar inn med props
 */
export default class Actors extends Component {

    render(){
        let actors = helpers.stringifyArr(this.props.actors);
        return(
            <div className='movie-actors'>
                <h3>Actors: {actors}</h3>
                <hr />
            </div>
        )
    }
}
