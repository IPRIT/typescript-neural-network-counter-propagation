/* Services */

angular.module('Neuro.services', [])

    .service('ApiService', ['$http', function($http) {

        function getClusters() {
            return $http.get('/getClusters').then(function (response) {
                return response.data;
            });
        }

        function getPoints() {
            return $http.get('/getPoints').then(function (response) {
                return response.data;
            });
        }

        function getSettings() {
            return $http.get('/getSettings').then(function (response) {
                return response.data;
            });
        }

        function computeKmeans(params) {
            return $http.post('/computeKmeans', params).then(function (response) {
                return response.data;
            });
        }

        return {
            getClusters: getClusters,
            getPoints: getPoints,
            getSettings: getSettings,
            computeKmeans: computeKmeans
        }
    }])
;