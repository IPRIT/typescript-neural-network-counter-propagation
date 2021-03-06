import {IComputable} from "./IComputable";
import {KohonenNeuron} from "./KohonenNeuron";
import {COUNTER_PROPAGATION_CONF} from "../../../config";

export class KohonenLayer implements IComputable {

  neurons: KohonenNeuron[] = [];
  lastWinnerIndex: number;
  threshold: number = 1e9;
  
  constructor(public numberOfInputs: number, public numberOfNeurons: number) {
    for (let i = 0; i < numberOfNeurons; ++i) {
      this.neurons.push(new KohonenNeuron(numberOfInputs, i));
    }
  }

  compute(vector: number[], transformToConvex: boolean, learningRate: number = 0.1) {
    if (transformToConvex) {
      vector = this.convexTransform(vector, learningRate);
    }
    var net = this.neurons.map((neuron, i) => {
      return neuron.compute(vector);
    });
    let winnerIndex = 0, winnerValue = 1e9;
    let conf = COUNTER_PROPAGATION_CONF;
    if (conf.metric === 0) {
      winnerValue = -1e9;
    } else {
      winnerValue = 1e9;
    }
    net.forEach((value, i) => {
      // чувство справедливости
      let condition = conf.metric > 0 ? winnerValue > value : winnerValue < value;
      if (condition /*&& this.neurons[i].wins < this.threshold*/) {
        winnerIndex = i;
        winnerValue = value;
      }
    });
    this.lastWinnerIndex = winnerIndex;

    /*
    todo(): remove after that
     */
    this.neurons[winnerIndex].wins++;
    
    return Array
      .apply(null, Array(net.length))
      .map(Number.prototype.valueOf, 0)
      .map((scalar, scalarIndex) => {
        return +(scalarIndex === winnerIndex);
      });
  }

  learn(x: number[], neuronIndex: number, alpha: number) {
    let diffs = this.neurons[neuronIndex].weights.map((weight, i) => {
      return alpha * (x[i] - weight);
    });
    this.neurons[neuronIndex].weights = this.neurons[neuronIndex].weights.map((weight, i) => {
      return weight + diffs[i];
    });
  }

  initialize() {
    this.neurons.forEach(neuron => neuron.initialize());
  }

  private convexTransform(xi: number[], learningRate: number) {
    //todo(): to be or not to be
    if (COUNTER_PROPAGATION_CONF.initPassOrigin) {
      return xi;
    }
    let offset = (1 - learningRate) / Math.sqrt(xi.length);
    return xi.map((x, i) => learningRate * x + offset);
  }
}