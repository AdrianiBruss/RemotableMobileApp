(function () {
    'use strict';

    /**
     * Controllers
     */

    var app = angular.module('controllers', []);

    app.controller('sitesListCtrl', ['$state', 'sitesFactory', function ($state, sitesFactory) {

        var self = this;
        var promise = sitesFactory.getSites();
        promise.then(function (data) {
            self.sites = data;
        });

        //this.sites = sitesFactory.getSites();

        this.openSite = function (site) {

            sitesFactory.connectSite(site);
            $state.go('site');
        }

    }]);

    app.controller('addSiteCtrl', ['$scope', 'sitesFactory', '$ionicPopup', function ($scope, sitesFactory, $ionicPopup) {

        // Triggered on a button click, or some other target
        this.showAddSites = function () {
            $scope.site = {};

            // An elaborate, custom popup
            var addSitePopup = $ionicPopup.show({
                templateUrl: 'templates/addSite.html',
                title: 'Ajouter un site web',
                //subTitle: 'Please use normal things',
                scope: $scope,
                buttons: [
                    {text: 'Cancel'},
                    {
                        text: 'Add',
                        type: 'button-positive',
                        onTap: function (e) {
                            return $scope.site;
                        }
                    }
                ]
            });
            addSitePopup.then(function (res) {
                console.log('Tapped!', res);
                //Envoyer les infos au service qui ajoute un site
                sitesFactory.addSite(res);
            });

        };


    }]);

    app.controller('siteCtrl', ['$state', 'actionsService', function ($state, actionsService) {

        this.backToHome = function(){
            $state.go('home');
        };

        this.menu = "";

        //var self = this;
        //var promise = sitesFactory.getMenu();
        //promise.then(function (data) {
        //    self.menu = data;
        //});

        this.swipeUp = function(){
            console.log('swipe up');
            actionsService.swipeDirection('up');
        };
        this.swipeDown = function(){
            console.log('swipe down');
            actionsService.swipeDirection('down');
        };

    }]);

})();


