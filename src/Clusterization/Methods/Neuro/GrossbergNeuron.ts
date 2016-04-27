import {IComputable} from "./IComputable";

export class GrossbergNeuron implements IComputable {

  weights: number[] = [];

  constructor(public numberOfInputs: number, public neuronIndex: number) {
    // numberOfInputs === kohonenNumberOfNeurons
  }

  compute(ki: number[]) {
    if (ki.length !== this.weights.length) {
      throw new Error('Lengths are not equal');
    }
    return this.weights.reduce((sum, weight, i) => {
      return sum + weight * ki[i];
    }, 0);
  }

  initialize() {
    // convex combination method
    this.weights = [];
    for (let i = 0; i < this.numberOfInputs; ++i) {
      this.weights.push(0);
    }
  }
}