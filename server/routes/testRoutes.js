/* These are some static test routes that can be called to check that your connection is working as
 * expected and that all parameters get where they're supposed to be
 */

let express = require('express');
let router = express.Router();

/**
 * Gives an introduction to these sub-routes
 */
router.get('/', function (req, res) {
    res.status(200).send({
        message: 'Welcome to the test restful API. These are test routes that return static data    ' +
            'and can be called to check that your connection is working as expected and ' +
            'that all parameters get where they\'re supposed to be',
        suggestion: 'You can try this query, for example: "search?title=Titanic&director=James Cameron&year=1997"',
        availableRoutes: [
            'GET /user',
            'GET /users/:num',
            '/checkNumbers/:num1/:num2',
            'GET /search'
        ]
    });
});


router.get('/user', function (req, res) {
    let data = ({
        firstName: 'aaa',
        lastName: 'bbb',
        username: 'ccc',
        email: 'ccc@mail.com'
    });
    res.status(200).send(data);
});

router.get('/users/:num', function (req, res) {
    let users = [];
    let num = req.params.num;

    if (isFinite(num) && num  > 0 ) {
        for (let i = 0; i < num; i++) {
            users.push({
                firstName: 'aaa',
                lastName: 'bbb',
                username: 'ccc',
                email: 'ccc@mail.com'
            });
        }

        res.status(200).send(users);

    } else {
        res.status(400).send({ message: 'invalid numbers supplied' });
    }
});


router.get('/checkNumbers/:num1/:num2', function (req, res) {
    let num1 = Number(req.params.num1);
    let num2 = Number(req.params.num2);

    console.log('req.params.num1:', req.params.num1);
    console.log('req.params.num2:', req.params.num2);

    if (Number.isInteger(num1) && Number.isInteger(num2)) {
        let data = {
            num1: num1,
            num2: num2
        };

        res.status(200).send(data);

    } else {
        res.status(400).send({ message: 'invalid numbers supplied' });
    }

});


router.get('/search', function (req, res) {
    const year = req.query.year;
    const title = req.query.title;
    const director = req.query.director;

    let data = ({
        message: 'Here are the query params I received:',
        data:
            {
                title: title,
                director: director,
                year: year
            }
    });
    res.status(200).send(data);
});


module.exports = router;
