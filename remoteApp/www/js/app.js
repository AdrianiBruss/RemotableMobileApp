(function () {
    'use strict';

    var app = angular.module('remoteApp', ['ionic', 'controllers', 'services', 'directives', 'ngCordova']);

    app.run(function ($ionicPlatform, sitesFactory) {
        $ionicPlatform.ready(function () {
            // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
            // for form inputs)
            if (window.cordova && window.cordova.plugins.Keyboard) {
                cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
            }
            if (window.StatusBar) {
                StatusBar.styleDefault();
            }
        });

    });

    app.config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/');

        $stateProvider
            .state('home', {
                url: '/',
                templateUrl: 'templates/home.html'
            })
            .state('site', {
                url: '/site',
                abstract: true,
                templateUrl: 'templates/siteMenu.html'
            })
            .state('site.menu', {
                url: "/single",
                views: {
                    'menuContent' :{
                        templateUrl: "templates/siteContent.html"
                    }
                }
            })
            .state('addSite', {
                url: '/addSite',
                templateUrl: 'templates/addSite.html'
            })
    });

})();



