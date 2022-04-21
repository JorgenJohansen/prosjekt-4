import React, { Component } from 'react';
/**
 * Dette skal være en presentational component som bare viser fram innhold og en skillelinje
 */
export default class Year extends Component {
    
    render(){
        return(
            <div className='movie-year'>
                <h3>Year: {this.props.year}</h3>
                <hr />
            </div>
        )
    }
}
