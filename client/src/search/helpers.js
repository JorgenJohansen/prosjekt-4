import axios from "axios";


function handleResults(results, that){
    // Placeholder, venter på Redux-implementasjon
    that.setState({
        results: results
    })
}

function performSearch(searchText, that) {
    const requestString = `localhost:8080/movies/search?title=${searchText}`;
    console.log(requestString);

    axios.get(requestString).then(res => {
        console.log(res);
        console.log(res.data);
        handleResults(res.data, that);
    }).catch(error => {
        console.error(error);
    })
}

module.exports = {
    handleQuery:  (searchText, that) => {
        performSearch(searchText, that);
    }
};
