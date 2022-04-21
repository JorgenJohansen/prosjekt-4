let axios = require('axios');


/**
 * Takes in a comma separated list and returns an array of that list. Returns empty array if the value is 'N/A'
 * @param commaSepList <String>
 * @return {*} <Array>
 */
function toArray(commaSepList){
    if (commaSepList !== 'N/A'){
        return commaSepList.split(', ');
    }
    return []
}

/**
 * A helper that sends error responses if there is an error. If there is no error, it calls the callback function.
 * @param res <Object> Express query Response object
 * @param err <Object> The MySQL error object
 * @param callback <Function> To be called if there is no error.
 */
const errorHandler = (res, err, callback) => {
    if (err) {
        if (err.code === 'ECONNREFUSED'){
            console.error('Could not connect to MySQL server:', err);
            res.status(500).send({ message: 'API server could not connect to MySQL Server.'});
        } else {
            console.error('Error when executing query:', err);
            res.status(500).send({ message: 'Error when executing query. Please try again later'});
        }
    } else {
        callback()
    }
};

/**
 * A helper to perform queries, handle errors and send a response upon success.
 * @param connectionPool <Object> MySQL ConnectionPool object
 * @param res <Object> Express query Response object
 * @param queryString <String> The string to perform the SQL query
 */
const mysqlQueryHelper = (connectionPool, res, queryString) => {
    connectionPool.query(queryString, function (err, rows) {
        errorHandler(res, err, () => {
            res.status(200).send(conditionRows(rows));
        });
    });
};


/**
 * Simple console logger.
 * @param isLoggingOn <boolean> Will only log non-error messages if this is true
 * @param type <String>
 * @param mainMessage <String> The main body to log
 * @param optionalMessage <String> If something more should be logged on separate line at the end.
 */
const logActions = (isLoggingOn, type, mainMessage, optionalMessage) => {
    let messageText = '';
    messageText += type + ': ';
    messageText += mainMessage;
    messageText += optionalMessage ? '\n' + optionalMessage: '';

    if (type === 'ERROR'){
        console.error(messageText)
    } else if (isLoggingOn){
        console.log(messageText);
    }
};


/**
 * Helper function to "steal" a title from OMDb and insert them into our database
 * @param mysqlConn <object> The mySQL connection object that should be used
 * @param imDBTitle <String> The imdbID that should be "stolen"
 * @param isLoggingOn <boolean> If this should be logged or not
 */
const stealTitleFromOMDB = async (mysqlConn, imDBTitle, isLoggingOn) => {
    await axios.get('https://www.omdbapi.com/?i=' + imDBTitle + '&apikey=6e3d1d9a').then(response => {
        logActions(isLoggingOn, 'SQL', 'INSERT ' + imDBTitle);

        let values = [[response.data.imdbID, response.data.Title, response.data.Year, response.data.Rated, response.data.Released, response.data.Runtime, response.data.Genre, response.data.Director, response.data.Writer, response.data.Actors, response.data.Plot, response.data.Language, response.data.Country, response.data.Awards, response.data.Poster, response.data.ImdbScore, response.data.imdbRating, response.data.imdbVotes, response.data.DVD, response.data.BoxOffice, response.data.Production, response.data.Website]];

        let queryString = 'INSERT INTO movies (imdbID, Title, Year, Rated, Released, Runtime, Genre, Director, Writer, Actors, Plot, Language, Country, Awards, Poster, ImdbScore, imdbRating, imdbVotes, DVD, BoxOffice, Production, Website) VALUES ?';
        mysqlConn.query(queryString, [values], function (err) {
            if (err) {
                // No need to throw error if the error is caused by a duplicate entry (title already exists in db)
                // or insufficient privileges
                if (err.code === 'ER_DUP_ENTRY'){
                    console.warn('Item already exists:', err.sqlMessage);
                } else if (err.code === 'ER_TABLEACCESS_DENIED_ERROR'){
                    console.error('Error! Insufficient privileges:', err.sqlMessage);
                } else {
                    throw err;
                }
            }
        });
    }).catch(error => {
        console.error('Error retrieving data from OMDb:', error);
    })
};


/**
 * Takes in a number of rows and converts the comma separated lists to arrays with toArray
 * @param rows <Array> The rows that should be "conditioned"
 * @return {*} <Array> The "conditioned" rows
 */
const conditionRows = rows => {
    rows.forEach(row => {
        if (row.Genre){row.Genre = toArray(row.Genre);}
        if (row.Writer){row.Writer = toArray(row.Writer);}
        if (row.Actors){row.Actors = toArray(row.Actors);}
    });

    return rows;
};

/**
 * Takes array of SQL clauses and concatenates
 * @param clauses <Array>   Array of SQL clauses
 * @return {string} concatenated_clauses
 */
const concatClauses = clauses => {
    let concatenated_clauses = '';
    for (let i = 0; i < clauses.length; i++){
        if (i > 0) {
            // If this is not the first clause, we need to add ' AND ' in our query string to separate them
            concatenated_clauses  += ' AND '
        }
        // Adding the clause to the query string
        concatenated_clauses  += clauses[i];
    }
    return concatenated_clauses;
};

/**
 * Validates the format of a string, returns if it conforms with the rules or not.
 * @param imdbID <String> The string to be validated
 * @return {*|boolean}
 */
const isValidImdbID = imdbID => {
    return (imdbID && imdbID.length === 9 && imdbID.slice(0,2) === 'tt' && Number.isInteger(Number(imdbID.slice(2))));
};


module.exports = {
    mysqlQueryHelper,
    logActions,
    stealTitleFromOMDB,
    concatClauses,
    isValidImdbID,
    conditionRows
};
