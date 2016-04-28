import {TestDataProvider, IrisDataProvider, IDataProvider, DataType, StarsDataProvider} from "./src/Data/DataProvider";
import {DataMixer} from "./src/Data/DataMixer";
import {DataNormalizer} from "./src/Data/DataNormalizer";
import * as View from "./frontend/app";
import * as Config from './src/config';
import {Kmeans} from "./src/Clusterization/Methods/Kmeans";
import {EuclideanMetric, EuclideanSquareMetric} from "./src/Clusterization/Metrics/Metrics";
import {CounterPropagationNetwork} from "./src/Clusterization/Methods/Neuro/CounterPropagationNetwork";

//noinspection TypeScriptUnresolvedFunction
let colors = require('colors/safe');
let normalizer: DataNormalizer;
let dataProvider: IDataProvider;
let kmeansClusterization: Kmeans;
let counterPropagationNetwork: CounterPropagationNetwork;
let metric = new EuclideanSquareMetric();

let [inputConfig, outputConfig] = [Config.INPUT_DATA_CONF, Config.OUTPUT_DATA_CONF];

switch (inputConfig.dataType) {
  case DataType.GENERATE:
    dataProvider = new TestDataProvider();
    break;
  case DataType.IRIS:
    dataProvider = new IrisDataProvider();
    break;
  case DataType.STARS:
    dataProvider = new StarsDataProvider();
    break;
  default:
    dataProvider = new TestDataProvider();
}
dataProvider.initialize();

if (outputConfig.showClusters) {
  View.init(dataProvider.data, onAction);
}

function onAction(ev: any, callback: Function = ()=>{}) {
  let actions = {
    kmeans,
    cpn,
    cpn_centroids
  };
  if (ev && ev.type in actions) {
    actions[ev.type](ev.data, callback);
  }
}

function kmeans(params, callback) {
  if (!kmeansClusterization || params.revoke) {
    kmeansClusterization = new Kmeans(
      params.points,
      dataProvider.getInput().map(elem => { return { coords: elem } }),
      metric,
      Config.KMEANS_CONF.maxIterations
    );
  }
  callback(null, {
    groups: params.immediately ?
      kmeansClusterization.run() : kmeansClusterization.runOnce(),
    stopped: kmeansClusterization.curIteration >= kmeansClusterization.maxIterations
  });
}


/* Counter propagation network */

function cpn(params, callback) {
  callback(null, {
    groups: counterPropagationNetwork.getClusters()
  });
}

function cpn_centroids(params, callback) {
  callback(null, {
    groups: counterPropagationNetwork.getCentroids()
  });
}

let counterPropConfig = Config.COUNTER_PROPAGATION_CONF;
let points = dataProvider.getInput().slice(0, -1);

// initializing
counterPropagationNetwork = new CounterPropagationNetwork(counterPropConfig.kohonenNeurons, Config.CLASSES_CONF.classDimension);
counterPropagationNetwork.initialize();

// data preparing
let dataMixer = new DataMixer();
points = dataMixer.mix(points);

// learning
for (let epoch = 0; epoch < counterPropConfig.maxIterations; ++epoch) {
  counterPropagationNetwork.learn(points);
}

console.log(counterPropagationNetwork.getCentroids());

let a = 1;
























