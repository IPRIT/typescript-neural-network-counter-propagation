import {KMEANS_CONF, CLASSES_CONF} from "../src/config";
//noinspection TypeScriptUnresolvedFunction
var express = require('express');
var app = express();
//noinspection TypeScriptUnresolvedFunction
var path = require('path');
//noinspection TypeScriptUnresolvedFunction
var logger = require('morgan');
//noinspection TypeScriptUnresolvedFunction
var bodyParser = require('body-parser');

let clusters: Array<any>;
let points: Array<any>;
let onAction: Function;
let isServerAlreadyRunning: boolean = false;

export function init(_clusters, _onAction: Function = ()=>{}) {
  clusters = _clusters;
  points = _clusters.reduce((acc, cluster) => {
    return acc.concat(cluster.points);
  }, []);
  onAction = _onAction;
  runServerInstance();
}

function runServerInstance() {
  if (isServerAlreadyRunning) {
    return;
  }
  //noinspection TypeScriptUnresolvedVariable
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');

  //app.use(logger('dev'));
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: false }));
  //noinspection TypeScriptUnresolvedVariable
  app.use(express.static(path.join(__dirname, '/app')));

  app.get('/partials\/*:filename', function compileStaticTemplate(req, res) {
    var filename = req.params[0];
    if (!filename) return;
    res.render('../app/partials/' + filename.replace(/(\.htm|\.html)$/i, ''));
  });

  app.get('/', function (req, res) {
    res.render('index/index');
  });

  app.get('/getClusters', function (req, res) {
    res.json(clusters);
  });

  app.get('/getPoints', function (req, res) {
    res.json(points);
  });

  app.get('/getSettings', function (req, res) {
    res.json({
      KMEANS_CONF,
      CLASSES_CONF
    });
  });

  app.post('/computeKmeans', function (req, res) {
    let points = req.body.points || [];
    let immediately = req.body.immediately || false;
    let revoke = req.body.revoke || false;
    onAction({
      type: 'kmeans',
      data: {
        points,
        immediately,
        revoke
      }
    }, (err, result) => {
      if (err) {
        return res.json({ error: err.toString() });
      }
      res.json({ result });
    });
  });

  app.all('/*', function(req, res, next) {
    // Just send the index.jade for other files to support html5 mode in angular routing
    res.render('index/index');
  });

  app.listen(3000, function () {
    console.log('Example app listening on port 3000!');
    isServerAlreadyRunning = true;
  });
}