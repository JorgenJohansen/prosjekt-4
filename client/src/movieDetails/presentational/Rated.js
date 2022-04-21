import React, { Component } from 'react';
/**
 * Dette skal være en presentational component som bare viser fram innhold og en skillelinje
 */
export default class Rated extends Component {

    render(){
        return(
            <div className='movie-rated'>
                <h3>Rated: {this.props.rated}</h3>
                <hr />
            </div>
        )
    }
}
