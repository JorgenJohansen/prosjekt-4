const express = require('express');
const path = require('path');

let appRouter = function (app) {

    // The server will serve files from the client `build` directory
    const publicPath = path.join(__dirname, '/../../client/build/');
    app.use('/', express.static(publicPath));

    app.get('/help', function (req, res) {
        res.status(200).send({
            message: 'Welcome to our fancy and cool restful API.' +
                'Try to visit our movie API at /api' });
    });

    app.get('/ping', function (req, res) {
        return res.send('pong');
    });

};

module.exports = appRouter;
