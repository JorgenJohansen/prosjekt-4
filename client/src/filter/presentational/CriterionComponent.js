/**
 * List of checkboxes (for each item in a criterion) to be checked for changing of the filtering of a search result
 * Ended up not used due to prioritizing, as it would have taken a considerable amount of time setting up support
 * backend
 */


import React, {Component} from 'react';

class CriterionComponent extends Component {
    constructor(props){
        super(props);

        this.state = {
            checked: []
        };
    }

    handleChange = (event) => {
        // TODO: Update this function to potentially use Redux
        let item = event.target.value;
        let checked = this.state.checked;
        let newChecked = [];

        let index = checked.indexOf(item);
        if (index > -1){ // Element in list
            // Up to the element vi will remove
            newChecked = checked.slice(0, index);
            if (index !== checked.length - 1){
                // Appends all elements after the one we will remove, except if it is the last one
                newChecked = newChecked.concat(checked.slice(index+1));
            }
        } else { // Element not in list
            newChecked = checked;
            newChecked.push(item);
        }
        this.setState({
            checked: newChecked
        });
    };

    isChecked = item => {
        // TODO: Update this function to potentially use Redux
        return (this.state.checked.includes(item));
    };

    render() {
        let checkBoxes = [];
        this.props.items.forEach((item) => {
            checkBoxes.push(
                <div key={item}>
                    <input type="checkbox"
                           id={item}
                           value={item}
                           checked={this.isChecked(item)}
                           onChange={this.handleChange}
                    />
                    <label>{item}</label>
                </div>
            )
        });

        return (
            <div className="criterionComponent">
                <form>
                    <h3>{this.props.criterion}</h3>
                    <div>{checkBoxes}</div>
                </form>
            </div>
        );
    }
}

export default CriterionComponent;
