describe('testing movie details page with Batman', () => {
    it('should render tt0035665 correctly', () => {
        cy.visit('http://localhost:3000/movie/tt0035665');
        cy.get('.movie-details').get('.movie-title').contains('Title: Batman');
        cy.get('.movie-details').get('.movie-poster').get('img').should('have.prop', 'src', 'https://m.media-amazon.com/images/M/MV5BNTIzMDI1MTk3Nl5BMl5BanBnXkFtZTgwODE4NzM1MjE@._V1_SX300.jpg');
        cy.get('.movie-details').get('.movie-year').contains('Year: 1943');
        cy.get('.movie-details').get('.movie-rated').contains('Rated: APPROVED');
        cy.get('.movie-details').get('.movie-genre').contains('Genre: Action, Adventure, Crime, Sci-Fi, Thriller, War');
        cy.get('.movie-details').get('.movie-director').contains('Director: Lambert Hillyer');
        cy.get('.movie-details').get('.movie-writer').contains('Writer(s): Bob Kane (comic books created by), Victor McLeod (screenplay by), Leslie Swabacker (screenplay by), Harry L. Fraser (screenplay by)');
        cy.get('.movie-details').get('.movie-actors').contains('Actors: Lewis Wilson, Douglas Croft, J. Carrol Naish, Shirley Patterson');
        cy.get('.movie-details').get('.movie-score').contains('IMDB-rangering: 6.5');
    });

    it('should render tt3959414 correctly', () => {
        cy.visit('http://localhost:3000/movie/tt3959414');
        cy.get('.movie-details').get('.movie-title').contains('Title: Batman and Robin');
        cy.get('.movie-details').get('.movie-poster').should('not.exist');
        cy.get('.movie-details').get('.movie-year').contains('Year: 1964');
        cy.get('.movie-details').get('.movie-rated').should('not.exist');
        cy.get('.movie-details').get('.movie-genre').contains('Genre: Short, Action');
        cy.get('.movie-details').get('.movie-director').contains('Director: Donald F. Glut');
        cy.get('.movie-details').get('.movie-writer').contains('Writer(s): Donald F. Glut');
        cy.get('.movie-details').get('.movie-actors').contains('Actors: Jerry Blum, Donald F. Glut, Larry Ivie');
    });
});

describe('testing movie details page with invalid input', () => {

    it('should render error message when the given imdbID is not in the database', () => {
        cy.visit('http://localhost:3000/movie/tt3959415');
        cy.get('.movie-details').get('h3').contains('Det skjedde noe feil ...');
        cy.get('.movie-details').get('p').contains('Fant ingen filmer med ID: tt3959415');
        cy.get('.movie-details').get('a').contains('Gå tilbake til forsiden');
    });

    it('should render error message when invalid format of imdbID is given', () => {
        cy.visit('http://localhost:3000/movie/3959414');
        cy.get('.movie-details').get('h3').contains('Det skjedde noe feil ...');
        cy.get('.movie-details').get('p').contains('Feil under henting av data');
        cy.get('.movie-details').get('p').contains('Svar fra server: Invalid imdbID supplied. Example imdbID: tt0035665');
        cy.get('.movie-details').get('a').contains('Gå tilbake til forsiden');
    });
});


describe('testing movie details page with no input', () => {
    it('should render home page', () => {
        cy.visit('http://localhost:3000/movie/');
        cy.get('.app-container').contains('Velkommen til denne søkesiden for filmer');
    });
});
