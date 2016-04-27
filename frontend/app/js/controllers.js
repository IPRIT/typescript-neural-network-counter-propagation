'use strict';

/* Controllers */

angular.module('Neuro.controllers', [])
    .controller('PageCtrl', ['$scope', function($scope) {
        console.log(1);
    }])

    .controller('AppCtrl', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
        console.log(2);
    }])

    .controller('IndexCtrl', ['$scope', '$rootScope', '$state', function($scope, $rootScope, $state) {
        console.log(3);
    }])

    .controller('CanvasCtrl', ['$scope', 'ApiService', '$timeout', '$rootScope', function ($scope, ApiService, $timeout, $rootScope) {
        console.log('Works');
        $scope.clusters = [];
        $scope.points = [];
        $scope.clickedPoints = [];
        $scope.centroids = 3;
        $scope.immediately = false;
        $scope.isComputing = false;
        
        ApiService.getClusters().then(function (data) {
            console.log('Clusters:', data);
            $scope.clusters = data;
        });

        ApiService.getPoints().then(function (data) {
            console.log('Points:', data);
            $scope.points = data;
        });
        
        ApiService.getSettings().then(function (data) {
            console.log('Settings:', data);
            $scope.settings = data;
        });

        $scope.$watchCollection('clickedPoints', function (curr, prev) {
            if (curr.length >= $scope.centroids) {
                $timeout(function () {
                    $rootScope.$broadcast('kmeans start');
                }, 1000);
            }
        });

        $scope.changeCentroids = function (centroids) {
            $scope.centroids = centroids;
        }
    }])
;