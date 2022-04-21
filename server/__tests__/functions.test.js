let functions = require('../functions.js');


describe('isValidImdbID', () => {

    it('should accept a valid ID', () => {
        expect(functions.isValidImdbID('tt0035665')).toBeTruthy();
        expect(functions.isValidImdbID('tt8765432')).toBeTruthy();
    });

    it('should reject too long IDs', () => {
        expect(functions.isValidImdbID('tt00356655')).toBeFalsy();
        expect(functions.isValidImdbID('ttt0035665')).toBeFalsy();
    });

    it('should reject IDs that does not match the pattern', () => {
        expect(functions.isValidImdbID('ttt035665')).toBeFalsy();
        expect(functions.isValidImdbID('tt003a665')).toBeFalsy();
        expect(functions.isValidImdbID('tt003e665')).toBeFalsy();
        expect(functions.isValidImdbID('atdsd0/n5')).toBeFalsy();
    })
});


/* Testing mysqlQueryHelper and therefore its helper function errorHandler
 * Purposefully avoiding to test much of conditionRows by sending empty array as `rows`
 */
describe('mysqlQueryHelper', () => {

    /*
     * Defining some mockers to be used for the tests
     */


    const sendMock = (expectedData) =>  {
        return {
            send: data => {
                expect(data).toEqual(expectedData)
            }
        }
    };

    const mocker = (errorState, expectedStatusCode, expectedData) => {
        return {
            connectionPool: {
                query: (queryString, callback) => {
                    const err = errorState;
                    const rows = [];
                    callback(err, rows);
                }
            },
            /*
             * Mocking `res`, which is used like this in mysqlQueryHelper:
             *
             * `res.status(200).send(conditionRows(rows))`
             * `res.status(500).send(conditionRows(rows))`
             *
             * Explanation:
             * `res.status(200).send(conditionRows(rows))`
             * res.status returns a object with a function called `send`
             *
             * So we end up with something like this:
             * ({
             *      send: data => {
			 *  	    expect(data).toEqual({ message: 'API server could not connect to MySQL Server.' })
			 * 	        }
             * }).send({ message: 'API server could not connect to MySQL Server.' })
             *
             * The send function is run, and we assert if the data is equal to the expected value
             */
            res: {
                status: statusCode => {
                    expect(statusCode).toEqual(expectedStatusCode);
                    return sendMock(expectedData)
                }
            },
        }
    };

    /* Instantiates a mocker, and runs mysqlQueryHelper with that mocker and no queryString
     * Testing with different queryStrings wouldn't make much sense here, as that would only end up testing our mocker.
     */
    const tester = (errorState, expectedStatusCode, expectedData) => {
        const testMocker = mocker(errorState, expectedStatusCode, expectedData);
        functions.mysqlQueryHelper(testMocker.connectionPool, testMocker.res);
    };

    it('should return rows if no error', () => {
        tester(false, 200, []);
    });

    it('should return general error', () => {
        tester(true, 500, { message: 'Error when executing query. Please try again later' });
    });


    it('should return connection refused error', () => {
        // Sending a specific error code
        tester({ code: 'ECONNREFUSED' }, 500, { message: 'API server could not connect to MySQL Server.' });
    });
});

describe('concatClauses', () => {

    function concatHelper(year, title, director){
        let clauses = [];
        if(year) clauses.push('Year=' + year);
        if(title) clauses.push('Title LIKE \'%' + title + '%\'');
        if(director) clauses.push('Director LIKE \'%' + director + '%\'');
        return clauses
    }

    it('should return one clause', () => {
        let clauses = concatHelper('1997', null, null);
        let clauseString = functions.concatClauses(clauses);
        expect(clauseString).toEqual('Year=1997');


        clauses = concatHelper(null, 'Titanic', null);
        clauseString = functions.concatClauses(clauses);
        expect(clauseString).toEqual("Title LIKE '%Titanic%'");

        clauses = concatHelper(null, null, 'Tarantino');
        clauseString = functions.concatClauses(clauses);
        expect(clauseString).toEqual("Director LIKE '%Tarantino%'")
    });


    it('should return two clauses', () => {
        let clauses = concatHelper('1997', 'Titanic', null);
        let clauseString = functions.concatClauses(clauses);
        expect(clauseString).toEqual("Year=1997 AND Title LIKE '%Titanic%'");



        clauses = concatHelper('1997', null, 'Tarantino');
        clauseString = functions.concatClauses(clauses);
        expect(clauseString).toEqual("Year=1997 AND Director LIKE '%Tarantino%'");


        clauses = concatHelper(null, 'Titanic', 'Tarantino');
        clauseString = functions.concatClauses(clauses);
        expect(clauseString).toEqual("Title LIKE '%Titanic%' AND Director LIKE '%Tarantino%'");
    });

    it('should return three clauses', () => {
        let clauses = concatHelper('1997', 'Titanic', 'Tarantino');
        let clauseString = functions.concatClauses(clauses);
        expect(clauseString).toEqual("Year=1997 AND Title LIKE '%Titanic%' AND Director LIKE '%Tarantino%'");
    });

});


describe('conditionRows', () => {
    const dataParsed = [
        {
            imdbID: "tt0120338",
            Title: "Titanic",
            Year: 1997,
            Rated: "PG-13",
            Released: "19 Dec 1997",
            Runtime: "194 min",
            Genre: [
                "Drama",
                "Romance"
            ],
            Director: "James Cameron",
            Writer: [
                "James Cameron"
            ],
            Actors: [
                "Leonardo DiCaprio",
                "Kate Winslet",
                "Billy Zane",
                "Kathy Bates"
            ],
            Plot: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
            Language: "English, Swedish",
            Country: "USA",
            Awards: "Won 11 Oscars. Another 111 wins & 77 nominations.",
            Poster: "https://m.media-amazon.com/images/M/MV5BMDdmZGU3NDQtY2E5My00ZTliLWIzOTUtMTY4ZGI1YjdiNjk3XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_SX300.jpg",
            Metascore: "75",
            imdbRating: "7.8",
            imdbVotes: "913,780",
            DVD: "10 Sep 2012",
            BoxOffice: "N/A",
            Production: "Paramount Pictures",
            Website: "http://www.titanicmovie.com/"
        },
        {
            imdbID: "tt0035665",
            Title: "Batman",
            Year: 1943,
            Rated: "APPROVED",
            Released: "16 Jul 1943",
            Runtime: "260 min",
            Genre: [
                "Action",
                "Adventure",
                "Crime",
                "Sci-Fi",
                "Thriller",
                "War"
            ],
            Director: "Lambert Hillyer",
            Writer: [
                "Bob Kane (comic books created by)",
                "Victor McLeod (screenplay by)",
                "Leslie Swabacker (screenplay by)",
                "Harry L. Fraser (screenplay by)"
            ],
            Actors: [
                "Lewis Wilson",
                "Douglas Croft",
                "J. Carrol Naish",
                "Shirley Patterson"
            ],
            Plot: "Japanese spymaster Prince Daka operates a covert espionage organization located in Gotham City's now-deserted Little Tokyo which turns American scientists into pliable zombies.",
            Language: "English",
            Countr: "USA",
            Awards: "N/A",
            Poster: "https://m.media-amazon.com/images/M/MV5BNTIzMDI1MTk3Nl5BMl5BanBnXkFtZTgwODE4NzM1MjE@._V1_SX300.jpg",
            Metascore: "N/A",
            imdbRating: "6.5",
            imdbVotes: "1,587",
            DVD: "18 Oct 2005",
            BoxOffice: "N/A",
            Production: "N/A",
            Website: "N/A"
        }
    ];

    const dataUnparsed = [
        {
            imdbID: "tt0120338",
            Title: "Titanic",
            Year: 1997,
            Rated: "PG-13",
            Released: "19 Dec 1997",
            Runtime: "194 min",
            Genre: "Drama, Romance",
            Director: "James Cameron",
            Writer: "James Cameron",
            Actors: "Leonardo DiCaprio, Kate Winslet, Billy Zane, Kathy Bates",
            Plot: "A seventeen-year-old aristocrat falls in love with a kind but poor artist aboard the luxurious, ill-fated R.M.S. Titanic.",
            Language: "English, Swedish",
            Country: "USA",
            Awards: "Won 11 Oscars. Another 111 wins & 77 nominations.",
            Poster: "https://m.media-amazon.com/images/M/MV5BMDdmZGU3NDQtY2E5My00ZTliLWIzOTUtMTY4ZGI1YjdiNjk3XkEyXkFqcGdeQXVyNTA4NzY1MzY@._V1_SX300.jpg",
            Metascore: "75",
            imdbRating: "7.8",
            imdbVotes: "913,780",
            DVD: "10 Sep 2012",
            BoxOffice: "N/A",
            Production: "Paramount Pictures",
            Website: "http://www.titanicmovie.com/"
        },
        {
            imdbID: "tt0035665",
            Title: "Batman",
            Year: 1943,
            Rated: "APPROVED",
            Released: "16 Jul 1943",
            Runtime: "260 min",
            Genre: "Action, Adventure, Crime, Sci-Fi, Thriller, War",
            Director: "Lambert Hillyer",
            Writer: "Bob Kane (comic books created by), Victor McLeod (screenplay by), Leslie Swabacker (screenplay by), Harry L. Fraser (screenplay by)",
            Actors: "Lewis Wilson, Douglas Croft, J. Carrol Naish, Shirley Patterson",
            Plot: "Japanese spymaster Prince Daka operates a covert espionage organization located in Gotham City's now-deserted Little Tokyo which turns American scientists into pliable zombies.",
            Language: "English",
            Countr: "USA",
            Awards: "N/A",
            Poster: "https://m.media-amazon.com/images/M/MV5BNTIzMDI1MTk3Nl5BMl5BanBnXkFtZTgwODE4NzM1MjE@._V1_SX300.jpg",
            Metascore: "N/A",
            imdbRating: "6.5",
            imdbVotes: "1,587",
            DVD: "18 Oct 2005",
            BoxOffice: "N/A",
            Production: "N/A",
            Website: "N/A"
        }

    ];

    it('should return parsed input', () => {
        const dataUnparsedCopy = JSON.parse(JSON.stringify(dataUnparsed));
        const returned = functions.conditionRows(dataUnparsedCopy);

        expect(returned).toEqual(dataParsed);
    });

    it('should parse \'N/A\' values', () => {
        // Making deep copies of the test data, then making changes to them to fit the new test
        const dataUnparsedCopy = JSON.parse(JSON.stringify(dataUnparsed));
        dataUnparsedCopy[0].Genre = "N/A";
        dataUnparsedCopy[1].Writer = "N/A";
        const dataParsedCopy = JSON.parse(JSON.stringify(dataParsed));
        dataParsedCopy[0].Genre = [];
        dataParsedCopy[1].Writer = [];

        const returned = functions.conditionRows(dataUnparsedCopy);
        expect(returned).toEqual(dataParsedCopy);
    });

    it('should handle non-existing values', () => {
        // Making deep copies of the test data, then making changes to them to fit the new test
        const dataUnparsedCopy = JSON.parse(JSON.stringify(dataUnparsed));
        delete dataUnparsedCopy[0].Genre;
        dataUnparsedCopy[0].Writer = null;
        delete dataUnparsedCopy[1].Writer;
        dataUnparsedCopy[1].Actors = null;
        const dataParsedCopy = JSON.parse(JSON.stringify(dataParsed));
        delete dataParsedCopy[0].Genre;
        dataParsedCopy[0].Writer = null;
        delete dataParsedCopy[1].Writer;
        dataParsedCopy[1].Actors = null;

        const returned = functions.conditionRows(dataUnparsedCopy);
        expect(returned).toEqual(dataParsedCopy);
    });
});

