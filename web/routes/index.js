var express = require('express');
var cfg = require('../config');
var router = express.Router();

/* GET single page application index. */
router.get('/', function(req, res, next) {
    res.render('index', {
        compiled: req.app.get('env') === 'production' || cfg.compiled,
        layout: null
    });
});

module.exports = router;
