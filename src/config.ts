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
  dataType: 2 //0 - generate, 1 - Iris flower data set, 2 - Stars
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
  kohonenNeurons: 6,
  maxIterations: 1000,
  metric: 1, // 0 - scalar, 1 - euclidean, 2 - euclidean squared
  initPassOrigin: false,
  alpha: { /* значение alpha регулирует скорость изменения векторов слоя Кохонена. Начальное значение обычно берут 0.7 */
    min: 0.001,
    velocity: 0.01
  },
  beta: { /* значение beta регулирует скорость обучения слоя Гроссберга. Скорость изменения векторов слоя. Начальн. ~0.1 */
    min: 0.0001,
    velocity: 0.01
  },
  /* Необходимо для метода выпуклой комбинации - постепенно возрастает до 1 */
  /* Используется для постепенного расширения кластеров */
  learningRateVelocity: 0.01
};
