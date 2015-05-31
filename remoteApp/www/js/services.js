(function () {
    'use strict';

    /**
     * Services
     */
    var app = angular.module('services', []);

    app.factory('sitesFactory', ['$rootScope', '$q', 'socketService', function ($rootScope, $q, socketService) {

        // --------------------------------------------------
        var hash;

        var local = getLocal();
        var websites = [];
        //websites = JSON.parse(local);
        // --------------------------------------------------

        function getSites() {

            return websites = JSON.parse(getLocal());
        }

        function addSite(res) {

            // encrypte la clé en sha512
            hash = CryptoJS.SHA512(res.key).toString();

            // connexion au serveur
            return connectionToSite(res.url, hash, 'add');


        }

        function connectSite(site) {

            // reconnexion au serveur
            connectionToSite(site.name, site.hash, 'reco');

        }

        function saveSite(sites, url, hash) {

            var site = {};
            site.name = url;
            site.url = document.URL;
            site.hash = hash.toString();
            sites.push(site);

            return sites;

        }

        function getLocal() {
            return localStorage.getItem('remotableSitesMobile');
        }

        function setLocal(sites, url, hash) {
            localStorage.setItem('remotableSitesMobile', JSON.stringify(saveSite(sites, url, hash)));

        }

        function connectionToSite(url, hash, action) {



            socketService.init(url);

            socketService.emit('mobileCo', hash, function (data) {

                console.log(data);
                if (data == 'mobileConnection') {

                    if (action == 'add') {

                        console.log('website added and connected');

                        //stocke dans le localStorage le site
                        if (local == null) {
                            console.log('saving to new local .. ');
                            var sites = [];
                            setLocal(sites, url, hash);
                            getSites();

                        } else {

                            console.log('updating local .. ');
                            setLocal(websites, url, hash);
                            getSites();

                        }


                    } else {

                        console.log('reconnection');

                    }

                }

            });

        }


        return {

            getSites: function () {
                return getSites();
            },
            addSite: function (res) {
                return addSite(res);
            },
            connectSite: function (site) {
                return connectSite(site);
            }



        }

    }]);

    app.service('actionsService', ['$q','socketService', function ($q, socketService) {


        function swipeDirection(dir) {

            switch (dir) {
                case 'up':
                    socketService.emit('swipeMobile', 'up');
                    break;
                case 'down':
                    socketService.emit('swipeMobile', 'down');
                    break;
                case 'left':
                    socketService.emit('swipeMobile', 'prev');
                    break;
                case 'right':
                    socketService.emit('swipeMobile', 'next');
                    break;


            }

        }

        return {
            swipeDirection: function (dir) {
                return swipeDirection(dir);
            }
        }

    }]);


    app.service('socketService', ['$rootScope', function ($rootScope) {
        //var socket = io.connect();
        var socket;

        return {
            init: function (url) {
                socket = io('ws://' + url + '');
            },
            on: function (eventName, callback) {
                console.log(eventName);
                socket.on(eventName, function () {

                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {
                socket.emit(eventName, data, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });

                })

            }

        };

    }]);

})();