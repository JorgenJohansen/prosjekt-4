import React, { Component } from 'react';
/**
 * Dette skal være en presentational component som bare viser fram innhold og en skillelinje
 */
export default class Director extends Component {

    render(){
        return(
            <div className='movie-director'>
                <h3>Director: {this.props.director}</h3>
                <hr />
            </div>
        )
    }
}
