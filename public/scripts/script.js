$(function () {
    'use strict';

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

    function showWrapper() {
        $('#connected').css('color', 'greenyellow');
        $('#form_connection').css('display', 'none');
        $('#wrapper').css('display', 'block');
    }


    function connectionToSite(url, hash, action) {

        // Connection au serveur
        socket = io('ws://' + url + '');
        //var socket = io('ws://192.168.20.253:3303');
        // envoie la clé au serveur

        socket.emit('mobileCo', hash, function (data) {

            console.log(data);

            if (data == 'mobileConnection') {


                if (action == 'add') {

                    showWrapper();

                    //stocke dans le localStorage le site
                    if (local == null) {
                        console.log('saving to new local .. ');
                        var sites = [];
                        setLocal(sites, url_site, hash);

                    } else {
                        console.log('updating local .. ');
                        setLocal(websites, url_site, hash);

                    }

                } else {

                    console.log('reconnection');

                    showWrapper();

                }

            }

        });

    }


    // --------------------------------------------------
    var hash;
    var socket;

    // --------------------------------------------------
    // check localStorage

    var local = getLocal();
    var websites = JSON.parse(local);

    if (local != null) {

        console.log('getting from local .. ');

        console.log(websites);

        for (var i = 0; i < websites.length; i++) {

            $('#sites_list').append('<li>' +
            '<a href="#" class="site-item" data-server="' + websites[i].name + '" data-hash="' + websites[i].hash + '">' + websites[i].name + '</a>' +
            '</li>');

        }

    }


    // --------------------------------------------------
    // Ajout de nouveau site

    $('#add_new').on('click', function () {
        $('#form_connection').css('display', 'block');
    });

    $('#connected').css('color', 'red');

    var url_site;
    $('#submit').on('click', function () {

        //récupère l'url du site
        url_site = $('#url_input').val();

        // encrypte la clé en sha512
        hash = CryptoJS.SHA512($('#key_input').val()).toString();

        // connexion au serveur
        connectionToSite(url_site, hash, 'add');

    });


    // --------------------------------------------------
    // Reconnexion à un site existant
    $('.site-item').on('click', function () {

        // reconnexion au serveur
        connectionToSite($(this).attr('data-server'), $(this).attr('data-hash'), 'reco');

    });


    // --------------------------------------------------
    // Application
    $('#wrapper').css('display', 'none');

    // menu
    $('#menu > ul > .menu-item').on('click', function () {

        var link = $(this).attr('data-mobile-menu-item');

        //socket.emit('changeLinkMobile', link);

    });


    // slider
    $('#slider')
        .on('swiperight', function () {
            console.log('swiperight');
            socket.emit('swipeMobile', 'next');

        })
        .on('swipeleft', function () {
            console.log('swipeleft');
            socket.emit('swipeMobile', 'prev');
        })
        .on('swipeup', function () {
            console.log('swipeup');
            socket.emit('swipeMobile', 'up');

        })
        .on('swipedown', function () {
            console.log('swipedown');
            socket.emit('swipeMobile', 'down');
        });


    //$('#test').on('click', function(){
    //
    //    console.log('click');
    //    socket.emit('test', Math.floor((Math.random() * 10) + 1));
    //    //$.post("/postest", { message: Math.floor((Math.random() * 10) + 1) });
    //
    //});


});
