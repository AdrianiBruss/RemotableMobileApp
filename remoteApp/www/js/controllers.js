(function () {
    'use strict';

    /**
     * Controllers
     */

    var app = angular.module('controllers', []);

    /**
     * MainController for Home Page and AddSite Page
     */
    app.controller('homeCtrl', ['$state', 'sitesFactory', 'socketService', function ($state, sitesFactory, socketService) {

        // ------------------------------------------------------
        // Home Page
        var self = this;

        // Socket initialisation
        socketService.init();

        // Récupération des sites dans le localStorage
        this.sites = sitesFactory.getSites();


        // Ouverture d'un site
        this.openSite = function (site) {
            sitesFactory.connectSite(site);
            sitesFactory.setCurrentSite(site);
            $state.go('site.menu');
        };

        // Suppression d'un site
        this.deleteSite = function (site) {

            socketService.emit('deleteMobile', site, function (data) {

                console.log(data);

                var deleteSitePromise = sitesFactory.deleteFromLocal(site);
                deleteSitePromise.then(function (result) {

                    self.sites = result;

                })

            })
        };

        // Ajout d'un site
        this.addSitesButton = function () {
            $state.go('addSite');
        };


        // Ecoute la reponse de la connexion du mobile ( nouveau site ou reconnexion )
        socketService.on('mobileConnectedForMobile', function (data) {

            if (data == 'MobileReConnected') {

                console.log(data);
                //sitesFactory.setCurrentSite(data);

            } else {

                var addSitePromise = sitesFactory.addToLocal(data);
                addSitePromise.then(function (result) {

                    self.sites = result;

                    console.log(self.sites);

                    //ajouter au service le site courant
                    sitesFactory.setCurrentSite(data);


                    $state.go('site.menu');

                });


            }

        });


    }]);


    /**
     * Controller for main site page
     */
    app.controller('siteCtrl', ['$scope', '$state', '$ionicSideMenuDelegate', 'actionsService', 'socketService', 'sitesFactory',
        function ($scope, $state, $ionicSideMenuDelegate, actionsService, socketService, sitesFactory) {

            this.backToHome = function () {
                $state.go('home');
            };

            // -------------------------------------------------
            var self = this;
            this.menu = sitesFactory.getCurrentSite();
            if (this.menu == null) {
                $state.go('home');
            }
            

            // -------------------------------------------------
            this.swipeUp = function () {
                actionsService.swipeDirection('up');

                if (self.gaugeHeight > 0){
                    self.gaugeHeight -= self.ratio;
                }

            };
            this.swipeDown = function () {
                actionsService.swipeDirection('down');

                if (self.gaugeHeight < 100){
                    self.gaugeHeight += self.ratio;
                }
            };

            // -------------------------------------------------
            this.openPage = function (url) {
                socketService.emit('changeLinkMobile', url);
            };

            this.toggleRight = function () {
                $ionicSideMenuDelegate.toggleRight();
            };

            this.gaugeHeight = 0;
            this.windowHeight = 0;
            this.ratio = 0;

            socketService.on('windowHeight', function(data){

                self.ratio = Math.round(1/(self.menu.bodyHeight / data.height) * 100);

            })

        }]);


    /**
     * Controller for addSite Page
     */
    app.controller('addSiteCtrl', ['$state', 'sitesFactory', 'socketService', function ($state, sitesFactory, socketService) {

        // ------------------------------------------------------
        // AddSite Page

        var self = this;

        this.colors = ['6C7A89', 'F2784B', 'F9BF3B', '00B16A', '87D37C', '4B77BE', '2C3E50', 'F64747', 'AEA8D3', '674172'];

        this.keyColor = [];
        this.key = '';

        this.addColor = function (color) {

            if (self.keyColor.length < 4) {
                self.keyColor.push(color);
                self.key += color;
            }
        };

        // Supprime les carrés de couleur
        this.removeColors = function () {

            self.key = '';
            self.keyColor = [];

        };

        this.getColor = function (index) {
            return {
                'backgroundColor': '#' + self.colors[self.keyColor[index]] + ''
            }
        };

        // Revenir sur la home
        this.backToHome = function () {
            $state.go('home');
        };

        // AddSite Form
        this.errorMessage = false;
        this.res = {};

        // AddSite function
        this.addSite = function (form) {

            if (form.$valid) {

                self.errorMessage = false;
                // AddSite
                sitesFactory.addSite(self.key);

                self.key = '';
                self.keyColor = [];

            } else {

                self.errorMessage = true;

            }

        };

    }]);

})();


