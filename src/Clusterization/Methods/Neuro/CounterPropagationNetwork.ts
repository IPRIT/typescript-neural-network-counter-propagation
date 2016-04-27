import {IComputable} from "./IComputable";
import {KohonenLayer} from "./KohonenLayer";
import {GrossbergLayer} from "./GrossbergLayer";

export class CounterPropagationNetwork implements IComputable {

  kohonenLayer: KohonenLayer;
  grossbergLayer: GrossbergLayer;

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
    let normalized = this.normalize(inputs);
    this.kohonenLayer.neurons.forEach(n => n.wins = 0);
    this.kohonenLayer.threshold = Math.floor(inputs.length / this.kohonenLayer.neurons.length);
    
    normalized.forEach((xi, inputIndex) => {
      let kohonenOutput = this.kohonenLayer.compute(xi, true, this.learningRate);
      let winnerIndex = this.kohonenLayer.lastWinnerIndex;

      this.kohonenLayer.learn(xi, winnerIndex, this.alpha);
      this.grossbergLayer.learn(kohonenOutput, xi, this.beta, inputs[inputIndex]);
    });

    let alphaVelocity = 0.001;
    let minAlpha = 0.1;
    this.alpha = Math.max(minAlpha, this.alpha - alphaVelocity);

    let learningVelocity = 0.001;
    this.learningRate = Math.min(this.learningRate + learningVelocity, 1);

    let minBeta = 0.01;
    let betaVelocity = 0.001;
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
}