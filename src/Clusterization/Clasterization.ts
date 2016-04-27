import {IMetricStrategy} from "./Metrics/Metrics";

export enum ClasterizationType {
  Kmeans
}

export interface IPoint {
  coords: number[]
}

export interface IClasterizationMethod {

  run(): any;
  runOnce(): any;
  type: ClasterizationType
  metric: IMetricStrategy;
}