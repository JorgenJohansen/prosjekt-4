/**
 * Simple sorting selector component.
 *
 * If there is a selected sorting option in the Redux Store, that one is preselected in the <select>.
 * When a new selection option is chosen, that is written to the Redux Store.
 */

import React, { Component } from 'react';
import { addSorting } from '../../redux/actions/actions';
import { connect } from "react-redux";
import './SortingComponent.css'

class SortingComponent extends Component {

    /**
     * Fired whenever a new option is selected.
     * Splits the event target value to get the sorting value and direction, and sends it to the Redux Store
     * @param event
     */
    handleChange = (event) => {
        let option = event.target.value;
        const options = option.split('_'); // Basically anti-getValueString

        this.props.addSorting({
            value: options[0],
            dir: options[1]
        });
    };

    render() {
        // Adding default sorting option (imdbID), which will always be present
        const optionObjs = [{value: 'imdbID', name: 'IMDB-ID', dir: 'asc'}].concat(this.props.options);

        let optionElems = [];
        optionObjs.forEach((option) => {
            const valueString = getValueString(option);

            optionElems.push(
                <option key={valueString} value={valueString}>
                    {option.name}
                </option>)
            });
        return (
            <div className="sorting-component">
                <form>
                    <label>
                        <span>Sortér resultater: </span>
                        <select onChange={this.handleChange}
                                defaultValue={getValueString(this.props.searchSorting)}>
                            {optionElems}
                        </select>
                    </label>
               </form>
            </div>
        );
    }
}

/**
 * Creates a string based on the value and direction of an object
 * @param option <object> sorting option object with strings value, name and dir
 * @return {string}
 */
const getValueString = option => {
    return `${option.value}_${option.dir}`;
};

const mapStateToProps = state => {
    const { searchSorting } = state;
    return { searchSorting };
};

export default connect(mapStateToProps, { addSorting })(SortingComponent);
