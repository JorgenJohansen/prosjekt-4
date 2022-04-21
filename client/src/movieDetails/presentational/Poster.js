import React, { Component } from 'react';
/**
 * Dette skal være en presentational component som bare viser fram innhold og en skillelinje
 */
export default class Poster extends Component {
    
    render(){
        return(
            <div className='movie-poster'>
                <img src={this.props.src} alt='poster' />
                <hr />
            </div>
        )
    }
}
