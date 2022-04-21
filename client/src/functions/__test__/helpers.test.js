let functions = require('../helpers');


describe('checkForNA', () => {

   let object1 = {
       name: 'object1',
       value: 'value'
   };

    let object2 = {
        name: 'object2',
        value: 1984
    };

    it('should return the object if the value is valid (string or number)', ()=> {
        expect(functions.checkForNA(object1, object1.value)).toEqual(object1);
        expect(functions.checkForNA(object2, object2.value)).toEqual(object2);
    });

    let object3 = {
        name: 'object3',
        value: 'N/A'
    };

    it('should return null if the value is "N/A"', () => {
        expect(functions.checkForNA(object3, object3.value)).toBeNull();
    });

    let object4 = {
        name: 'object3',
        value: false
    };

    it('should return null if no value is given', ()=> {
        expect(functions.checkForNA(object4, object4.value));
    });
});

describe('stringifyArr', () => {

    it('should return the items in the array as a string separated by commas', () => {
        expect(functions.stringifyArr(['Batman Begins', 'The Dark Knight', 'The Dark Knight Rises'])).toEqual('Batman Begins, The Dark Knight, The Dark Knight Rises');
    });

    it('should not return any comma if the array contain one item', () => {
        expect(functions.stringifyArr(['Batman Begins'])).toEqual('Batman Begins');
    });

    it('should return an empty string if the array is empty', () => {
        expect(functions.stringifyArr([])).toEqual('');
    });
});