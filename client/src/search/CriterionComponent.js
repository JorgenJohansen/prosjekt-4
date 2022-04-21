/**
 * List of checkboxes (for each item in a criterion) to be checked for changing of the filtering of a search result
 *
 * Example calling: <CriterionComponent criterion="Genre" items={["Horror", "Drama", "Thriller"]} />
 *
 */


import React, {Component} from 'react';

class CriterionComponent extends Component {
    constructor(props){
        super(props);

        this.state = {
            checked: null
        };
    }

    handleChange = (event) => {
        // TODO: Update this function to potentially use Redux
        let item = event.target.value;
        this.setState({
            checked: item
        })
    };

    isChecked = item => {
        // TODO: Update this function to potentially use Redux
        return (this.state.checked === item);
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
