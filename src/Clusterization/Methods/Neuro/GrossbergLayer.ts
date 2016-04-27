import {IComputable} from "./IComputable";
import {GrossbergNeuron} from "./GrossbergNeuron";

export class GrossbergLayer implements IComputable {

  neurons: GrossbergNeuron[] = [];
  lastOutput: number[];

  constructor(public numberOfInputs: number, public numberOfNeurons: number) {
    for (let i = 0; i < numberOfNeurons; ++i) {
      this.neurons.push(new GrossbergNeuron(numberOfInputs, i));
    }
  }

  compute(k: number[]) {
    return (this.lastOutput = this.neurons.map((neuron, i) => {
      return neuron.compute(k);
    }));
  }

  learn(k: number[], x: number[], beta: number, wishedOutput: number[]) {
    let output = this.compute(k);
    // output.length equals to x.length
    let winnerIndex = k.reduce((prev, val, i) => {
      return val === 1 ? i : prev;
    }, 0);
    this.neurons.forEach((neuron, i) => {
      //todo(): if some errors try to use this.weights[winnerIndex] instead of output[i]
      neuron.weights[winnerIndex] += beta * (wishedOutput[i] - output[i]) * k[winnerIndex]; // k[winnerIndex] is 1
    });
  }

  initialize() {
    this.neurons.forEach(neuron => neuron.initialize());
  }
}