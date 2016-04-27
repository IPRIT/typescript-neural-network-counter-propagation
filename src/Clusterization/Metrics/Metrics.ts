import {IPoint} from "../Clasterization";

export interface IMetricStrategy {

  distance(a: IPoint, b: IPoint): number;
}

export class EuclideanMetric implements IMetricStrategy {

  distance(a: IPoint, b: IPoint): number {
    if (a.coords.length !== b.coords.length) {
      throw new Error('Lengths are not equal');
    }
    return Math.sqrt(
      a.coords.reduce((sum, scalar, scalarIndex) => {
        return sum + (scalar - b.coords[scalarIndex]) * (scalar - b.coords[scalarIndex]);
      }, 0)
    );
  }
}

export class EuclideanSquareMetric implements IMetricStrategy {

  distance(a: IPoint, b: IPoint): number {
    if (a.coords.length !== b.coords.length) {
      throw new Error('Lengths are not equal');
    }
    return a.coords.reduce((sum, scalar, scalarIndex) => {
      return sum + (scalar - b.coords[scalarIndex]) * (scalar - b.coords[scalarIndex]);
    }, 0);
  }
}