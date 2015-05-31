(function () {
    'use strict';

    /**
     * Services
     */
    var app = angular.module('services', []);

    app.factory('sitesFactory', ['$q', function ($q) {

        // --------------------------------------------------
        var hash;
        var socket;
        var local = getLocal();
        var websites = JSON.parse(local);
        // --------------------------------------------------

        function addSite(res) {

            // encrypte la clé en sha512
            hash = CryptoJS.SHA512(res.key).toString();

            // connexion au serveur
            connectionToSite(res.url, hash, 'add');


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

            socket = io('ws://' + url + '');
            //var socket = io('ws://192.168.20.253:3303');
            // envoie la clé au serveur

            socket.emit('mobileCo', hash, function (data) {

                console.log(data);

                if (data == 'mobileConnection') {

                    if (action == 'add') {

                        console.log('website added and connected');

                        //stocke dans le localStorage le site
                        if (local == null) {
                            console.log('saving to new local .. ');
                            var sites = [];
                            setLocal(sites, url, hash);

                        } else {
                            console.log('updating local .. ');
                            setLocal(websites, url, hash);

                        }

                    } else {

                        console.log('reconnection');

                    }

                }

            });

        }

        function getSocket(){

            var deffered = $q.defer();
            deffered.resolve(socket);
            return deffered.promise;

        }
        function getMenu(){

            var socketPromise = getSocket();
            socketPromise.then(function(socket){

                socket.on('menuMobile', function(data){
                    console.log(data);
                })

            });


        }


        // --------------------------------------------------
        // Application
        /*$('#wrapper').css('display', 'none');


         // menu
         $('#menu > ul > .menu-item').on('click', function () {

         var link = $(this).attr('data-mobile-menu-item');

         socket.emit('changeLinkMobile', link);

         });*/


        // slider
        //$('#slider')
        //    .on('swiperight', function () {
        //        socket.emit('swipeMobile', 'next');
        //    })
        //    .on('swipeleft', function () {
        //        socket.emit('swipeMobile', 'prev');
        //    })
        //    .on('swipeup', function () {
        //        socket.emit('swipeMobile', 'up');
        //    })
        //    .on('swipedown', function () {
        //        socket.emit('swipeMobile', 'down');
        //    });


        return {

            getSites: function () {
                var deffered = $q.defer();
                deffered.resolve(websites);
                return deffered.promise;
            },
            addSite: function (res) {
                return addSite(res);

            },
            connectSite: function (site) {
                return connectSite(site);
            },
            getMenu: function(){
               return getMenu();
            }

        }

    }]);

})();