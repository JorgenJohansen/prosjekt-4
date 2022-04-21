import React, { Component } from 'react';
/**
 * Dette skal være en presentational component som bare viser fram innhold og en skillelinje
 */
export default class Title extends Component {
    
    render(){
        return(
            <div className='movie-title'>
                <h1><u>Title: {this.props.title}</u></h1>
                <hr />
            </div>
        )
    }
}
