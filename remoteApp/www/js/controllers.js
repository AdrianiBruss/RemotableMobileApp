(function () {
    'use strict';

    /**
     * Controllers
     */

    var app = angular.module('controllers', []);

    app.controller('mainCtrl', ['$state', 'sitesFactory', '$scope', '$ionicPopup', function ($state, sitesFactory, $scope, $ionicPopup) {

        this.sites = sitesFactory.getSites();

        this.openSite = function (site) {

            sitesFactory.connectSite(site);
            $state.go('site');
        };

        // -------------------------------------------------

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

    app.controller('siteCtrl', ['$state', 'actionsService', 'socketService', function ($state, actionsService, socketService) {

        this.backToHome = function () {
            $state.go('home');
        };

        // -------------------------------------------------
        var self = this;
        this.menu = {};

        socketService.on('menuMobile', function (data) {
            self.menu = data.menu;
        });

        // -------------------------------------------------
        this.swipeUp = function () {
            actionsService.swipeDirection('up');
        };
        this.swipeDown = function () {
            actionsService.swipeDirection('down');
        };

        // -------------------------------------------------
        this.openPage = function(url){

            console.log(url);
            socketService.emit('changeLinkMobile', url);

        }

    }]);

})();


