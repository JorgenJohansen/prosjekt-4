
describe('Visiting app', () => {
    it('should open the app', () => {
        cy.visit('http://localhost:3000');

        cy.get('.app-container').contains('Velkommen til denne søkesiden for filmer');
        cy.get('.app-footer').contains('Laget av gruppe 47');
    });
});

describe('Testing Router functionality', () => {
    it('should open the home page', () => {
        cy.visit('http://localhost:3000');
        cy.get('.app-container').contains('Velkommen til denne søkesiden for filmer');
    });

    it('should open the About page', () => {
        cy.visit('http://localhost:3000/about');
        cy.get('.about').contains('Prosjekt 4 - Gruppe 47');
        cy.get('.about').contains('IT2810 ved NTNU Høsten 2018');
        cy.get('.about').contains('From gruppe 47 with love');
    });

    it('should open the Search page', () => {
        cy.visit('http://localhost:3000/search');
        cy.get('.searchPageComponent').contains('Filmsøk:');
        cy.get('.searchFieldComponent').contains('Søk');
    });

    it('should open the Watchlist page', () => {
        cy.visit('http://localhost:3000/watchlist');
        cy.get('.watchlist').contains('Du har ingen filmer i din Watchlist');
        cy.get('.watchlist').contains('Du kan finne filmer på søkesiden, klikke deg inn på dem, og legge dem til i din Watchlist.');
    });

    it('should open a movie page', () => {
        cy.visit('http://localhost:3000/movie/tt0035665');
        cy.get('.movie-details');
        cy.get('.movie-title').contains('Title: Batman');
    });

    it('should open a 404 page', () => {
        cy.visit('http://localhost:3000/movies');
        cy.get('.not-found').contains('404: Siden du leter etter finnes ikke');

        cy.visit('http://localhost:3000/sdd skdjksdu 2u3');
        cy.get('.not-found').contains('404: Siden du leter etter finnes ikke');
    })

});
