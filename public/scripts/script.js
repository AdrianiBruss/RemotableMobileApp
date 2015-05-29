$(function () {
    'use strict';


    // --------------------------------------------------
    // Connection au serveur
    var socket = io('ws://192.168.10.16:3303');
    //var socket = io('ws://192.168.20.253:3303');

    var key;

    $('#connected').css('color', 'red');

    $('#submit').on('click', function () {

        // encrypte la clé en sha512
        key = CryptoJS.SHA512($('#input').val());
        // envoie la clé au serveur
        socket.emit('mobileCo', key);

    });

    // en attente de la connexion du mobile
    socket.on('mobileConnected', function (res) {

        // le mobile est connecté au serveur
        if (res.data == 'ok') {
            $('#connected').css('color', 'greenyellow');
            $('#form_connection').css('display', 'none');
            $('#wrapper').css('display', 'block');
        }

    });


    // --------------------------------------------------
    // Application
    $('#wrapper').css('display', 'none');

    // menu
    $('#menu > ul > .menu-item').on('click', function () {

        var link = $(this).attr('data-mobile-menu-item');

        socket.emit('changeLinkMobile', link);

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
