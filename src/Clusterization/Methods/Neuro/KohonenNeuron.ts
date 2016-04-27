import {IComputable} from "./IComputable";
import {EuclideanMetric, EuclideanSquareMetric} from "../../Metrics/Metrics";

export class KohonenNeuron implements IComputable {

  weights: number[] = [];
  wins: number = 0;

  constructor(public numberOfInputs: number, public neuronIndex: number) {
    //empty
  }
  
  compute(vector: number[]) {
    if (vector.length !== this.weights.length) {
      throw new Error('Lengths are not equal');
    }
    /*let metric = new EuclideanMetric();
    return metric.distance(
      {coords: vector},
      {coords: this.weights}
    );*/
    return this.weights.reduce((sum, weight, i) => {
      return sum + weight * vector[i];
    }, 0);
  }

  initialize() {
    // convex combination method
    for (let i = 0; i < this.numberOfInputs; ++i) {
      this.weights.push(1 / Math.sqrt(this.numberOfInputs));
    }
  }
}