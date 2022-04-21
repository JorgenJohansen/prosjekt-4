import { SEARCH_PAGE_OFFSET, MIN_SEARCH_YEAR, MAX_SEARCH_YEAR } from '../../client/src/constants';


// FIXME: REFACTOR: Chained .gets does not work except when using .within()


describe('Basic testing', () => {
    it('should render search front page correctly', () => {
        cy.visit('http://localhost:3000/search');
        cy.get('.searchPageComponent').contains('Søk på noe kult i søkeboksen da vel!');
        cy.get('.searchFieldComponent').contains('Avansert søk');
    });

    it('should render with simple search', () => {
        cy.visit('http://localhost:3000/search?title=Titanic');
        cy.get('.movie-list-item').contains('Titanic');
        cy.get('.movie-list-item').contains('1997');
        cy.get('.movie-list-item').contains('James Cameron');
        cy.get('.movie-list-item').contains('Imdb-rangering');
        cy.get('.movie-list-item').contains('7.8');
        cy.get('.movie-list-item').contains('Imdb-rangering: 7.8');

        // There should only be one result
        cy.get('.searchPageComponent').find('.movie-list-item').should('have.length', 1);

        cy.url().should('equal', 'http://localhost:3000/search?title=Titanic');
    });

    it('should render an advanced search', () => {
        cy.visit('http://localhost:3000/search?title=Titanic&director=James%20Cameron&startYear=1990&endYear=2000');


        cy.get('.movie-list-item').contains('Titanic');
        cy.get('.movie-list-item').contains('1997');
        cy.get('.movie-list-item').contains('James Cameron');

        // There should only be one result
        cy.get('.searchPageComponent').find('.movie-list-item').should('have.length', 1);


        cy.get('.searchFieldComponent').contains('Fra 1990 til 2000');


        cy.get('.searchFieldComponent').get('input').then(inputs => {
            expect(inputs[0].defaultValue).equals('titanic');
            expect(inputs[1].defaultValue).equals('james cameron');
        });

        cy.get('Vis flere resultater').should('not.exist');
    });

    it('should display correct selected years', () => {
        cy.visit('http://localhost:3000/search?title=Titanic&director=James%20Cameron&startYear=1990&endYear=2000');
        cy.get('.searchFieldComponent').contains('Fra 1990 til 2000');

        cy.visit('http://localhost:3000/search?title=Titanic&director=James%20Cameron&endYear=2000');
        cy.get('.searchFieldComponent').contains('Før 2000');

        cy.visit('http://localhost:3000/search?title=Titanic&director=James%20Cameron&startYear=1990');
        cy.get('.searchFieldComponent').contains('Etter 1990');

        cy.visit('http://localhost:3000/search?title=Titanic&startYear=' + MIN_SEARCH_YEAR + '&endYear=1990');
        cy.get('.searchFieldComponent').contains('Før 1990');

        cy.visit('http://localhost:3000/search?title=Titanic&startYear=1990&endYear=' + MAX_SEARCH_YEAR);
        cy.get('.searchFieldComponent').contains('Etter 1990');


    });


    it('should render with simple search', () => {
        cy.visit('http://localhost:3000/search?title=batman');
        // There should only be one result
        cy.get('.searchPageComponent').find('.movie-list-item').should('have.length', SEARCH_PAGE_OFFSET);
    });

    it('should render empty results', () => {
        cy.visit('http://localhost:3000/search?title=batman&startYear=1900&endYear=1900');
        // There should only be one result
        cy.contains('Det finnes ingen filmer som tilfredsstiller søket ditt.');
        cy.contains('Tilbake til søkeforsiden');
    });

});

describe('testing errors', () => {
    // TODO: Test invalid parameters in url
    it('should get invalid parameters error', () => {
        cy.visit('http://localhost:3000/search?title=Titanic&director=James%20Cameron&startYear=2000&endYear=1990');
        cy.contains('Request failed with status code 400');
        cy.contains('Error 400: Bad Request');
        cy.contains('Invalid startYear and endYear parameters.');
        cy.contains('End year cannot be smaller than start year!');

    });



    it('should show loading message', () => {
        cy.server();
        cy.visit('http://localhost:3000/search?title=Titanic&director=James%20Cameron&startYear=2000&endYear=1990');

        cy.route({
            method: 'GET',
            url: '**/ap/search*',
            status: null,
            response: ''
        });

        cy.contains('Laster resultater ...');
        /*

        cy.server();           // enable response stubbing
        cy.route({
            method: 'GET',      // Route all GET requests
            url: '/users/*',    // that have a URL that matches '/users/*'
            response: []        // and force the response to be: []
        })

        */
    });

    // TODO: Find out if we can block access to the server (simulate network connecetion refused)
    it('should render error mesasage when server unavailable', () => {
        // Wasn't able to simulate general network error, so have to resort to 404

        cy.server({ force404: true });
        cy.visit('http://localhost:3000/search?title=Titanic&director=James%20Cameron&startYear=2000&endYear=1990');

        cy.contains('Det skjedde noe feil ..');
        cy.contains('Gå tilbake til søkeforsiden');
        /*
         * Would want to check for "Network Error", which appears when the server is not available to the client,
         * but cannot unless I can mock that network error.
         */
    });

    // TODO: Emulate error were the API server can't connect to the MySQL server, check error messages
    // Seems like we didn't have enough time to do that
    it('should render error message when API server cannot connect to MySQL server', () => {
        /*
         * Response from server to mock:
         * res.status(500).send({ message: 'API server could not connect to MySQL Server.'});
         */

        cy.server();           // enable response stubbing
        cy.route({
            method: 'GET',      // Route all GET requests
            url: '/api/*',    // that have a URL that matches /api/
            status: 500,
            response:
                { message: 'API server could not connect to MySQL Server.'}
        });

        cy.visit('http://localhost:3000/search?title=Titanic');

        cy.contains('Det skjedde noe feil ..');
        cy.contains('Error 500: Internal Server Error');
        cy.contains('API server could not connect to MySQL Server.');
        cy.contains('Gå tilbake til søkeforsiden');
    });

    it('should render error message on general server error', () => {
        /*
         * Response from server to mock:
         * res.status(500).send({ message: 'Error when executing query. Please try again later' });
         */

        cy.server();           // enable response stubbing
        cy.route({
            method: 'GET',      // Route all GET requests
            url: '/api/*',    // that have a URL that matches /api/
            status: 500,
            response:
                { message: 'Error when executing query. Please try again later'}
        });

        cy.visit('http://localhost:3000/search?title=Titanic');

        cy.contains('Det skjedde noe feil ..');
        cy.contains('Error 500: Internal Server Error');
        cy.contains('Error when executing query. Please try again later');
        cy.contains('Gå tilbake til søkeforsiden');
    });
});

describe('interaction testing', () => {
    it('should be able to perform search', () => {
        cy.visit('http://localhost:3000/search');

        cy.get('input').type('Hello, World');
        cy.get('button').contains('Søk').click();


        cy.url().should('eq', 'http://localhost:3000/search?title=Hello,%20World');
        cy.get('input').should('have.value', 'hello, world');
        cy.contains('Det finnes ingen filmer som tilfredsstiller søket ditt.');
        cy.contains('Tilbake til søkeforsiden');

    });

    it('should search for Titanic', () => {
        cy.visit('http://localhost:3000/search');

        cy.get('input').type('Titanic');
        cy.get('button').contains('Søk').click();


        cy.url().should('eq', 'http://localhost:3000/search?title=Titanic');
        cy.get('input').should('have.value', 'titanic');

        cy.get('.searchPageComponent').find('.movie-list-item').should('have.length', 1);
        cy.get('.searchPageComponent').get('.movie-list-container').get('.movie-list-item').contains('Titanic');
        cy.get('.searchPageComponent').get('.movie-list-container').get('.movie-list-item').contains('1997');
        cy.get('.searchPageComponent').get('.movie-list-container').get('.movie-list-item').contains('James Cameron');


    });

});

describe('search', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/search');

        cy.get('input').type('Hello, World');
        cy.get('button').contains('Søk').click();


        cy.url().should('eq', 'http://localhost:3000/search?title=Hello,%20World');
        cy.get('input').should('have.value', 'hello, world');
    });

    it('should open advanced search', () => {
        cy.get('.searchFieldComponent').contains('Regissør:').should('not.exist');
        cy.get('.searchPageComponent').find('input').should('have.length', 1);
        cy.get('button').contains('Avansert søk').click();

        cy.get('.searchFieldComponent').contains('Regissør:');
        cy.get('.searchFieldComponent').contains('Avgrens år:');

        // There should now be two inputs (title input and director input)
        cy.get('.searchPageComponent').find('input').should('have.length', 2);
    });

});

describe('advanced search', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/search');
        cy.get('button').contains('Avansert søk').click();

        cy.get('.searchFieldComponent').contains('Regissør:');
        cy.get('.searchFieldComponent').contains('Avgrens år:');

        // There should now be two inputs (title input and director input)
        cy.get('.searchPageComponent').find('input').should('have.length', 2);
    });


    it('should clear advanced search fields when advancedSearch is closed', () => {
        cy.get('.searchFieldComponent').contains('Regissør:').get('input');
        cy.get('.searchFieldComponent').contains('Regissør:').within(() => {
            cy.get('input');
            cy.get('input').type('Tarantino');
            cy.get('input').should('have.value', 'Tarantino');
        });


        cy.get('.rc-slider-step').click({ position: 'center' });

        cy.get('.searchFieldComponent').contains('Etter 1989');




        // Closing advanced search, should clear advanced search params
        cy.get('button').contains('Enkelt søk').click();
        cy.get('button').contains('Avansert søk').click(); // Opening advanced search again

        cy.get('.searchFieldComponent').contains('Regissør:').within(() => {
            cy.get('input');
            cy.get('input').should('have.value', '');
        });

        cy.get('.searchFieldComponent').contains('Etter 1989').should('not.exist');
    });


    it('should perform simple search when advanced search is open, but no advanced values are set', () => {

        cy.get('.searchFieldComponent').contains('Tittel:').within(() => {
            cy.get('input').type('Titanic');
            cy.get('input').should('have.value', 'Titanic');
        });
        // cy.get('button').contains('Søk').click();

        cy.get('button[type=submit]').click();

        cy.url().should('equal', 'http://localhost:3000/search?title=Titanic');

    });

    it('should click on slider', () => {
        cy.get('.rc-slider-step').click({ position: 'center' });
        cy.get('.searchFieldComponent').contains('Etter 1989');

        cy.get('.rc-slider-step').click({ position: 'left' });
        cy.get('.searchFieldComponent').contains('Etter 1989').should('not.exist');
        // Since we now are at MIN_SEARCH_YEAR
    });


    it('should perform advanced search', () =>{
        cy.get('.searchFieldComponent').contains('Regissør:').within(() => {
            cy.get('input').type('Tarantino');
            cy.get('input').should('have.value', 'Tarantino');
        });

        cy.get('.searchFieldComponent').contains('Tittel:').within(() => {
            cy.get('input').type('Titanic');
            cy.get('input').should('have.value', 'Titanic');
        });



        cy.get('.rc-slider-step').click({ position: 'center' });

        /*
         * Only available position values: topLeft, top, topRight, left, center, right, bottomLeft, bottom, bottomRight.
         * Therefore, I'm not able programmatically click to select two values here.
         */

        cy.get('button[type=submit]').click();

        cy.url().should('equal', 'http://localhost:3000/search?title=Titanic&director=Tarantino&startYear=1989');
    });

});


describe('loading results', () => {
    beforeEach(() => {
        cy.visit('http://localhost:3000/search');
        cy.reload(true);

        cy.get('input').type('a');
        cy.get('button').contains('Søk').click();


        cy.url().should('eq', 'http://localhost:3000/search?title=a');
        cy.get('input').should('have.value', 'a');
    });

    it('should load SEARCH_PAGE_OFFSET number of results', () => {
        cy.get('.searchPageComponent').find('.movie-list-item').should('have.length', SEARCH_PAGE_OFFSET);
    });

    it('should display "Vis flere resultater" button', () => {
        cy.get('.searchPageComponent').contains('Vis flere resultater');
    });

    it('should load more results', () => {
        cy.get('.searchPageComponent').contains('Vis flere resultater').click();

        cy.get('.searchPageComponent').find('.movie-list-item').should('have.length', SEARCH_PAGE_OFFSET * 2);
    });

    it('should load all results', () => {
        // const totalResults = 518;
        const totalResults = 518;

        let pageNum = 0;

        while ((totalResults - pageNum * SEARCH_PAGE_OFFSET) >= SEARCH_PAGE_OFFSET) {
            cy.get('.searchPageComponent').contains('Vis flere resultater').click();
            pageNum++;
        }

        cy.get('.searchPageComponent').find('.movie-list-item').should('have.length', 518);
        cy.get('.searchPageComponent').get('Vis flere resultater').should('not.exist');
    })
});

describe('sorting', () => {

    beforeEach(() => {
        cy.visit('http://localhost:3000/search');

        cy.get('input').type('a');
        cy.get('button').contains('Søk').click();


        cy.url().should('eq', 'http://localhost:3000/search?title=a');
        cy.get('input').should('have.value', 'a');
    });

    it('should sort on all parameters', () => {
        // Natural sorting
        cy.get('.searchPageComponent').find('.movie-list-item').eq(0).within(() => {
            cy.contains('The Avengers');
            cy.contains('1942');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(1).within(() => {
            cy.contains('Batman');
            cy.contains('1943');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(3).within(() => {
            cy.contains('Batman Dracula');
            cy.contains('1964');
            cy.contains('Andy Warhol');
        });


        cy.get('select').select('Year_asc');
        cy.get('.searchPageComponent').find('.movie-list-item').eq(0).within(() => {
            cy.contains('The Diligent Batman');
            cy.contains('1908');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(1).within(() => {
            cy.contains('The Avengers');
            cy.contains('1942');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(2).within(() => {
            cy.contains('Batman');
            cy.contains('1943');
        });
        cy.get('.searchPageComponent').contains('Vis flere resultater').click(); // Loading more results
        cy.get('.searchPageComponent').find('.movie-list-item').eq(50).within(() => {
            cy.contains('Spider-Man: Sins of the Fathers');
            cy.contains('1996');
            cy.contains('Bob Richardson');
        });


        cy.get('select').select('Year_desc');
        cy.get('.searchPageComponent').find('.movie-list-item').eq(0).within(() => {
            cy.contains('Transformers 7');
            cy.contains('2019');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(1).within(() => {
            cy.contains('Spider-Man: Far From Home');
            cy.contains('2019');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(2).within(() => {
            cy.contains('Batman: Hush');
            cy.contains('2019');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(3).within(() => {
            cy.contains('Avengers: Infinity War');
            cy.contains('2018');
        });


        cy.get('select').select('imdbRating_asc');
        cy.get('.searchPageComponent').find('.movie-list-item').eq(0).within(() => {
            cy.contains('The Death of Batman');
            cy.contains('2.2');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(1).within(() => {
            cy.contains('Avengers Grimm: Time Wars');
            cy.contains('2.2');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(2).within(() => {
            cy.contains('Avengers of Justice: Farce Wars');
            cy.contains('2.5');
        });

        cy.get('select').select('imdbRating_desc');
        cy.get('.searchPageComponent').find('.movie-list-item').eq(0).within(() => {
            cy.contains('A Friend Called Spider-Man');
            cy.contains('9.3');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(1).within(() => {
            cy.contains('Batman Beyond Forgotten Memories');
            cy.contains('9.1');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(2).within(() => {
            cy.contains('A Fan\'s Guide to Spider-Man: Homecoming');
            cy.contains('9.1');
        });



        cy.get('select').select('Title_asc');
        cy.get('.searchPageComponent').find('.movie-list-item').eq(0).within(() => {
            cy.contains('[Bootleg] Batman: Vickie Valle');
            cy.contains('2014');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(1).within(() => {
            cy.contains('25 Years of Transformers');
            cy.contains('2009');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(2).within(() => {
            cy.contains('30 Years of James Bond');
            cy.contains('1992');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(3).within(() => {
            cy.contains('A Fan\'s Guide to Spider-Man: Homecoming');
            cy.contains('2017');
        });

        cy.get('select').select('Title_desc');
        cy.get('.searchPageComponent').find('.movie-list-item').eq(0).within(() => {
            cy.contains('XXX Avengers');
            cy.contains('2011');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(1).within(() => {
            cy.contains('World War Z');
            cy.contains('2013');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(2).within(() => {
            cy.contains('Web of Spider-Man');
            cy.contains('2014');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(3).within(() => {
            cy.contains('Web of Spider Man 2: End of Time');
            cy.contains('2016');
        });


        cy.get('select').select('Director_asc');
        cy.get('.searchPageComponent').find('.movie-list-item').eq(0).within(() => {
            cy.contains('Aaron Schoenke');
            cy.contains('Batman Legends');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(1).within(() => {
            cy.contains('Abu Arifeen Khan');
            cy.contains('Spider/Man');
            cy.contains('2015');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(2).within(() => {
            cy.contains('Adriel Thomas, Damian Thomas');
            cy.contains('Spider/Man');
            cy.contains('2015');

        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(3).within(() => {
            cy.contains('Batman: Legend of Arkham City');
            cy.contains('2012');
            cy.contains('Al Gurst');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(49).within(() => {
            cy.contains('I Hate Living with You, Batman');
            cy.contains('Brandon Conner, Aaron McIlvain');
        });


        cy.get('select').select('Director_desc');
        cy.get('.searchPageComponent').find('.movie-list-item').eq(0).within(() => {
            cy.contains('Zoran Gvojic');
            cy.contains('BigHead Spider-Man 2');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(1).within(() => {
            cy.contains('Zoran Gvojic');
            cy.contains('BigHead Spider-Man: Homecoming Trailer');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(2).within(() => {
            cy.contains('Zane Shaw');
            cy.contains('Batman Goes to School');
        });
        cy.get('.searchPageComponent').find('.movie-list-item').eq(3).within(() => {
            cy.contains('Zack Snyder');
            cy.contains('Batman v Superman: Dawn of Justice');
        });


    })
});

describe('caching', () => {
   // TODO: Check that results are cached as they should, don't know how this would be done
    // (Not prioritized, due time constraint, and the fact that is a prototype
});
