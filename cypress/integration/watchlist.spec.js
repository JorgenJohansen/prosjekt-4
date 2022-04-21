describe('testing movie details page with Batman', () => {

    beforeEach(() => {
        //Tømmer lokalstorage for hver gang for å hindre feil med testene
        cy.clearLocalStorage();
    });

    it('besøke watchlist og få opp default informasjon', () => {
        cy.visit('http://localhost:3000/watchlist');
        cy.get('.watchlist').contains('Du har ingen filmer i din Watchlist');

        cy.get('.watchlist').contains('Du kan finne filmer på søkesiden, klikke deg inn på dem, og legge dem til i din Watchlist.');

        
    });

    it('besøke en film og legge den til i wantToWatch watchlist', () => {
        //Besøker en film og sjekker om 'Vil se' og 'Har sett' finnes
        cy.visit('http://localhost:3000/movie/tt0035665');
        cy.contains('Vil se');
        cy.contains('Har sett');
        
        //Trykker på vil se og ser at Fjern fra 'Vil se' og 'Har sett' finnes
        cy.contains('Vil se').click();
        cy.contains('Fjern fra \'Vil se\'');
        cy.contains('Har sett');
        
        //Trykker på har sett, sjekker om Fjern fra 'Har sett' finnes og at 'Vil se' ikke finnes
        cy.contains('Har sett').click();
        cy.contains('Fjern fra \'Har sett\'');
        cy.contains('Vil se').should('not.exist')
        
       //Trykker på "Fjern fra 'Har sett'" og sjekker at 'Har sett' og 'Vil se' finnes
        cy.contains('Fjern fra \'Har sett\'').click();
        cy.contains('Har sett');
        cy.contains('Vil se');

    });

    it('besøke en film og sjekke om informasjonen ligger i watchlist(Vil se)', () => {
        //Besøker en film og trykker på 'Vil se'
        cy.visit('http://localhost:3000/movie/tt0035665');
        cy.contains('Vil se');
        cy.contains('Har sett');
        cy.contains('Vil se').click();

        //Besøker watchlist og ser at overskrift og filmens opplysninger finnes
        cy.visit('http://localhost:3000/watchlist');
        cy.get('.watchlist').contains('Filmene du ønsker å se');
        cy.get('.watchlist').contains('Batman');
        cy.get('.watchlist').contains('1943');
        cy.get('.watchlist').contains('Lambert Hillyer');

        //Besøker filmen på nytt og fjerner den fra 'Vil se'
        cy.visit('http://localhost:3000/movie/tt0035665');
        cy.contains('Fjern fra \'Vil se\'');
        cy.contains('Har sett');
        cy.contains('Fjern fra \'Vil se\'').click();
        cy.contains('Vil se');

        //Besøker watchlist og får opp default informasjonen
        cy.visit('http://localhost:3000/watchlist');
        cy.get('.watchlist').contains('Du har ingen filmer i din Watchlist');
        cy.get('.watchlist').contains('Du kan finne filmer på søkesiden, klikke deg inn på dem, og legge dem til i din Watchlist.');

    });

    it('besøke en film og sjekke om informasjonen ligger i watchlist(har sett)', () => {
        //Besøker en film og trykker på 'Har sett'
        cy.visit('http://localhost:3000/movie/tt0035665');
        cy.contains('Vil se');
        cy.contains('Har sett');
        cy.contains('Har sett').click();

        //Besøker watchlist og ser at overskrift og filmens opplysninger finnes
        cy.visit('http://localhost:3000/watchlist');
        cy.get('.watchlist').contains('Filmene du har sett');
        cy.get('.watchlist').contains('Batman');
        cy.get('.watchlist').contains('1943');
        cy.get('.watchlist').contains('Lambert Hillyer');

        //Besøker filmen på nytt og fjerner den fra 'Har sett'
        cy.visit('http://localhost:3000/movie/tt0035665');
        cy.contains('Fjern fra \'Har sett\'');
        cy.contains('Vil se').should('not.exist');
        cy.contains('Fjern fra \'Har sett\'').click();
        cy.contains('Vil se');
        cy.contains('Har sett');

        //Besøker watchlist og får opp default informasjonen
        cy.visit('http://localhost:3000/watchlist');
        cy.get('.watchlist').contains('Du har ingen filmer i din Watchlist');
        cy.get('.watchlist').contains('Du kan finne filmer på søkesiden, klikke deg inn på dem, og legge dem til i din Watchlist.');
    });

    it('Besøke og legge til 5 filmer i watchlist(3 i vil se og 2 i har sett),' 
    +'sjekke at informasjonen om filmene er der og lengden på listene vi tar fra localStorage', () => {
         //Besøker en film og trykker på 'Vil se'
         cy.visit('http://localhost:3000/movie/tt0034639');
         cy.contains('Vil se');
         cy.contains('Har sett');
         cy.contains('Vil se').click();

        //Besøker en film og trykker på 'Vil se'
        cy.visit('http://localhost:3000/movie/tt0035665');
        cy.contains('Vil se');
        cy.contains('Har sett');
        cy.contains('Vil se').click();

        //Besøker en film og trykker på 'Vil se'
        cy.visit('http://localhost:3000/movie/tt0041162');
        cy.contains('Vil se');
        cy.contains('Har sett');
        cy.contains('Vil se').click();

        //Besøker en film og trykker på 'Har sett'
        cy.visit('http://localhost:3000/movie/tt0372784');
        cy.contains('Vil se');
        cy.contains('Har sett');
        cy.contains('Har sett').click();

        //Besøker en film og trykker på 'Har sett'
        cy.visit('http://localhost:3000/movie/tt0096895');
        cy.contains('Vil se');
        cy.contains('Har sett');
        cy.contains('Har sett').click();

        //Besøker watchlist og ser at overskrift og filmens opplysninger finnes
        cy.visit('http://localhost:3000/watchlist');

        //Sjekker lengden av at 'wantToWatch' lista har riktig lengde
        cy.get('.movie-list-container').eq(0).within(() => {
            cy.get('.movie-list-item').should('have.length', 3)
        });

        //Sjekker lengden av at 'hasWatched' lista har riktig lengde
        cy.get('.movie-list-container').eq(1).within(() => {
            cy.get('.movie-list-item').should('have.length', 2)
        });

        //Sjekker for filmene du ønsker å se
        cy.get('.watchlist').contains('Filmene du ønsker å se');
        
        cy.get('.watchlist').contains('The Avengers');
        cy.get('.watchlist').contains('1942');
        cy.get('.watchlist').contains('Harold French');

        cy.get('.watchlist').contains('Batman');
        cy.get('.watchlist').contains('1943');
        cy.get('.watchlist').contains('Lambert Hillyer');

        cy.get('.watchlist').contains('Batman and Robin');
        cy.get('.watchlist').contains('1949');
        cy.get('.watchlist').contains('Spencer Gordon Bennet');

        //Sjekker for filmene du har sett
        cy.get('.watchlist').contains('Filmene du har sett');
        
        cy.get('.watchlist').contains('Batman Begins');
        cy.get('.watchlist').contains('2005');
        cy.get('.watchlist').contains('Christopher Nolan');

        cy.get('.watchlist').contains('Batman');
        cy.get('.watchlist').contains('1989');
        cy.get('.watchlist').contains('Tim Burton');
    });

});