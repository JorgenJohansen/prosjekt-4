import React, { Component } from 'react';
let helpers = require('../../functions/helpers');
/**
 * Dette skal være en presentational component som bare viser fram innhold og en skillelinje
 * Bruker også en hjelpefunksjon fra helpers til å skille listeelementene vi tar inn med props
 */
export default class Writer extends Component {

    render(){
        let writer = helpers.stringifyArr(this.props.writer);
        return(
            <div className='movie-writer'>
                <h3>Writer(s): {writer}</h3>
                <hr />
            </div>
        )
    }
}
