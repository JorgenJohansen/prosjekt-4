const checkForNA = (obj, value) => {
    if (value && value !== 'N/A') {
        return obj
    }
    return null
};

const checkForEmptyArr = (obj, arr) => {
    if(arr && arr !== []){
        return obj
    }
    return null
};

const stringifyArr = (arr) => {
    return arr.join(', ');
};

/**
 * Compares two objects and returns true if they are equal, and false otherwise.
 * Object parameters need to be ordered the same way for this function to be able to to compare them properly.
 * Should only be used for small objects, never on large result sets.
 * @param obj1 <Object>
 * @param obj2 <Object>
 * @return {boolean}
 */
const compareObjects = (obj1, obj2) => {
    return (JSON.stringify(obj1) === JSON.stringify(obj2))
};

module.exports = {
    checkForNA,
    checkForEmptyArr,
    stringifyArr,
    compareObjects
};
