import React, { Component } from 'react';

class About extends Component {
    render() {
        return (
            <div className="about">
                <h1>Prosjekt 4 - Gruppe 47</h1>
                <h2>IT2810 ved NTNU Høsten 2018</h2>

                <p>From gruppe 47 with love</p>

                <a href="https://gitlab.stud.idi.ntnu.no/it2810-h18/prosjekt3/gruppe47/blob/develop/README.md"
                   target="_blank"
                   rel="noopener noreferrer"
                >
                    <h3>Mer info på GitLab</h3>
                </a>

            </div>
        );
    }
}

export default About;
