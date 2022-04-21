const express = require('express');
const bodyParser = require('body-parser');
let routes = require('./routes/routes.js');
let movies = require('./routes/movies.js');
let testRoutes = require('./routes/testRoutes.js');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Enabling CORS
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// Some standard routes, like '/' and '/ping'. Also route to allow server to host the final build.
routes(app);

// All routes for /movies
app.use('/api', movies);

// Just test routes, only to be used to verify that your connection to the API is working as expected
app.use('/api/test', testRoutes);


let server = app.listen(process.env.PORT || 8080, function () {
    console.log('app running on port', server.address().port);
});

// Setting up custom error handler
app.use(function (err, req, res, next) {
    console.error(err.stack);
    res.status(500).send({ message: 'Something went wrong. Please contact system administrator if error persists.' });
});
