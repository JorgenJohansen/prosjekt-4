# Prosjekt 4 - Gruppe 47

## Installering

For å installere pakker må man kjøre `npm install` både i rotmappa og
i `client`-mappa.


### Sette opp MySQL-server

Prosjektet forventer at det finnes en kjørende MySQL-server. Det er
denne API-serveren kobler seg til for å gjennomføre spørringer. Man
trenger minst én tabell, men fordelsvis minst to. Hvilke databaser man
kobler til, og med hvilke tilganger spesifiseres i `.env` som ligger i
rotmappa (les avsnitt om _Enviroments for serveren_) for mer
informasjon. Oppsettene i .env trenger ikke å være forskjellige, men
det er greit å ha egen database for testing, slik at man kan forsikre
seg om at disse dataene ikke endres mellom hver integrasjonstest.

I `sql/` ligger det to SQL-script for å sette opp den vanlige databasen
og en test-database. Forskjellige brukerprofiler er ikke påkrevd,
men det kan være en fordel å ha brukere med kun lesetilganger under
produksjon og testing, da blir det veldig liten fare for
eventuelle SQL-XSS-angrep.


Man kan også spesifisere separate databaser for
utvikling og produksjon hvis man vil det. Vi har ikke satt opp dette nå,
siden dette prosjektet har vært i utviklingsfase hele tiden, men ved å
endre databasenavn i sql-filen, og endre verdier i `.env` kan man lett
få satt opp egen database for produksjon.

## Kjøre prosjektet

`npm start` i rotmappa starter nå både serveren og klienten.
Hvis man vil starte dem i hvert sitt terminalvindu kan man bruke
henholdsvis `npm run server` og `npm run client`. Hvis man skal se mye
på ting som blir logget til terminalen kan sistnevnte være en lur idé.

### Server på annen port
Serveren starter normalt på port `8080`. Hvis man vil at serveren skal kjøre på en annen port, kan man
spesifisere `PORT` når man kjører prosjektet/serveren.

Eksempler:
* `PORT=8888 NODE_ENV=development npm start`
* `PORT=8888 NODE_ENV=development npm run server`

### Enviroments for serveren

Når vi skal kjøre ende-til-ende-testing er det veldig kjekt at dataene
i databasen ikke endres, slik at vi for eksempel kan teste hvor mange
(og hvilke) resultater vi får igjen når vi gjør et spesielt søk
og setter på litt forskjellig client-side filtrering. Derfor har vi noen
miljøvariabler serveren bruker til å bestemme hvilken database den
kobler seg til, og hvilke rettigheter den da har. Disse styres gjennom
filen `.env`. Hvilke miljøvariabler som brukes kan styres ved å
spesifisere `NODE_ENV` i terminalen.


Kjøre prosjektet med development-miljøvariabler:
* `NODE_ENV=development npm start` for server og klient i samme vindu
* `NODE_ENV=development npm run server` for server i eget vindu

Da bruker serveren en bruker som har tilgang til å skrive til databasen,
så man kan bruke `movies/stealfromomdb` for å legge til mer innhold.
Produksjons- og test-miljøvariablene har brukere som kun har lesetilgang
(SELECT). Test-miljøvariablene har i tillegg sin egen database.

Med test-miljøvariabler:
* `NODE_ENV=test npm start` for server og klient i samme vindu
* `NODE_ENV=test run server` for server i eget vindu

**NB!** Hvis man ikke spesifiserer noen miljøvariabler, vil
serveren kjøre med produksjons-miljøvariabler.

## Kjøre enhetstester

`npm test` vil nå starte Jest-tester både i serveren og klienten.
Hvis man bare vil kjøre tester av serveren eller klienten kan man kjøre
henholdsvis `npm run testServer` og `npm run testClient`

Begge disse vil da starte i `watchAll`-modus, det vil si at de titter
etter endringer og kjører alle testene på nytt hver gang de oppdager
en endring i prosjektet. Testene til klienten vil starte på nytt hvis
det skjer en endring i `client`, og testene til serveren vil starte hvis
det skjer en endring i rotmappa (eksludert alle filer i `client`).

## Kjøre integrasjonstester med Cypress
Vi har tatt i bruk Cypress for å kjøre automatiserte
ende-til-ende-tester. Kan startes ved å kjøre `npm run cypress`.
Server og klient må kjøre før man starter cypress-testene. Anbefales å
bruke test-miljøvariabler(`NODE_ENV=test npm start`), da vi her kan
være sikre på at dataene i test-databasen ikke endrer seg. Dette gjør
at vi for eksempel kan teste hvilke (og hvor mange) resultater vi får
tilbake på et spesifikt søk. Man kan også kjøre
`npm run integrationTest` for å starte
server med test-variabler, react-appen og cypress samtidig.

## Bygge prosjektet

Man må kjøre `npm run build` fra klientmappa for å bygge prosjektet.
Deretter kan det hostes med en webserver, for eksempel Apache, og
serveren startes med produksjons-miljøvariabler. Dette gjør man ved å
starte serveren uten å spesifisere annet `NODE_ENV`, så man trenger bare
å kjøre `npm run server`.

### Deploye prosjektet til server

For kjøring på en understi (_subpath_) på en allerede kjørende Apache-server 
måtte vi gjøre noen endringer i prosjektet for å få den til å oppføre seg i
det miljøet. Disse er forklart i #36, men her er en oppsummering:

`client/package.json`
Gjør at React vil etterspørre alle ressurser på subpathen `/prosjekt4` på 
Apache-serveren. Uten denne ville siden f.eks. etterspurt `favicon.ico` på
`it2810-47.idi.ntnu.no/favicon.ico` heller enn 
`it2810-47.idi.ntnu.no/prosjekt4/favicon.ico`
```diff
+ "homepage": "/prosjekt4",
```

 `App.js`
 Gjør at lenker til de forskjellige routene i applikasjonen vil gå riktig sted.
 Eksempelvis `it2810-47.idi.ntnu.no/prosjekt4/search` heller enn
  `it2810-47.idi.ntnu.no/search`
```diff
- <Router>
+ <Router basename="prosjekt4/">
```

css for movieListItem
Samme greie her som over
```diff
- background: url('/missingposter.svg') no-repeat;
+ background: url('/prosjekt4/missingposter.svg') no-repeat;
```

client/src/constants:
Når serveren ikke kjører på lokal maskin må vi endre slik at requests
ikke sendes til `localhost:8080/api` på brukerens maskin, 
men heller til adressen hvor serveren faktisk kjører.
```diff
- const API_HOST_NAME = 'localhost';
+ const API_HOST_NAME = 'it2810-47.idi.ntnu.no';

```

Vi brukte Apache-proxy for å videresende forespørsler videre til 
`serve`-serveren
Innhold i `/etc/apache2/sites-available/000-default.conf`:
```conf 
<VirtualHost *:80>
        ProxyPreserveHost On
        ProxyPass /prosjekt4 http://127.0.0.1:5000/
        ProxyPassReverse /prosjekt4 http://127.0.0.1:5000/

</VirtualHost>

# vim: syntax=apache ts=4 sw=4 sts=4 sr noet
```

## Teknologi i bruk

### React
Hva: React er et bibliotek for GUI-elementer som er utviklet av facebook. Det 
fokuserer på å lage komponenter som kan rendres og sammen utforme en webside. 
Det er raskt og kan lett skaleres.

Hvordan:
For å bruke React anbefaler vi først:
-	Gå til https://nodejs.org/ og last ned Node.js for ditt operativsystem.
-	Deretter installer Node og åpne en vanlig terminal (kan også bruke node 
terminalen også).

Deretter:
-	Skriv `npm install create-react-app -g` i din terminal for å installere create-react-app globalt på din datamaskin.
-	Initialisere en mappe via `create-react-app dittProsjekt`
-	Så til slutt skriver du `cd dittProsjekt` for å komme inn i prosjektmappa di.

### Redux
Hva: Et problem som react (og andre verktøy) kan gi oss er håndtering av state 
for store applikasjoner, derfor kan vi bruke Redux som gir oss mulighet til å 
holde all state i en gitt `store` som hele applikasjonen kan aksessere, dette
gir også mulighet til å lagre flere utgaver av tidligere state om ønsket.

Hvordan:
For å bruke redux må du først installere det og legge det til `package.json`:
-	Det gjør du ved hjelp av kommandoen `npm install –save redux`


-	Kan du starte med å lage mapper for container – og presentational components 
i components mappe di.
-	Du kan i tillegg legge til en mappe som heter redux, der du legger til actions, 
reducers og store som du skal bruke videre i applikasjonen.
-	For mer informasjon kan du gå til https://redux.js.org/


Hvordan vi bruker det:
Vi bruker Redux til det meste tilknyttet søkesiden. Sorteringsvalgene i `SortingComponent` skrives direkte til Redux Store, som fører til at SearchPageComponent mottar nye props og oppdaterer seg. Den bruker deretter det nye sorteringskriteriet til å sende ny forespørsel til serveren og viser det nye resultatet.

Søkesiden bruker også Redux Store til å mellomlagre søkeresultater den mottar fra serveren. Hvis man navigerer rundt på siden og kommer tilbake til resultatsiden man var på tidligere, vises da det samme resultatsettet uten at applikasjonen trenger å spørre serveren om det samme på nytt. Den lagrer dog bare det siste resultatsettet man mottok, ikke en full historie av alle tidligere resultatsett. Redux Store tømmes når applikasjonen refreshes (eller lukkes og åpnes på nytt), så dermed burde det ikke være noe problem med at brukere får vist utdaterte resultater.


### Express
Hva: Express.js er en server arkitektur som er godt brukt sammen med Node og 
andre teknologier (MongoDB, Angular) og danner med de den såkalte MEAN-stakken.
Det er selvfølgelig helt mulig å bruke sammen med en annen database og front-end,
som vi har gjort med React og MySQL.

Hvordan:
For å bruke Express.js må du først installere det og legge det til package.json
- Det kan gjøres ved hjelp av kommandoen `npm install express --save`

Express gjør som navnet tilsier det veldig lett å fort opprette en server med 
mange forskjellige routes av forskjellige requesttyper og er dermed et 
åpenbart valg hvis man raskt skal sette opp en enkel API-server.

### OMDb
Hva: Dette er en åpen filmdatabase som inneholder informasjon om veldig
mange filmer, serier, osv. De er indeksert med ID-ene IMDB bruker i sin
database. OMDb har et åpent API (som dog er trafikkbegrenset for
gratisbrukere) hvor man kan sende forespørsler og få ut data på
JSON-format.


Vi bruker OMDB som kilde til dataene våre. Hvis API-serveren kjører med
development-miljøvariabler, kan man sende en `POST`-request til
`api/stealfromomdb` for å fylle opp databasen med innhold. Serveren
vil da søke i OMDb sitt API, forsøke å hente filmer derfra, og sende
dem inn til MySQL-serveren. Denne API-ruten gir ingen tilbakemelding på
om den klarte å gjennomføre oppdraget ikke. Hvis søket du sender med
ikke resulterer i resultater på OMDB, vil ingenting legges til.
`quantity` er en øvre grense for hvor mange den maksimalt
skal legge til, ikke en garanti for at så mange vil bli lagt til.


Eksempel på bruk: `POST` `localhost:8080/api/stealfromomdb?s=Guardians of the galaxy&quantity=2`.

Etter at dataene er lagt til i vår MySQL-server, gjøres det ingen
spørringer til OMDB, `api/stealfromomdb` er eneste ruten på serveren
som vil gjøre spørringer til OMDB, og denne er kun tilgjengelig i
development.


### MySQL(phpMyAdmin)
Hva: Som et vidt brukt og fleksibelt databasesystem, er MySQL en av de største 
relasjonsdatabasene man kan bruke. Det er lett og greit å sette opp tabeller, 
kan gi ferdiglagde queries. Med NTNUs phpMyAdmin kan man gjøre dette på nett, 
istedenfor å laste ned MySQL programmet.

Hvordan:
I MySQL så setter man opp data man ønsker å ha om diverse brukere, tjenester 
eller i vårt tilfelle filmer, i tabeller. Man kan så hente ut den dataen ved 
hjelp av queries som er spørringer, dette gjøres med vanlig SQL syntax.


Vi bruker en MySQL-server på den virtuelle maskinen som holder alle
dataene våre. API-serveren gjør spørringer til denne. Se avsnitt om
å _Sette opp MySQL-server_ for mer informasjon.

## Testing

### Jest
Hva: Jest er JavaScript sin enhetstestrammeverk, som gjør det lett og greit å 
skrive tester for din applikasjon. Det har beskrivende syntax og kan lett brukes 
sammen med andre testrammeverk. Merk at man skriver hva testen gjør i en 'streng'
i starten av describe.

Hvordan:
Du kan starte først med å skrive en vanlig snapshot test:

```js
describe('Rendering', () => {
    it('matches snaphot', () => {
        const tree = renderer.create(<App />);
        expect(tree).toMatchSnapshot();
    })
});
```
Deretter kan du starte å skrive unit tester:

```js
describe('Eksempeltest' () => {
    it('11 + 11 = 100', () => expect(11+11).toEqual(100);
});
```
For mer informasjon, se __Kjøre enhetstester__.

### Cypress
Hva: Med tanke på at applikasjonens deler(unit tester) skal fungere sammen, har
vi bruk for integrasjonstester. For å gjøre dette har vi valgt å ta i bruk Cypress. 
Det gode med Cypress er at alle testene dine kjører lokalt mens du holder på å 
kode din applikasjon. Cypress tar litt tid å sette opp, men et godt brukergrensesnitt og
god, beskrivende syntax gjør det lett å bruke.

Hvordan: Har du brukt Jest tidligere skal det være veldig greit å bruke Cypress.
Du bruker fortsatt describe, it, beforeEach, osv. Noen forskjeller er
at du kan bruke `cy.visit` for å besøke en side og `cy.get` for å aksessere en side sine elementer. Du kan i
tillegg få cypress til å trykke på knapper.

```js
describe('Eksempel integrasjonstest' () => {
    it('teste sider og knapp', () => {
        //For å besøke siden
        cy.visit('Side1');
        //For å finne elementer på siden
        cy.get('knapp1');
        cy.get('knapp1').click();
        cy.visit('Side2');
        //Siden du trykket på side1 sin knapp kommer det opp tekst som vi kan finne
        cy.get('Du trykket på knapp1');
});
```
For informasjon om hvordan vi bruker Cypress, se __Kjøre Cypress-tester__.

## Endringer i oppgave som ikke er tatt hensyn til

I første utgave av prosjektoppgaven var det ikke spesifisert hvordan man skulle 
lagre brukergenererte data: 
> Noe bruker/bruksgenererte data som skal lagres og presenteres (enten bruker 
som legger til informasjon, reviews, ratings, etc., historikk om søkene eller 
annet, handleliste)..

Vår tolkning da vi opprinnelig leste oppgaven kan sees i issue #17.

Vi var allerede godt igang med planlegging og implementering, så å skulle endre dette
ville ikke vært rimelig, og hadde ført til mye ekstraerbeid vi ikke hadde tid til. 
Derfor er vår implementasjon gjort med LocalStorage, som er i tråd med en 
rimelig tolkning av oppgaveteksten slik den fremstod da vi opprettet issues.

Vi har diskutert dette med faglærer og det skal ikke trekke oss i vurderingen.

## Ting vi ikke fikk fullført
Oppgaven nevner flere steder at det skal være en prototyp, og det er enkelte ting 
vi ikke fikk tid til å fullført slik vi ønsket, men dette er ikke aspekter vi har glemt/oversett:

- Fikk ikke tid/overskudd til å skrive så mange tester vi hadde ønsket. Vi har en del dekning
gjennom snapshot-tester, men skulle gjerne ha implementert flere mer programmatiske enhetstester.
Vi har dog ganske god dekning av prosjektet gjennom integrasjonstester.
- Vi kunne ha designet et bedre brukergrensesnitt.
- Hvis man i dag legger til en film i sin Watchlist, og denne forsvinner fra databasen, vil man kunne få en
feilmelding blant ett av listeelementene på WatchList-siden. Hvis vi
hadde hatt mer tid, ville vi implementert en sjekk som spør API-et om
en ID eksisterer, og fjerner den fra brukerens watchlist hvis API-et
returnerer at denne filmen ikke finnes i databasen.

## Erfaringer
- Å ha klassenavn på flere elementer, særlig knapper, hadde gjort integrasjonstestene lettere
- Først var planen å hoste det byggede prosjektet gjennom API-serveren, men mye trøbbel med
stier som ikke ble helt riktige gjorde at vi heller gikk over til å bruke [serve](https://www.npmjs.com/package/serve)

# Kilder/inspirasjon
Oppsettet med server og klient har tatt utgangspunkt i 
[denne guiden av Anthony Accomazzo](https://www.fullstackreact.com/articles/using-create-react-app-with-a-server/) .

Noe av testing av localStorage i Watchlist er inspirert av noen av kommentarene her: https://github.com/facebook/jest/issues/2098 .
