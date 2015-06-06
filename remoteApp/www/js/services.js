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
        var websites = JSON.parse(local);

        var current_site;

        var promiseAddSite = $q.defer();
        // --------------------------------------------------

        function addSite(res) {

            var data = {};
            // encrypte la clé en sha512
            hash = CryptoJS.SHA512(res).toString();
            data.hash = hash;

            // connexion au serveur
            connectionToSite(data);

        }

        function connectSite(site) {

            var data = {};
            data.hash = site.hash;

            // reconnexion au serveur
            connectionToSite(data);

        }

        function saveSite(sites, hash, menu, url, title) {

            var site = {};
            site.url = url;
            site.menu = menu;
            site.title = title;
            site.hash = hash.toString();

            sites.push(site);

            return sites;

        }

        function getLocal() {
            return localStorage.getItem('remotableSitesMobile');
        }

        function setLocal(sites, hash, menu, url, title) {
            localStorage.setItem('remotableSitesMobile', JSON.stringify(saveSite(sites, hash, menu, url, title)));

            // return addSite promise
            promiseAddSite.resolve(JSON.parse(getLocal()));

        }

        function connectionToSite(hash) {

            //console.log(data.hash);

            socketService.emit('mobileConnection', hash, function (data) {

                console.log(data);

            });

        }

        function addToLocal(data) {

            //stocke dans le localStorage le site
            if (local == null) {
                console.log('saving to localStorage .. ');
                var sites = [];
                setLocal(sites, data.hash, data.menu, data.url, data.title);

            } else {

                console.log('updating localStorage .. ');
                setLocal(websites, data.hash, data.menu, data.url, data.title);

            }

        }

        function setCurrentSite(data) {

            current_site = data;

        }


        return {

            getSites: function () {
                return websites;
            },
            addSite: function (res) {
                return addSite(res);
            },
            connectSite: function (site) {
                return connectSite(site);
            },
            addToLocal: function (data) {
                addToLocal(data);
                return promiseAddSite.promise;
            },
            getCurrentSite: function () {
                return current_site;
            },
            setCurrentSite: function (data) {
                return setCurrentSite(data);
            }


        }

    }]);

    app.service('actionsService', ['$q', 'socketService', function ($q, socketService) {


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

        var socket;

        return {
            init: function () {
                //socket = io('ws://' + url + '');
                //socket = io('ws://192.168.20.253:3303');
                //socket = io('ws://192.168.10.16:3303');
                socket = io('ws://192.168.10.17:3303');
            },
            on: function (eventName, callback) {
                socket.on(eventName, function () {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        callback.apply(socket, args);
                    });
                });
            },
            emit: function (eventName, data, callback) {

                socket.emit(eventName, data, function (res) {
                    var args = arguments;
                    $rootScope.$apply(function () {
                        if (callback) {
                            callback.apply(socket, args);
                        }
                    });

                });

            }

        };

    }]);

})();