(function () {
    'use strict';

    /**
     * Controllers
     */

    var app = angular.module('controllers', []);

    app.controller('mainCtrl', ['$state', 'sitesFactory', '$scope', '$ionicPopup', function ($state, sitesFactory, $scope, $ionicPopup) {


        var self = this;

        this.sites = sitesFactory.getSites();

        this.openSite = function (site) {

            sitesFactory.connectSite(site);
            $state.go('site');
        };

        this.deleteSite = function (site) {
            console.log('delete site');
        };

        this.addSitesButton = function () {

            $state.go('addSite');

        };

        this.backToHome = function () {
            $state.go('home');
        };

        // -------------------------------------------------


        this.errorMessage = false;
        this.res = {};
        this.addSite = function (form) {

            console.log(form);

            if (form.$valid) {

                self.errorMessage = false;
                self.res.url = form.url.$modelValue;
                self.res.key = form.key.$modelValue;


                // attendre que le service nous dise si le site est bien connecté ou pas
                var promiseCo = sitesFactory.addSite(self.res);

                promiseCo.then(function (result) {

                    console.log(result);

                    if (result == 'ok') {

                        $state.go('site');

                    }else{

                        self.errorMessage = true;

                    }
                });

            } else {

                self.errorMessage = true;

            }

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
        this.openPage = function (url) {

            console.log(url);
            socketService.emit('changeLinkMobile', url);

        }

    }]);

})();


