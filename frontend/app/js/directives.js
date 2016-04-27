'use strict';

/* Directives */

angular.module('Neuro.directives', [])

    .directive('pointsView', function ($timeout, $interval, ApiService) {
        return {
            restrict: 'E',
            scope: true,
            templateUrl: templateUrl('clusters', 'index'),
            controller: 'CanvasCtrl',
            link: function (scope, element, attrs) {
                $timeout(function () {
                    render();
                }, 800);

                var canvas = element.find('canvas').get(0);
                if (!canvas) {
                    return;
                }
                canvas.width = element[0].parentNode.offsetWidth;
                canvas.height = element[0].parentNode.offsetHeight;

                var ctx = canvas.getContext('2d');
                ctx.shadowColor = 'rgba(0,0,0,0.4)';
                ctx.shadowBlur = 5;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 1;

                function render() {
                    var points = scope.points,
                        settings = scope.settings.CLASSES_CONF;
                    drawPoints(points, settings);
                }

                function drawPoints(points, settings) {
                    var borders = {
                        min: settings.minBoundary - settings.minDistanceBetween,
                        max: settings.maxBoundary + settings.minDistanceBetween
                    };
                    ctx.strokeStyle = "#222";
                    ctx.beginPath();
                    ctx.moveTo(borders.min, borders.min);
                    ctx.lineTo(borders.min, borders.max);
                    ctx.moveTo(borders.min, borders.max);
                    ctx.lineTo(borders.max, borders.max);
                    ctx.moveTo(borders.max, borders.max);
                    ctx.lineTo(borders.max, borders.min);
                    ctx.moveTo(borders.max, borders.min);
                    ctx.lineTo(borders.min, borders.min);
                    ctx.stroke();

                    var rndWithSeed = new Math.seedrandom(12);
                    var r = Math.ceil(rndWithSeed() * 255);
                    var g = Math.ceil(rndWithSeed() * 255);
                    var b = Math.ceil(rndWithSeed() * 255);
                    var alpha = rndWithSeed();
                    alpha = alpha < 0.5 ? alpha + 0.5 : alpha;

                    points.forEach(function (point, clusterIndex) {

                        ctx.strokeStyle = "rgba(" + r + ", " + g + ", " + b + "," + alpha + ")";
                        ctx.shadowColor = "rgba(0,0,0,0.4)";
                        ctx.shadowOffsetX = 0;
                        ctx.shadowOffsetY = 1;
                        ctx.shadowBlur = 5;
                        ctx.fillStyle = "rgba(" + r + ", " + g + ", " + b + "," + Math.max(alpha - 0.2, 0.4) + ")";

                        var x = point.coords[0],
                            y = point.coords[1];
                        ctx.beginPath();
                        ctx.arc(x, y, 3, -2 * Math.PI, 2 * Math.PI, true);
                        ctx.fill();
                        ctx.save();
                        ctx.restore();
                    });
                }

                function drawClickedPoints(points) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    render();

                    ctx.shadowColor = "rgba(0,0,0,0.5)";
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 2;
                    ctx.shadowBlur = 5;
                    var pointRadius = 5;

                    points.forEach(function (point, index) {
                        var rndWithSeed = new Math.seedrandom(index + 'a');
                        var r = Math.ceil(rndWithSeed() * 255);
                        var g = Math.ceil(rndWithSeed() * 255);
                        var b = Math.ceil(rndWithSeed() * 255);
                        var alpha = rndWithSeed();
                        alpha = alpha < 0.5 ? alpha + 0.5 : alpha;
                        ctx.fillStyle = "rgba(" + r + ", " + g + ", " + b + "," + alpha + ")";

                        ctx.beginPath();
                        ctx.arc(point.coords[0] - pointRadius/2, point.coords[1] - pointRadius/2, pointRadius, -2 * Math.PI, 2 * Math.PI, true);
                        ctx.fill();
                    });
                }

                var canvasWithWrap = element.find('canvas');
                var updateInterval;

                window.addEventListener('resize', render);
                canvasWithWrap.on('click', function (ev) {
                    if (scope.isComputing) {
                        return;
                    }
                    scope.clickedPoints.push({coords: [ ev.offsetX, ev.offsetY ]});
                    scope.$apply();
                    drawClickedPoints(scope.clickedPoints);
                });

                scope.$on('kmeans start', function (ev, args) {
                    kmeansStart(true);
                });

                function kmeansStart(firstInvoke) {
                    firstInvoke = firstInvoke || false;
                    console.log('kmeans started');
                    scope.isComputing = true;
                    ApiService.computeKmeans({
                        points: scope.clickedPoints,
                        immediately: scope.immediately,
                        revoke: firstInvoke
                    }).then(function (response) {
                        console.log(response);
                        var groups = response.result.groups;
                        drawGroups(groups, scope.settings.CLASSES_CONF);
                        drawClickedPointsAfter(groups.map(function (group) {
                            return group.centroid;
                        }));
                        if (!response.result.stopped) {
                            $timeout(function () {
                                kmeansStart();
                            }, 0);
                        }
                    }).catch(function () {
                        scope.isComputing = false;
                    });
                }

                function drawGroups(groups, settings) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    var borders = {
                        min: settings.minBoundary - settings.minDistanceBetween,
                        max: settings.maxBoundary + settings.minDistanceBetween
                    };
                    ctx.strokeStyle = "#222";
                    ctx.shadowBlur = 0;
                    ctx.beginPath();
                    ctx.moveTo(borders.min, borders.min);
                    ctx.lineTo(borders.min, borders.max);
                    ctx.moveTo(borders.min, borders.max);
                    ctx.lineTo(borders.max, borders.max);
                    ctx.moveTo(borders.max, borders.max);
                    ctx.lineTo(borders.max, borders.min);
                    ctx.moveTo(borders.max, borders.min);
                    ctx.lineTo(borders.min, borders.min);
                    ctx.stroke();

                    ctx.shadowColor = "rgba(0,0,0,0.5)";
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 1;
                    ctx.shadowBlur = 5;
                    var pointRadius = 3;

                    groups.forEach((cluster, index) => {
                        var points = cluster.group;
                        var moves = cluster.allMoves;
                        var rndWithSeed = new Math.seedrandom(index + 'a');
                        var r = Math.ceil(rndWithSeed() * 255);
                        var g = Math.ceil(rndWithSeed() * 255);
                        var b = Math.ceil(rndWithSeed() * 255);
                        var alpha = rndWithSeed();
                        alpha = alpha < 0.5 ? alpha + 0.5 : alpha;
                        ctx.shadowBlur = 5;
                        ctx.fillStyle = "rgba(" + r + ", " + g + ", " + b + "," + alpha + ")";

                        points.forEach(function (point, index) {
                            ctx.beginPath();
                            ctx.arc(point.coords[0] - pointRadius/2, point.coords[1] - pointRadius/2, pointRadius, -2 * Math.PI, 2 * Math.PI, true);
                            ctx.fill();
                        });

                        if (moves.length >= 2) {
                            ctx.strokeStyle = "rgba(0,0,0,0.45)";
                            ctx.shadowColor = "rgba(" + r + ", " + g + ", " + b + "," + 1 + ")";
                            ctx.shadowOffsetX = 0;
                            ctx.shadowOffsetY = 1;
                            ctx.shadowBlur = 15;
                            ctx.lineWidth = 5;
                            ctx.beginPath();
                            ctx.moveTo(moves[0].coords[0], moves[0].coords[1]);
                            moves.forEach(function (move, moveIndex) {
                                if (!moveIndex) return;
                                ctx.lineTo(move.coords[0], move.coords[1]);
                            });
                            ctx.stroke();
                        }
                    });
                }

                function drawClickedPointsAfter(points) {
                    ctx.shadowColor = "rgba(255,0,0,1)";
                    ctx.shadowOffsetX = 0;
                    ctx.shadowOffsetY = 0;
                    ctx.shadowBlur = 10;
                    var pointRadius = 5;

                    points.forEach(function (point, index) {
                        var rndWithSeed = new Math.seedrandom(index + 'a');
                        var r = Math.ceil(rndWithSeed() * 255);
                        var g = Math.ceil(rndWithSeed() * 255);
                        var b = Math.ceil(rndWithSeed() * 255);
                        var alpha = 1;
                        ctx.shadowColor = "rgba(" + r + ", " + g + ", " + b + "," + alpha + ")";

                        pointRadius = 8;
                        ctx.fillStyle = "#222";
                        ctx.beginPath();
                        ctx.arc(point.coords[0] - pointRadius/2 + 1.5, point.coords[1] - pointRadius/2 + 1.5, pointRadius, -2 * Math.PI, 2 * Math.PI, true);
                        ctx.fill();

                        pointRadius = 5;
                        ctx.fillStyle = "rgba(" + r + ", " + g + ", " + b + "," + alpha + ")";

                        ctx.beginPath();
                        ctx.arc(point.coords[0] - pointRadius/2, point.coords[1] - pointRadius/2, pointRadius, -2 * Math.PI, 2 * Math.PI, true);
                        ctx.fill();
                    });
                }
            }
        }
    })
;