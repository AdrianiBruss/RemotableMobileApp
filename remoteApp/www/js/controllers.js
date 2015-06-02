(function () {
    'use strict';

    /**
     * Controllers
     */

    var app = angular.module('controllers', []);

    /**
     * MainController for Home Page and AddSite Page
     */
    app.controller('mainCtrl', ['$state', 'sitesFactory', 'socketService', function ($state, sitesFactory, socketService) {

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


        // ------------------------------------------------------
        // AddSite Page

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
                //self.res.url = form.url.$modelValue;
                self.res.key = form.key.$modelValue;

                // AddSite
                sitesFactory.addSite(self.res);

            } else {

                self.errorMessage = true;

            }

        };


        // Ecoute la reponse de la connexion du mobile ( nouveau site ou reconnexion )
        socketService.on('mobileConnectedForMobile', function(data){

            if (data == 'MobileReConnected'){

                console.log('Reconnexion');

            }else {

                console.log('Nouveau site Ajouté : '+ data);

                //ajouter le site dans le localStorage
                sitesFactory.addToLocal(data);

                setTimeout(function(){

                    console.log('on peut changer de page');

                }, 2000);

                //$state.go('site');

            }

        });


    }]);


    /**
     * Controller for main site page
     */
    app.controller('siteCtrl', ['$state', 'actionsService', 'socketService', function ($state, actionsService, socketService) {

        this.backToHome = function () {
            $state.go('home');
        };

        // -------------------------------------------------
        var self = this;

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


