import React, { Component } from 'react';
import MovieDetails from './movieDetails/containers/MovieDetails';
import { FaBars, FaTimes } from 'react-icons/fa';
import {BrowserRouter as Router, NavLink, Route, Redirect, Switch } from "react-router-dom";
import ResponsiveMenu from 'react-responsive-navbar';
import store from './redux/store/store';
import { Provider } from "react-redux";
import About from './About';
import Watchlist from './watchlist/Watchlist'
import SearchPageComponent from "./search/SearchPageComponent"
import NotFound from "./common/404/NotFound";
import './App.css';
import Home from './Home'


class App extends Component {
    render() {
        return (
            <Provider  store={store}>
                <div className="App">
                    <Router>
                        <div className="app-container">
                            <header className="app-header">
                                <ResponsiveMenu
                                    menuOpenButton={<button><FaBars size={30}/></button>}
                                    menuCloseButton={<button><FaTimes size={30}/></button>}
                                    changeMenuOn="500px"
                                    largeMenuClassName="large-navbar"
                                    smallMenuClassName="small-navbar"
                                    menu={
                                        <ul>
                                            <li><NavLink exact to="/" activeClassName="active">Hjem</NavLink></li>
                                            <li><NavLink to="/about" activeClassName="active">Om</NavLink></li>
                                            <li><NavLink to="/search/" activeClassName="active">Søk</NavLink></li>
                                            <li><NavLink to="/watchlist" activeClassName="active">Watchlist</NavLink></li>
                                        </ul>
                                    }
                                />
                            </header>
                            <div>
                            <Switch>
                                <Route path="/" exact component={IndexComponent} />
                                <Route path="/about/" component={AboutComponent} />
                                <Route path="/search" component={SearchRouter} />
                                <Route path="/movie" component={MovieRouter} />
                                <Route path="/watchlist" component={WatchlistComponent} />
                                <Route component={NotFound} />
                            </Switch>
                        </div>
                        <footer className="app-footer">
                            <span>Laget av gruppe 47</span>
                        </footer>
                        </div>
                    </Router>
                </div>
            </Provider>
        );
    }
}

export default App;



// Handles the routing of /movie. Redirects to the frontpage if there is no specified ID

function MovieRouter({ match }) {
    const MovieComp = ({ match }) => <MovieDetails imdbID={match.params.movieID}/>;
    return (
        <div>
            <Route path={`${match.path}/:movieID`} component={MovieComp} />

            {/* If no movieID is specified, it redirects to the frontpage*/}
            <Route
                exact
                path={match.path}
                render={() =>
                    <Redirect to="/"/>}
            />
        </div>
    );
}

function SearchRouter({ match }) {
    /*
    const SearchComp = ({ match }) => {
        return (<SearchPageComponent searchParams={match.params}/>);
    };
    */

    const SearchComp = () => {
        return (<SearchPageComponent />);
    };
    return (
        <div>
            <Route path={`${match.path}`} component={SearchComp} />
        </div>
    );
}


// These will be swapped with real pages once those are finished
const IndexComponent = () => <Home/>;
const AboutComponent = () => <About/>;
const WatchlistComponent = () => <Watchlist/>;
