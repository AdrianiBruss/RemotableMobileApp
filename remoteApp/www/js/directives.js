(function () {
    'use strict';

    var app = angular.module('directives', ['angularLoad']);

    app.directive('sidebar', ['angularLoad', function (angularLoad) {

        return {

            restrict: 'A',
            link: function (attr, scope, element) {
                angularLoad.loadScript('vendors/sidebarEffects.js').then(function () {
                }).catch(function () {
                    console.log('not loaded');
                    // There was some error loading the script. Meh
                });

            }

        }

    }]);

    app.directive('inputColor', [function () {

        return {

            restrict: 'A',
            link: function (scope, element, attr) {


                element.on('click', function () {

                    scope.$apply(scope.$parent.$parent.a.keyColor.push(scope.s));


                });

            }

        }

    }]);

})();



