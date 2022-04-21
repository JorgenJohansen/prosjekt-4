/**
 * Search field component.
 * Gets query parameters as a prop, uses those to initiate values and inputs if they exist,
 * otherwise values and inputs are initiated with default ("empty") values.
 *
 * Redirects user to a search page with the chosen search parameters when the user clicks "Søk"
 */


import React, {Component} from 'react';
import { Redirect } from 'react-router-dom';
import Slider from 'rc-slider';
import { MIN_SEARCH_YEAR, MAX_SEARCH_YEAR } from "../constants";
import './SearchFieldComponent.css';
import 'rc-slider/assets/index.css';


const createSliderWithTooltip = Slider.createSliderWithTooltip;
const Range = createSliderWithTooltip(Slider.Range);



class SearchFieldComponent extends Component {
    constructor(props){
        super(props);

        this.state = {
            // Initialize search to the current search params if they exist
            title: (this.props.params && this.props.params.title) ? this.props.params.title : '',
            showingAdvanced: false,
            director: (this.props.params && this.props.params.director)
                ? this.props.params.director
                : '',
            startYear: (this.props.params && this.props.params.startYear)
                ? Number(this.props.params.startYear)
                : null,
            endYear: (this.props.params && this.props.params.endYear)
                ? Number(this.props.params.endYear)
                : null,
        };
    }
    redirectUrl = null;

    componentDidMount() {
        if (!this.state.showingAdvanced && this.advancedSearchSet()){
            this.openAdvancedSearch();
        }
    }


    handleSubmit = (evt) => {
        evt.preventDefault();
        let searchText = this.state.title.trim();
        if (searchText.length < 1) {
            alert("Can not search empty string")
        } else if (this.state.endYear && this.state.startYear && this.state.endYear < this.state.startYear) {
            // FIXME: This test is not working, but might not be needed if we find a range picker component
            alert('Startår kan ikke være før sluttår og vice versa');
        }
        else if (this.state.startYear < 0 || this.state.endYear < 0) {
            alert('Kan ikke søke på år som er mindre enn null')
        }
        else {
            this.redirect()
        }
    };

    redirect(){
        this.redirectUrl = `/search?title=${this.state.title}`;
        if (this.state.director) this.redirectUrl += `&director=${this.state.director}`;
        if (this.state.startYear) this.redirectUrl += `&startYear=${this.state.startYear}`;
        if (this.state.endYear) this.redirectUrl += `&endYear=${this.state.endYear}`;
        this.forceUpdate();
    }

    toggleAdvancedSearch = () => {
        if (this.state.showingAdvanced){
            // Emptying all advanced search parameters when advanced search is closed
            this.setState({
                director: null,
                startYear: null,
                endYear: null
            });
        }
        this.setState(prevstate => ({
            showingAdvanced: !prevstate.showingAdvanced
        }));
    };

    openAdvancedSearch = () => {
        this.setState({
            showingAdvanced: true
        });
    };

    advancedSearchSet = () => {
        return (this.state.director !== '' || this.state.startYear || this.state.endYear)
    };


    render() {
        let redirect = null;
        if (this.redirectUrl) {
            redirect = <Redirect to={this.redirectUrl} push />
        }


        return (
            <div className="searchFieldComponent">
                <form>
                    {redirect}
                    <h3>Filmsøk:</h3>
                    <button type="button"
                            onClick={this.toggleAdvancedSearch}
                            className='toggle-advanced-search'>
                        {!this.state.showingAdvanced && 'Avansert søk'}
                        {this.state.showingAdvanced && 'Enkelt søk'}
                    </button>
                    <label>
                        <span>Tittel: </span>
                    <input type={"text"}
                           onChange={event => {
                               this.setState({
                                   title: event.target.value
                               })
                           }}
                           value={this.state.title}
                           placeholder={"Søk etter filmtittel"}
                           required={true}/>
                    </label>


                    {this.state.showingAdvanced &&
                        <div>
                            <label className="director">
                                <span>Regissør: </span>
                                <input type={"text"}
                                       onChange={event => {
                                           this.setState({
                                               director: event.target.value
                                           })
                                       }}
                                       value={this.state.director}
                                       placeholder={"Søk etter regissør"}
                                />
                            </label>

                            <div className="range-slider">
                                <label>
                                    <span>Avgrens år:</span>
                                    <Range defaultValue={[this.state.startYear ? this.state.startYear : 0, this.state.endYear ? this.state.endYear : MAX_SEARCH_YEAR]}
                                           min={MIN_SEARCH_YEAR}
                                           max={MAX_SEARCH_YEAR}
                                           onChange={value => {
                                               this.setState({
                                                   // Setting year limitations to `null` if they are the max or min values
                                                   startYear: value[0] !== MIN_SEARCH_YEAR ? value[0] : null,
                                                   endYear: value[1] !== MAX_SEARCH_YEAR ? value[1] : null
                                               });
                                           }}
                                           tipFormatter={value => `År ${value}`}
                                    />

                                    {/*
                                        These are conditionally rendered to only be shown if the values exist and are
                                        not at the min or max values
                                    */ }

                                    {((this.state.startYear &&  this.state.startYear !==  MIN_SEARCH_YEAR) && (this.state.endYear && this.state.endYear !== MAX_SEARCH_YEAR )) ?
                                        <span>Fra {this.state.startYear} til {this.state.endYear}</span>
                                        : null
                                    }

                                    {((this.state.startYear &&  this.state.startYear !==  MIN_SEARCH_YEAR) && (!this.state.endYear || this.state.endYear === MAX_SEARCH_YEAR )) ?
                                        <span>Etter {this.state.startYear}</span>
                                        :null
                                    }

                                    {((!this.state.startYear ||  this.state.startYear ===  MIN_SEARCH_YEAR) && this.state.endYear && this.state.endYear !== MAX_SEARCH_YEAR) ?
                                        <span>Før {this.state.endYear}</span>
                                        : null
                                    }

                                </label>
                            </div>
                        </div>
                    }


                    <button type="submit"
                            onClick={this.handleSubmit}
                            disabled={this.state.title.trim().length < 1} >
                        Søk
                    </button>

                </form>
            </div>
        );
    }
}

export default SearchFieldComponent;
