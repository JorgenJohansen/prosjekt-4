import React from 'react';
import MovieDetails from '../MovieDetails.js'
import renderer from 'react-test-renderer';
import axios from 'axios'

jest.mock('axios');

describe('Rendering', () => {
    const res = {
        data:  [
            {
                Title: 'Batman',
                Director: 'Nolan',
                imdbID: 'tt0372784',
                Actors: 'N/A',
                Writers: 'N/A',
                Genre: 'N/A'
            }
            ]
    };
    axios.get.mockResolvedValue(res);

    it('renders correctly with renderer', () => {
        const movieDetails = renderer.create(
            <MovieDetails imdbID={'tt0372784'} />);

        expect(movieDetails).toMatchSnapshot();
    });

    it('renders empty with empty call', () => {
        const movieDetails = renderer.create(
            <MovieDetails />);

        expect(movieDetails).toMatchSnapshot();
    });

});
