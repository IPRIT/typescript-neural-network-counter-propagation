import {IMetricStrategy} from "./../Metrics/Metrics";
import {IPoint, IClasterizationMethod, ClasterizationType} from "./../Clasterization";

export class Kmeans implements IClasterizationMethod {

  type: ClasterizationType = ClasterizationType.Kmeans;
  curIteration: number = 0;
  centroidsMoves: Array<any> = [];

  constructor(
    public centroids: IPoint[],
    public points: IPoint[],
    public metric: IMetricStrategy,
    public maxIterations: number = 100
  ) {
    //super(this.type);
  }

  run(iterations: number = this.maxIterations)  {
    while (iterations--) {
      if (iterations === 1) {
        return this.runOnce();
      }
      this.runOnce();
    }
  }

  runOnce() {
    this.curIteration++;
    let groups = this.getClosestGroups();
    if (!this.centroidsMoves.length) {
      this.centroidsMoves = this.centroids.map(x => [x]);
    } else {
      this.centroids.forEach((x, i) => this.centroidsMoves[i].push(x));
    }
    this.centroids = this.centroids.map((centroid, centroidIndex) => {
      return this.getMassCenter(groups[centroidIndex]);
    });
    return groups.map((group, groupIndex) => {
      return {
        centroid: this.centroids[groupIndex],
        group: group.group,
        allMoves: this.centroidsMoves[groupIndex]
      }
    });
  }

  private getClosestGroups() {
    let groupsMap = {};
    this.centroids.forEach((x, i) => {
      groupsMap['c' + i] = [];
    });
    this.points.forEach((point, pointIndex) => {
      let centroid = this.getClosestCentroid(point);
      groupsMap['c' + this.centroids.indexOf(centroid)].push( point );
    });
    return this.centroids.map((centroid, i) => {
      return {
        centroid,
        group: groupsMap['c' + i]
      };
    });
  }

  private getClosestCentroid(point: IPoint): IPoint {
    let dists = this.centroids.map((centroid, centroidIndex) => {
      return {
        centroid,
        distance: this.metric.distance(centroid, point)
      };
    });

    let minIndex = dists.reduce((prevMemIndex, dist, distIndex) => {
      if (prevMemIndex === -1) return 0;
      return dists[prevMemIndex].distance > dist.distance ?
        distIndex : prevMemIndex;
    }, -1);

    return <any>dists[minIndex].centroid;
  }

  private getMassCenter(group): IPoint {
    if (!group) {
      throw new Error('A group does not exist');
    }
    let centroid = group.centroid;
    let points = group.group;
    if (!points.length) {
      return group.centroid;
    }
    let dimension = points[0].coords.length;
    let massCenter = {
      coords: []
    };
    for (var i = 0; i < dimension; ++i) {
      let coordAvg = points.reduce((sum, point) => {
        return sum + point.coords[i];
      }, 0) / points.length;
      massCenter.coords.push(coordAvg);
    }
    return massCenter;
  }
}