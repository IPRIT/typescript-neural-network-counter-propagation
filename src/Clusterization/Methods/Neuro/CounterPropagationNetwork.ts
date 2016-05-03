import {IComputable} from "./IComputable";
import {KohonenLayer} from "./KohonenLayer";
import {GrossbergLayer} from "./GrossbergLayer";
import {IMetricStrategy, EuclideanMetric, EuclideanSquareMetric} from "../../Metrics/Metrics";
import {IPoint} from "../../Clasterization";
import {COUNTER_PROPAGATION_CONF} from "../../../config";
import {RsIndex} from "../../Check/RsIndex";

export class CounterPropagationNetwork implements IComputable {

  kohonenLayer: KohonenLayer;
  grossbergLayer: GrossbergLayer;
  inputs: number[][];

  learningRate: number = 0.1; // используется для инициализации весов нейронов слоя Кохонена
  alpha: number = 0.7; // скорость обучения слоя Кохонена (каждого нейрона слоя Кохонена)
  beta: number = 0.1;

  constructor(public kohonenNumberOfNeurons: number, public dimension: number) {
    this.kohonenLayer = new KohonenLayer(dimension, kohonenNumberOfNeurons);
    this.grossbergLayer = new GrossbergLayer(kohonenNumberOfNeurons, dimension);
  }

  compute(xi: number[]) {
    let kohonenOutput = this.kohonenLayer.compute(xi, true, this.learningRate);
    return this.grossbergLayer.compute(kohonenOutput);
  }

  learn(inputs: number[][]) {
    this.inputs = inputs;
    let normalized = this.normalize(inputs);
    this.kohonenLayer.neurons.forEach(n => n.wins = 0);
    this.kohonenLayer.threshold = Math.floor(inputs.length / this.kohonenLayer.neurons.length);
    
    normalized.forEach((xi, inputIndex) => {
      let kohonenOutput = this.kohonenLayer.compute(xi, true, this.learningRate);
      let winnerIndex = this.kohonenLayer.lastWinnerIndex;

      this.kohonenLayer.learn(xi, winnerIndex, this.alpha);
      this.grossbergLayer.learn(kohonenOutput, xi, this.beta, inputs[inputIndex]);
    });

    let conf = COUNTER_PROPAGATION_CONF;
    let alphaVelocity = conf.alpha.velocity;
    let minAlpha = conf.alpha.min;
    this.alpha = Math.max(minAlpha, this.alpha - alphaVelocity);

    let learningVelocity = conf.learningRateVelocity;
    this.learningRate = Math.min(this.learningRate + learningVelocity, 1);

    let minBeta = conf.beta.min;
    let betaVelocity = conf.beta.velocity;
    this.beta = Math.max(minBeta, this.beta - betaVelocity);
  }

  initialize() {
    this.kohonenLayer.initialize();
    this.grossbergLayer.initialize();
  }

  normalize(inputs: number[][]) {
    function hypot(...xi) {
      return Math.sqrt(
        xi.reduce((sum, x, i) => {
          return sum + x * x;
        }, 0)
      );
    }
    return inputs.map((xi, inputIndex) => {
      return xi.map((x, i) => {
        return x / hypot(...xi);
      });
    });
  }

  getCentroids(): IPoint[] {
    let container = [];
    for (let i = 0; i < this.kohonenLayer.neurons.length; ++i) {
      let arr = [];
      for (let j = 0; j < this.grossbergLayer.neurons.length; ++j) {
        arr.push(this.grossbergLayer.neurons[j].weights[i]);
      }
      container.push(arr);
    }
    return container.map(point => {
      return {
        coords: point
      }
    });
  }

  getClusters() {
    let points = this.inputs.map(point => {
      return {
        coords: point
      }
    });
    let centroids = this.getCentroids();
    let metric = new EuclideanSquareMetric();
    let clusters = this.getClosestGroups(centroids, points, metric);
    let rsIndex = new RsIndex(clusters.map((group, groupIndex) => {
      return {
        points: group.group
      }
    }), metric);
    console.log(`Rs index:`, rsIndex.compute());
    return clusters;
  }

  private getClosestCentroid(point: IPoint, centroids: IPoint[], metric: IMetricStrategy): IPoint {
    let dists = centroids.map((centroid, centroidIndex) => {
      return {
        centroid,
        distance: metric.distance(centroid, point)
      };
    });

    let minIndex = dists.reduce((prevMemIndex, dist, distIndex) => {
      if (prevMemIndex === -1) return 0;
      return dists[prevMemIndex].distance > dist.distance ?
        distIndex : prevMemIndex;
    }, -1);

    return dists[minIndex].centroid;
  }

  private getClosestGroups(centroids: IPoint[], points: IPoint[], metric: IMetricStrategy) {
    let groupsMap = {};
    centroids.forEach((x, i) => {
      groupsMap['c' + i] = [];
    });
    points.forEach((point, pointIndex) => {
      let centroid = this.getClosestCentroid(point, centroids, metric);
      groupsMap['c' + centroids.indexOf(centroid)].push( point );
    });
    return centroids.map((centroid, i) => {
      return {
        centroid,
        group: groupsMap['c' + i]
      };
    });
  }
}