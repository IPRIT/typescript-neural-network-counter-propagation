export const CLASSES_CONF = {
  classNumber: 5,
  classDimension: 2,
  classPointsNumber: 50,
  minDistanceBetween: 100,
  radiusCompress: 2, // >= 2
  cross: false,
  minBoundary: 110,
  maxBoundary: 700
};

export const INPUT_DATA_CONF = {
  dataType: 0 //0 - generate, 1 - Iris flower data set
};

export const OUTPUT_DATA_CONF = {
  showClusters: true,
  consoleOutput: true
};

export const KMEANS_CONF = {
  centroids: 5,
  maxIterations: 100
};

export const COUNTER_PROPAGATION_CONF = {
  kohonenNeurons: 5,
  maxIterations: 5000
};