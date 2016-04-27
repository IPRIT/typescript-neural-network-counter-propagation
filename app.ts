import {TestDataProvider, IrisDataProvider, IDataProvider, DataType} from "./src/Data/DataProvider";
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
    counterPropagationNetwork
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

let counterPropConfig = Config.COUNTER_PROPAGATION_CONF;
let points = dataProvider.getInput();

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

let container = [];
for (let i = 0; i < counterPropagationNetwork.kohonenLayer.neurons.length; ++i) {
  let arr = [];
  for (let j = 0; j < counterPropagationNetwork.grossbergLayer.neurons.length; ++j) {
    arr.push(counterPropagationNetwork.grossbergLayer.neurons[j].weights[i]);
  }
  container.push(arr);
}
console.log(container);

let a = 1;
























