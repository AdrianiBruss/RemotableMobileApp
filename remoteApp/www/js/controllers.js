(function () {
    'use strict';

    /**
     * Controllers
     */

    var app = angular.module('controllers', []);

    /**
     * HomeController for Home Page
     */
    app.controller('homeCtrl', ['$state', 'sitesFactory', 'socketService', function ($state, sitesFactory, socketService) {

        // ------------------------------------------------------
        // Home Page

        // Socket initialisation
        socketService.init();


        var self = this;
        this.sites = {};


        // Récupération des sites dans le localStorage
        this.sites = sitesFactory.getSites();

        // Ecoute la reponse de la connexion du mobile ( nouveau site ou reconnexion )
        socketService.on('mobileConnectedForMobile', function (data) {

            console.log(data);

            if (data.status == 'MobileReConnected') {

                console.log('mobile reconnected');

                console.log(data.context);
                sitesFactory.setCurrentSite(data.context);
                $state.go('site.menu');

            } else if (data.status == 'NewConnection') {

                console.log('premiere connexion');

                var addSitePromise = sitesFactory.addToLocal(data.context);
                addSitePromise.then(function (result) {

                    //ajouter au service le site courant
                    console.log(data.context);
                    sitesFactory.setCurrentSite(data.context);

                    self.sites = result;

                    $state.go('site.menu');

                });


            }else{

                sitesFactory.setCurrentSite(data.context);
                $state.go('site.menu');

            }

        });


        // Ouverture d'un site
        this.openSite = function (site) {
            sitesFactory.connectSite(site);
        };

        // Suppression d'un site
        this.deleteSite = function (site) {

            socketService.emit('deleteMobile', site, function (data) {

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

    }]);


    /**
     * Controller for main site page
     */
    app.controller('siteCtrl', ['$scope', '$state', '$ionicSideMenuDelegate', 'actionsService', 'socketService', 'sitesFactory',
        function ($scope, $state, $ionicSideMenuDelegate, actionsService, socketService, sitesFactory) {


            var self = this;

            // -------------------------------------------------
            // Touch event listener
            // -------------------------------------------------


            // -------------------------------------------------
            // back button
            // -------------------------------------------------

            this.backToHome = function () {
                $state.go('home');
            };

            // -------------------------------------------------
            // Sections manager
            // -------------------------------------------------

            this.layout = sitesFactory.getCurrentSite();

            if (this.layout == null) {
                $state.go('home');
            }

            this.gaugeHeight = 0;
            this.nbSections = this.layout.nbSections;
            this.currentSection = 1;
            this.sectionHeight = $(window).height();
            this.ratio = this.sectionHeight / ( this.nbSections -1 ) ;
            this.linksHeight = this.nbSections * this.sectionHeight;
            this.transformLinks = 0;


            // -------------------------------------------------
            this.swipe = function (dir) {

                switch (dir) {
                    case 'up':
                        actionsService.swipeDirection('down');
                        self.changeSection(self.currentSection + 1);
                        break;
                    case 'down':
                        actionsService.swipeDirection('up');
                        self.changeSection(self.currentSection - 1);
                        break;
                    case 'left':
                        actionsService.swipeDirection('left');
                        break;
                    case 'right':
                        actionsService.swipeDirection('right');
                        break;

                }


            };

            // -------------------------------------------------
            this.openPage = function (url) {
                socketService.emit('changeLinkMobile', url);

            };

            // -------------------------------------------------
            this.toggleRight = function () {
                $ionicSideMenuDelegate.toggleRight();

            };

            // -------------------------------------------------
            this.changeSection = function (nextIndex) {

                var diff = Math.abs(nextIndex - self.currentSection);

                if (self.currentSection > nextIndex && self.currentSection > 1) {

                    self.currentSection = nextIndex;
                    self.gaugeHeight -= self.ratio * diff;
                    self.transformLinks -= self.sectionHeight * diff;

                } else if (self.currentSection < nextIndex && self.currentSection < self.nbSections) {

                    self.currentSection = nextIndex;
                    self.gaugeHeight += self.ratio * diff;
                    self.transformLinks += self.sectionHeight * diff;

                }

            };

            // -------------------------------------------------

            socketService.on('changeSectionMobile', function (data) {

                self.changeSection(data.section);

            });

            // -------------------------------------------------
            // Orientation manager
            // -------------------------------------------------

            this.orientationMobile = 'portrait';

            window.onorientationchange = orientationDevice;

            function orientationDevice() {

                console.log('orientation changed');
                var data = {};
                data.section = self.currentSection;

                switch (window.orientation) {
                    case -90:
                    case 90:
                        data.orientation = 'landscape';
                        self.orientationMobile = 'landscape';
                        socketService.emit('changeOrientationMobile', data);
                        break;
                    default:
                        data.orientation = 'portrait';
                        self.orientationMobile = 'portrait';
                        socketService.emit('changeOrientationMobile', data);
                        break;
                }

            }

            orientationDevice();


            // -------------------------------------------------
            // Gallery manager
            // -------------------------------------------------
            this.currentSlide = 1;
            this.galleryRemote = function (direction, nbSlides) {

                var data = {};
                data.arrow = direction;
                data.section = self.currentSection;
                socketService.emit('galleryRemoteMobile', data);

                if (direction == 'right'){
                    if (self.currentSlide >= nbSlides){
                        self.currentSlide = 1;
                    }else{
                        self.currentSlide += 1;
                    }
                }else if (direction == 'left'){
                    if (self.currentSlide <= 1){
                        self.currentSlide = nbSlides;
                    }else{
                        self.currentSlide -= 1;
                    }
                }

            };


            // -------------------------------------------------
            // Drag event manager
            // -------------------------------------------------

            this.sliderDrag = function (direction) {

                if (direction == 'right') {

                    if (self.drag < 200) {
                        self.drag += 5;
                        self.dataDrag.drag = self.drag;
                        self.dataDrag.direction = direction;
                        self.dataDrag.section = self.currentSection;
                        socketService.emit('sliderDraggableMobile', self.dataDrag);
                    }

                } else if (direction == 'left') {
                    if (self.drag > -200) {
                        self.drag -= 5;
                        self.dataDrag.drag = self.drag;
                        self.dataDrag.direction = direction;
                        self.dataDrag.section = self.currentSection;
                        socketService.emit('sliderDraggableMobile', self.dataDrag);
                    }
                }
            };

            this.dragRelease = function () {

                self.drag = -50;

            };

            // -------------------------------------------------
            // DragSurface

            this.dragUpDown = 0;
            this.dragLeftRight = 0;
            this.dataDrag = {};
            this.dragSurface = function (direction) {

                //if (direction == 'right'){

                //    if (self.dragLeftRight < 200){
                //        self.dragLeftRight += 5;
                //        self.dataDrag.drag = self.dragLeftRight;
                //        self.dataDrag.direction = direction;
                //        self.dataDrag.section = self.currentSection;
                //        socketService.emit('sliderDraggableMobile', self.dataDrag);
                //    }
                //
                //}else if (direction == 'left'){
                //    if (self.dragLeftRight > -200){
                //        self.dragLeftRight -= 5;
                //        self.dataDrag.drag = self.dragLeftRight;
                //        self.dataDrag.direction = direction;
                //        self.dataDrag.section = self.currentSection;
                //        socketService.emit('sliderDraggableMobile', self.dataDrag);
                //    }

                if (direction == 'up') {

                    if (self.dragUpDown > 0) {
                        self.dragUpDown -= 1;
                        self.dataDrag.drag = self.dragUpDown;
                        self.dataDrag.direction = direction;
                        self.dataDrag.section = self.currentSection;
                        socketService.emit('sliderDraggableMobile', self.dataDrag);
                    }

                }
                else if (direction == 'down') {

                    if (self.dragUpDown < 31) {
                        self.dragUpDown += 1;
                        self.dataDrag.drag = self.dragUpDown;
                        self.dataDrag.direction = direction;
                        self.dataDrag.section = self.currentSection;
                        socketService.emit('sliderDraggableMobile', self.dataDrag);
                    }

                }

            };


            // -------------------------------------------------
            // Video manager
            // -------------------------------------------------

            this.videoPlayState = 'pauseVideo';
            this.videoMuteState = 'unMute';
            this.videoScreenState = 'unfullscreen';

            this.videoCommand = function(command){

                var data = {};

                switch ( command ){

                    case 'play':
                        self.videoPlayState == 'pauseVideo' ? self.videoPlayState = 'playVideo' : self.videoPlayState = 'pauseVideo';
                        data.command = self.videoPlayState;
                        break;
                    case 'mute':
                        self.videoMuteState == 'mute' ? self.videoMuteState = 'unMute' : self.videoMuteState = 'mute';
                        data.command = self.videoMuteState;
                        break;
                    case 'fullscreen':
                        self.videoScreenState == 'unfullscreen' ? self.videoScreenState = 'fullscreen' : self.videoScreenState = 'unfullscreen';
                        data.command = self.videoScreenState;
                        break;

                }

                data.section = self.currentSection;
                socketService.emit('videoRemoteMobile', data);

            };

            // -------------------------------------------------
            // Elements Link manager
            // -------------------------------------------------


            this.elementLink = function(element, action){

                var data = {};
                data.section = self.currentSection;
                data.action = action;

                if (action == 'elementLink'){

                    data.id = element.parent;
                    element.state == 'close' ? element.state = 'open' : element.state = 'close';

                }else{

                    if (element.state == 'close'){

                        element.state = 'open';
                        data.id = element.open;


                    }else if (element.state == 'open'){

                        element.state = 'close';
                        data.id = element.close;

                    }

                }

                socketService.emit('buttonRemoteMobile', data);

            };


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

})
();


