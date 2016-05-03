import {IPoint} from "../Clasterization";
import {IMetricStrategy} from "../Metrics/Metrics";

export interface ICluster {
    points: IPoint[]
}

export class RsIndex {

    constructor(public clusters: ICluster[], public metric: IMetricStrategy) {
    }

    compute(): number {
        return 1 - this.computeSsw() / this.computeSst();
    }

    private computeSst() {
        let distSum = 0;
        let points = this.clusters.reduce((acc, cluster, clusterIndex) => {
            return acc.concat(cluster.points);
        }, []);
        points.forEach((pointOuter, pointIndexOuter) => {
            points.forEach((pointInner, pointIndexInner) => {
                distSum += this.metric.distance(pointOuter, pointInner);
            });
        });
        return distSum;
    }

    private computeSsw() {
        let distSum = 0;

        this.clusters.forEach((clusterOuter, clusterIndexOuter) => {
            let clusterSum = 0;
            clusterOuter.points.forEach((pointOuter, pointIndexOuter) => {
                clusterOuter.points.forEach((pointInner, pointIndexInner) => {
                    clusterSum += this.metric.distance(pointOuter, pointInner);
                });
            });
            distSum += clusterSum;
        });
        return distSum;
    }
}