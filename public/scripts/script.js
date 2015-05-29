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

    function setLocal(sites, url,  hash) {
        localStorage.setItem('remotableSitesMobile', JSON.stringify(saveSite(sites, url, hash)));
    }

    function connectionToSite(url, key){

        // Connection au serveur
         socket = io('ws://'+url+'');
        console.log(socket);
        //var socket = io('ws://192.168.20.253:3303');
        // envoie la clé au serveur
        socket.emit('mobileCo', key, function(data){
            console.log(data);
        });

    }


    // --------------------------------------------------
    var key;
    var socket;

    // --------------------------------------------------
    // check localStorage

    var local = getLocal();
    var websites = JSON.parse(local);

    if (local != null) {

        console.log('getting from local .. ');

        console.log(websites);

        for(var i=0; i < websites.length; i++){

            $('#sites_list').append('<li>' +
            '<a href="#" class="site-item" data-server="'+websites[i].name+'" data-key="'+websites[i].key+'">'+websites[i].name+'</a>' +
            '</li>');

        }

    }

    // --------------------------------------------------
    //// Connection au serveur
    //var socket = io('ws://192.168.10.16:3303');
    ////var socket = io('ws://192.168.20.253:3303');

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
        key = CryptoJS.SHA512($('#input').val());

        connectionToSite(url_site, key);

        // si la connexion s'est bien faite alors on stocke le site

    });

    // en attente de la connexion du mobile
    //socket.on('mobileConnected', function (res) {
    //
    //    // le mobile est connecté au serveur
    //    if (res.data == 'ok') {
    //        $('#connected').css('color', 'greenyellow');
    //        $('#form_connection').css('display', 'none');
    //        $('#wrapper').css('display', 'block');
    //
    //        //stocke dans le localStorage le site
    //
    //        // à l'ajout d'un nouveau site
    //
    //        //check localStorage
    //        if (local == null) {
    //            console.log('saving to new local .. ');
    //            var sites = [];
    //            setLocal(sites, url_site, key);
    //
    //        } else {
    //            console.log('updating local .. ');
    //            setLocal(websites, url_site, key);
    //
    //        }
    //
    //    }
    //
    //});


    // --------------------------------------------------
    // Reconnexion à un site existant
    $('.site-item').on('click', function(){

        connectionToSite($(this).attr('data-server'), $(this).attr('data-key') );

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
            //socket.emit('swipeMobile', 'next');

        })
        .on('swipeleft', function () {
            console.log('swipeleft');
            //socket.emit('swipeMobile', 'prev');
        })
        .on('swipeup', function () {
            console.log('swipeup');
            //socket.emit('swipeMobile', 'up');

        })
        .on('swipedown', function () {
            console.log('swipedown');
            //socket.emit('swipeMobile', 'down');
        });


    //$('#test').on('click', function(){
    //
    //    console.log('click');
    //    socket.emit('test', Math.floor((Math.random() * 10) + 1));
    //    //$.post("/postest", { message: Math.floor((Math.random() * 10) + 1) });
    //
    //});


});
