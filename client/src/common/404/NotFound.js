/**
 * Dette skal være en presentational component som blir vist når en url som ikke finnes er skrevet til adresselinjen.
 * Den viser en feilmelding og en link tilbake til forsiden, samt et bilde av en gammel datamaskin.
 */

import React, { Component } from 'react';
import { Link } from "react-router-dom";
import './NotFound.css';

class NotFound extends Component {
    render() {
        return (
            <div className="not-found">
                <h1>404: Siden du leter etter finnes ikke</h1>

                <Link to='/' >Gå tilbake til forsiden</Link>
                <img src='old_computer.jpg' alt="Gammel datamaskin"/>
            </div>
        );
    }
}

export default NotFound;
