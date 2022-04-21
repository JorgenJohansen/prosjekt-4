const express = require('express');
const axios = require('axios');
const helpers = require('../functions.js');
const router = express.Router();
const mysql = require('mysql');
require('dotenv').config();

const isLoggingOn = true;

let envString = 'PRODUCTION';
if (process.env.NODE_ENV) {
    envString = process.env.NODE_ENV.toUpperCase();
}
/* The server will connect to different databases with different privileges depending on the enviroment it is run in.
 * See README.md for more info
 */
let connectionConfig = {
    host     : process.env['DB_HOST_' + envString],
    user     : process.env['DB_USER_' + envString],
    password : process.env['DB_PASSWORD_' + envString],
    database : process.env['DB_DATABASE_' + envString]
};

console.log('connectionConfig:', connectionConfig);

let connectionPool = mysql.createPool(connectionConfig);

/**
 * Gives an introduction to these sub-routes
 */
router.get("/", function (req, res) {
    res.status(200).send({
        message: 'Welcome to the Movies restful API',
        suggestion: 'You can try this query, for example: "search?title=Titanic&director=James Cameron&year=1997"',
        availableRoutes: [
            'GET /staticmovie',
            'GET /movies',
            'GET /movie/:imdbID',
            'GET /search',
            'POST /stealfromomdb'
        ]
    });
});


/**
 * Returns static example movie.
 * Should return the same as a query to /movie/tt3896198
 *
 * example query:
 * GET /staticmovie
 */
router.get('/staticmovie', function (req, res) {
    res.status(200).send([
        {
            "imdbID": "tt0120338",
            "Title": "Titanic",
            "Year": 1997,
            "Rated": "PG-13",
            "Released": "19 Dec 1997",
            "Runtime": "194 min",
            "Genre": [
                "Drama",
                "Romance"
            ],
            "Director": "James Cameron",
            "Writer": [
                "James Cameron"
            ],
            "Actors": [
                "Leonardo DiCaprio",
                "Kate Winslet",
                "Billy Zane",
                "Kathy Bates"
            ],
            "Plot": "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
            "Language": "English, Swedish",
            "Country": "USA",
            "Awards": "Won 11 Oscars. Another 111 wins & 77 nominations.",
            "Poster": "https://m.media-amazon.com/images/M/MV5BMDdmZGU3NDQtY2E5My00ZTliLWIzOTUtMTY4ZGI1YjdiNjk3XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_SX300.jpg",
            "Metascore": "75",
            "imdbRating": "7.8",
            "imdbVotes": "913,780",
            "DVD": "10 Sep 2012",
            "BoxOffice": "N/A",
            "Production": "Paramount Pictures",
            "Website": "http://www.titanicmovie.com/"
        }
    ])
});

/**
 * Retrieves all entries from movies.
 *
 * example query:
 * GET /movies
 */
router.get('/movies', function (req, res) {
    // TODO: Subject to change. Depends on issue #10
    let queryString = 'SELECT imdbID, Title, Year, Rated, Genre, Director, Actors, Language, imdbRating FROM movies';
    helpers.logActions(isLoggingOn, 'GET', queryString);
    // Performing query and handle errors
    helpers.mysqlQueryHelper(connectionPool, res, queryString);
});

/**
 * Retrieves the entry with the given imdbID from the database, if such entry exists.
 * Returns empty array if no satisfactory entry was found.
 *
 * example query:
 * GET /movie/tt0035665
 */
router.get('/movie/:imdbID', function (req, res) {
    const imdbID = req.params.imdbID;
    const minimized = req.query.minimized;

    if (helpers.isValidImdbID(imdbID)) {
        let queryString;
        if (minimized && minimized !=='false') {
            // Only need to send the basic fields, as only they are needed.
            queryString = 'SELECT imdbID, Title, Poster, Year, Director FROM movies WHERE imdbID=\'' + imdbID + '\'';
        } else {
            queryString = 'SELECT * FROM movies WHERE imdbID=\'' + imdbID + '\'';
        }

        helpers.logActions(isLoggingOn, 'GET', queryString);
        // Performing query and handle errors
        helpers.mysqlQueryHelper(connectionPool, res, queryString);
    } else {
        res.status(400).send({ message: 'Invalid imdbID supplied. Example imdbID: tt0035665' });
    }
});

/**
 * A search route that retrieves results from the database.
 * All parameters are optional, but it is required to have at least one parameter.
 *
 * example query:
 * GET /search?director=James Gunn&title=Guardians of The Galaxy
 */
router.get('/search', function (req, res) {
    const { year, title, director, expanded, sortOn, sortDir, startYear, endYear, limit, offset } = req.query;

    if (year || title || director){
        let queryString = 'SELECT imdbID, Title, Poster, Year, Director, imdbRating';
        if (expanded) {
            // TODO: Subject to change. Depends on issue #10
            queryString += ',  Rated, Genre, Actors, Language';
        }
        queryString += ' FROM movies WHERE ';
        // Adding SQL clauses for the different query parameters
        let clauses = [];
        if(year) clauses.push('Year=' + year);
        if(title) clauses.push('Title LIKE "%' + title + '%"');
        if(director) clauses.push('Director LIKE "%' + director + '%"');


        let yearError = null;

        const startYearNum = Number(startYear);
        const endYearNum = Number(endYear);

        if (startYear && endYear) {
            if (startYearNum <= endYearNum){
                clauses.push(`Year BETWEEN ${startYearNum} AND ${endYearNum}`);
            } else {
                yearError = 'End year cannot be smaller than start year!'
            }
        } else if (startYear) {
            clauses.push(`Year >= ${startYearNum}`);
        } else if (endYear) {
            clauses.push(`Year <= ${endYearNum}`);
        }

        // Concatenating the clauses together with the query string:
        queryString += helpers.concatClauses(clauses);



        // TODO: Determine if server should ignore illegal sorting values or return errors
        let sortError = null;
        if(sortOn) {
            const legalSortOn = ['Title', 'Director', 'Year', 'imdbRating'];
            if (legalSortOn.includes(sortOn)) {
                queryString += ' ORDER BY CASE ' + sortOn + ' WHEN "N/A" THEN 1 ELSE 0 END, ' + sortOn;
                if (sortDir === 'desc') queryString += ' DESC'
            } else {
                sortError = 'Available values: ' + legalSortOn.join(', ');
            }
        }

        // TODO: Determine if server should ignore illegal limit and offset values or return errors
        let limitError = false;
        if (limit) {
            if (Number.isInteger(Number(limit)) && (Number(limit) >= 0)) {
                queryString += ` LIMIT ${limit} `;
                if (offset) {
                    if (Number.isInteger(Number(offset)) && Number(offset) >= 0) {
                        queryString += ` OFFSET ${offset} `
                    } else {
                        limitError = true;
                    }
                }
            } else {
                limitError = true;
            }
        }




        helpers.logActions(isLoggingOn, 'GET', queryString);
        // Performing query and handle errors
        if (yearError) {
            res.status(400).send({
                message: 'Invalid startYear and endYear parameters.',
                details: yearError
            })
        }
        else if (sortError) {
            res.status(400).send({
                message: 'Invalid query, illegal sortOn parameter.',
                availableValues: sortError
            })
        } else if (limitError) {
            res.status(400).send({
                message: 'Invalid query, illegal limit and/or offset parameter.',
                details: 'Limits and offsets must be integers equal to or greater than 0'
            })
        } else {
            helpers.mysqlQueryHelper(connectionPool, res, queryString);
        }
    } else {
        res.status(400).send({
            message: 'Invalid query, need at least one of the specified parameters.',
            availableParameters: {
                title: 'optional',
                year: 'optional',
                director: 'optional'
            }
        })
    }
});


/**
 * Just a development route used to fill the database with some content borrowed from www.omdbapi.com.
 * This function is really not a part of the evaluation of Project 4, since it isn't directly related to the task.
 *
 * Sends queries with a search string and a page number to OMDb. Gets 10 results at each page (except the last),
 * and then does new queries on those movies (using imdbID) to get full info on that movie
 * and then insert it into the db.
 *
 * s: Search string
 * quantity: The max number of movie results from OMDb you want to add to the database.
 *
 * example query:
 * POST: /stealfromomdb?s=Guardians of the galaxy&quantity=2
 */
router.post('/stealfromomdb', function (req, res) {
    if (process.env.NODE_ENV && process.env.NODE_ENV.toUpperCase() !== 'DEVELOPMENT') {
        res.status(403).send({message: 'This route is only available under development.'}) // Sending 403 'Forbidden'
    } else {
        const searchString = req.query.s;
        const quantity = Number(req.query.quantity);

        if (searchString && Number.isInteger(quantity)) {
            const numberOfPages = Math.ceil(quantity / 10);
            const onLastPage = (quantity % 10) ? quantity % 10 : 10;

            let counter = 0;

            for (let p = 1; p <= numberOfPages; p++) {
                axios.get('https://www.omdbapi.com/?s=' + searchString + '&page=' + p + '&type=movie&apikey=6e3d1d9a').then(response => {
                    if (response.data.Response === "True") {
                        let results = response.data.Search;
                        if (p === numberOfPages) {
                            results = results.slice(0, onLastPage);
                        }
                        results.forEach(result => {
                            counter += 1;
                            helpers.stealTitleFromOMDB(connectionPool, result.imdbID, isLoggingOn);
                        });
                    }
                }).catch(error => {
                    helpers.logActions(isLoggingOn, 'ERROR', 'Issue with the API call to OMDb:', error);
                    //console.error('Issue with the API call to OMDb:', error);
                    res.status(500).send({message: 'Error when executing query.'});
                });
            }

            res.status(200).send({message: 'Tried to steal from OMDb'})
        } else {
            res.status(400).send({
                message: 'Invalid query, need all specified parameters.',
                requiredParameters: {
                    s: 'string',
                    quantity: 'integer'
                }
            })
        }
    }
});


module.exports = router;
