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
            $state.go('site');
        };

        // Suppression d'un site
        this.deleteSite = function (site) {
            console.log('delete site');
        };

        // Ajout d'un site
        this.addSitesButton = function () {
            $state.go('addSite');
        };


        // Ecoute la reponse de la connexion du mobile ( nouveau site ou reconnexion )
        socketService.on('mobileConnectedForMobile', function (data) {

            if (data == 'MobileReConnected') {

                console.log('Reconnexion');

                //sitesFactory.setCurrentSite(data);

            } else {

                console.log('Nouveau site Ajouté');

                //ajouter le site dans le localStorage
                sitesFactory.addToLocal(data);

                self.sites = sitesFactory.getSites();
                console.log(self.sites);

                //ajouter au service le site courant

                sitesFactory.setCurrentSite(data);

                setTimeout(function () {

                    $state.go('site');

                }, 500);


            }

        });


    }]);


    /**
     * Controller for main site page
     */
    app.controller('siteCtrl', ['$state', 'actionsService', 'socketService', 'sitesFactory', function ($state, actionsService, socketService, sitesFactory) {

        this.backToHome = function () {
            $state.go('home');
        };

        console.log('welcome to the site ');

        // -------------------------------------------------
        var self = this;
        this.menu = sitesFactory.getCurrentSite();
        if (this.menu == null) {
            $state.go('home');
        }

        //console.log(sitesFactory.getCurrentSite());


        // -------------------------------------------------
        this.swipeUp = function () {
            console.log('swipe');
            actionsService.swipeDirection('up');
        };
        this.swipeDown = function () {
            console.log('swipe');
            actionsService.swipeDirection('down');
        };

        // -------------------------------------------------
        this.openPage = function (url) {
            socketService.emit('changeLinkMobile', url);
        }

    }]);


    /**
     * Controller for addSite Page
     */
    app.controller('addSiteCtrl', ['$state', 'sitesFactory', 'socketService', function ($state, sitesFactory, socketService) {

        // ------------------------------------------------------
        // AddSite Page

        var self = this;

        this.colors_1 = ['2C3E50', 'F2784B', 'F9BF3B', '00B16A'];
        this.colors_2 = ['4B77BE', '6C7A89', 'F64747', '87D37C'];

        this.keyColor = [];
        this.key = '';

        this.addColor = function (color) {

            if (self.keyColor.length < 4){
                self.keyColor.push(color);
                self.key += color+'-';

            }

        };

        this.getColor = function (index) {
            return {
                'backgroundColor': '#' + self.keyColor[index] + ''
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
                sitesFactory.addSite(form.key.$modelValue);

            } else {

                self.errorMessage = true;

            }

        };

    }]);

})();


