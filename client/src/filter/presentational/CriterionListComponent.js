/**
 * List of CriterionComponents, one for each applicable for the search result
 * Ended up not used due to prioritizing, as it would have taken a considerable amount of time setting up support
 * backend
 */


import React, {Component} from 'react';
import CriterionComponent from "./CriterionComponent";

class CriterionListComponent extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        let filters = [];
        this.props.criteria.forEach((criterion) => {
            filters.push(
                <div key={criterion.criterion}>
                    <CriterionComponent
                        criterion={criterion.criterion}
                        items={criterion.items}/>
                </div>
            )
        });

        return (
            <div className="criterionListComponent">
                <h1>Filter the search results:</h1>
                <div>{filters}</div>
            </div>
        );
    }
}

export default CriterionListComponent;
