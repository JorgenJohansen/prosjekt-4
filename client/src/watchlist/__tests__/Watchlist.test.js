import React from 'react';
import renderer  from 'react-test-renderer';
import { shallow, mount } from 'enzyme';
import TestRenderer from 'react-test-renderer';
import { HAS_WATCHED, WANT_TO_WATCH } from '../constants';
import Watchlist from '../../watchlist/Watchlist';
import { MemoryRouter } from 'react-router-dom';

import { getWatchlistLocalStorage, writeWatchlistLocalStorage} from '../helpers';

describe('Rendering', () => {

    it('matches snaphot', () => {
        //Siden watchlist inneholder en link må vi wrappe den med MemoryRouter
        const tree = renderer.create(<MemoryRouter><Watchlist /></MemoryRouter>);
        expect(tree).toMatchSnapshot();
    })
});

//Generell localstoragemock som gir oss mulighet til å hente, legge til og slette elementer ved
//hjelp av metodene som er skrevet under, dette er også til hjelp med tanke på at vi akkurat nå
//ikke har funksjoner i helpers.js som kan slette elementer og fjerne alt fra localStorage
//med tanke på at dette krever ekstra funksjonalitet som vi ikke har tid til å implementere
//eller er nødvendig for siden vår
const localStorageMock = (function(){
    let store = {};
    return {
        getItem(key){
            return store[key]|| null;
        },
        setItem(key,value){
            store[key] = value.toString();
        },
        removeItem(key){
            delete store[key]
        },
        clear(){
            store = {};
        },
    };
})();

Object.defineProperty(window,'localStorage', {
    value: localStorageMock,
});

describe('teste localStorage mock', () => {
    beforeEach(() => localStorage.clear());

    it('localStorage er tomt når vi inititialiserer det', () => expect(localStorage.getItem("wantToWatch")).toBeNull());

    it('legge til en film til wantToWatch', () => {
        localStorage.setItem('wantToWatch','Batman');
        expect(localStorage.getItem('wantToWatch')).toEqual('Batman');
    });

    it('fjerne filmen som er lagt til i wantToWatch', () => {
        localStorage.removeItem('wantToWatch');
        const movie = localStorage.getItem('wantToWatch');
        expect(movie).toBeNull();
    });
});



describe('Teste watchlist localStorage', () => {
    beforeEach(() => localStorage.clear());

    it('legge til en film til watchlist', () => {
        const data = {wantToWatch:"batman"};
        writeWatchlistLocalStorage(data);
        const movie = getWatchlistLocalStorage();
        expect(movie).toEqual(data);
    });

    it('returnere et tomt objekt hvis det er ingenting i localStorage', () => {
        localStorage.clear();
        const movie = getWatchlistLocalStorage();
        expect(movie).toEqual({});
    });
});

describe('populateWatchLists', () => {
    beforeEach(() => localStorage.clear());
    it('should return empty lists', () => {

        const data = {};

        const watchLists = {
            wantToWatch: [],
            hasWatched: []
        };
        writeWatchlistLocalStorage(data);


        const watchList = mount(<MemoryRouter><Watchlist/></MemoryRouter>).find(Watchlist).instance();
        expect(watchList.populateWatchlists()).toEqual(watchLists)
    });

    it('should return empty hasWatched', () => {

        const data = {
            'tt0361763': WANT_TO_WATCH,
            'tt1194172': WANT_TO_WATCH
        };

        const watchLists = {
            wantToWatch: [
                {imdbID: 'tt0361763'},
                {imdbID: 'tt1194172'}
            ],
            hasWatched: []
        };
        writeWatchlistLocalStorage(data);


        const watchList = mount(<MemoryRouter><Watchlist/></MemoryRouter>).find(Watchlist).instance();
        expect(watchList.populateWatchlists()).toEqual(watchLists)
    });

    it('should return empty wantToWatch', () => {

        const data = {
            'tt0057875': HAS_WATCHED,
            'tt1228961': HAS_WATCHED,
            'tt0061386': HAS_WATCHED,
            'tt0103776': HAS_WATCHED
        };

        const watchLists = {
            wantToWatch: [],
            hasWatched: [
                {imdbID: 'tt0057875'},
                {imdbID: 'tt1228961'},
                {imdbID: 'tt0061386'},
                {imdbID: "tt0103776"}
            ]
        };
        writeWatchlistLocalStorage(data);

        const watchList = mount(<MemoryRouter><Watchlist/></MemoryRouter>).find(Watchlist).instance();
        expect(watchList.populateWatchlists()).toEqual(watchLists)
    });

    it('should return both arrays with content', () => {

        const data = {
            'tt0057875': HAS_WATCHED,
            'tt0361763': WANT_TO_WATCH,
            'tt1228961': HAS_WATCHED,
            'tt0061386': HAS_WATCHED,
            'tt1194172': WANT_TO_WATCH,
            'tt0103776': HAS_WATCHED
        };

        const watchLists = {
            wantToWatch: [
                {imdbID: 'tt0361763'},
                {imdbID: 'tt1194172'}
            ],
            hasWatched: [
                {imdbID: 'tt0057875'},
                {imdbID: 'tt1228961'},
                {imdbID: 'tt0061386'},
                {imdbID: "tt0103776"}
            ]
        };
        writeWatchlistLocalStorage(data);

        const watchList = mount(<MemoryRouter><Watchlist/></MemoryRouter>).find(Watchlist).instance();
        expect(watchList.populateWatchlists()).toEqual(watchLists)
    });


});



describe('rendering correctly with lists', () => {
    beforeEach(() => localStorage.clear());

    it('should return empty lists', () => {
        // Will render "du har ingen filmer i din watchlist..."
        const tree = renderer.create(<MemoryRouter><Watchlist /></MemoryRouter>);
        expect(tree).toMatchSnapshot();
    });

    it('should return empty hasWatched', () => {

        const data = {
            'tt0361763': WANT_TO_WATCH,
            'tt1194172': WANT_TO_WATCH
        };
        writeWatchlistLocalStorage(data);

        // Will render with "Vil se" header and one movie-list-container with two movie-list-items
        const tree = renderer.create(<MemoryRouter><Watchlist /></MemoryRouter>);
        expect(tree).toMatchSnapshot();
    });

    it('should return empty wantToWatch', () => {

        const data = {
            'tt0057875': HAS_WATCHED,
            'tt1228961': HAS_WATCHED,
            'tt0061386': HAS_WATCHED,
            'tt0103776': HAS_WATCHED
        };
        writeWatchlistLocalStorage(data);

        // Will render with "Har" header and one movie-list-container movie-list-container with two movie-list-items
        const tree = renderer.create(<MemoryRouter><Watchlist /></MemoryRouter>);
        expect(tree).toMatchSnapshot();
    });

    it('should return both arrays with content', () => {

        const data = {
            'tt0057875': HAS_WATCHED,
            'tt0361763': WANT_TO_WATCH,
            'tt1228961': HAS_WATCHED,
            'tt0061386': HAS_WATCHED,
            'tt1194172': WANT_TO_WATCH,
            'tt0103776': HAS_WATCHED
        };
        writeWatchlistLocalStorage(data);

        // Will render with "Vil se" and "Har sett" headers and their respective movie-list-container's,
        // both will have two movie-list-items
        const tree = renderer.create(<MemoryRouter><Watchlist /></MemoryRouter>);
        expect(tree).toMatchSnapshot();
    });

});

