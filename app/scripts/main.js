$(document).ready(function() {
  var canvas = document.createElement('canvas')
  var ctx = canvas.getContext('2d');
  var ava = new Image(260, 260);
  ava.crossOrigin='anonymous';
  var base64;
  var resultImg = document.getElementById('result-image');
  var fbImg = document.getElementById('fb-image');
  if(resultImg) {
    var initImageSrc = resultImg.src;
  }
  if(fbImg) {
    var fbPlaceholderSrc = fbImg.src;
  }
  var placeholder = new Image();
  var fbPlaceholder = new Image();
  var teams = [
    'CÁ TÍNH', 'SÀNH ĐIỆU', 'SANG CHẢNH', 'GỢI CẢM'
  ]
  var scents = [
    'QUÝ PHÁI', 'THANH LỊCH', 'THANH THOÁT', 'KIÊU SA'
  ]

  var fd = {
    team: 0,
    scent: 0,
    name: '',
    fullName: '',
    quote: '',
    photo: ''
  };
  var quotes;
  $.getJSON( 'https://na0019n7azcbjfp.devcloud.acquia-sites.com/api/ct/matrix', function( data ) {
    quotes = data;
  });


  // user pick
  $('#team li a').on('click', function(e) {
    $('#team li a').removeClass('active');
    $(this).addClass('active');
    $('#btnTeam').removeClass('disabled');
    fd.team = $(this).data('team')
  })

  $('#scent li a').on('click', function(e) {
    $('#scent li a').removeClass('active');
    $(this).addClass('active');
    $('#seeResult').removeClass('disabled');
    fd.scent = $(this).data('scent');
  })

  $('#btnTeam').on('click', function(e) {
    if($(this).hasClass('disabled')) {
      $('#popup-team').fadeIn();
    } else {
      goToScreen(2);
    }
  })

  $('#seeResult').on('click', function(e) {
    if($(this).hasClass('disabled')) {
      $('#popup-scent').fadeIn();
    } else {
      setResultText();
      FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {
          $('#loader').show();
          getFbUserData();
        } else {
          $('#popup-login').show();
        }
      });
    }
  });

  $('#reset').on('click', function(e) {
    e.preventDefault();
    reset()
  });

  $('#fbLogin').on('click', function(e) {
    e.preventDefault();
    $('#loader').show();
    $('#popup-login').hide();
    FB.getLoginStatus(function (response) {
      if (response.status === 'connected') {
        getFbUserData();
      } else if (response.status === 'authorization_expired') {
        FB.login(statusChangeCallback, {
          scope: 'email,public_profile',
          return_scopes: true
        });
        $('#loader').hide();
      } else if (response.status === 'not_authorized') {
        FB.login(statusChangeCallback, {
          scope: 'email,public_profile',
          return_scopes: true
        });
        $('#loader').hide();
      } else {
        FB.login(statusChangeCallback, {
          scope: 'email,public_profile',
          return_scopes: true
        });
        $('#loader').hide();
      }
    });
  });

  $('.close').on('click', function(e) {
    e.preventDefault();
    $('.popup').hide();
  })

  function showPopUp() {
    $('#popup-login').fadeIn();
  }

  function hidePopup() {
    $('#popup-login').fadeOut();
  }

  function goToScreen(screen) {
    $('.step').hide();
    $('.step-'+screen).show();
  }

  function setResultText() {
    fd.quote = quotes[fd.team].items[fd.scent].content;
    fd.name = quotes[fd.team].items[fd.scent].scent;
    $('#result-text').text(fd.quote);
    $('#result-name').text(fd.name)
    sendDataToServer(fd);
  }

  function sendDataToServer(fd) {
    // $.ajax
  }

  function reset() {
    fd = {
      team: 0,
      scent: 0,
      name: '',
      quote: '',
      photo: ''
    };
    $('#team li a').removeClass('active');
    $('#scent li a').removeClass('active');
    $('#btnTeam, #seeResult').addClass('disabled');
    $('#result-text').text('');
    $('#result-image').attr('src', initImageSrc);
    goToScreen(1);
  }

  function shareFb() {
    FB.ui({
      method: 'share_open_graph',
      action_type: 'og.likes',
      action_properties: JSON.stringify({
        object: 'https://developers.facebook.com/docs/',
      })
    }, function (response) {
      console.log(response)
    });
  }

  function statusChangeCallback(response) {
    if (accessToken) {
      var accessToken = response.authResponse.accessToken;
    }
    if (response.status === 'connected') {
      getFbUserData(accessToken);
    } else if (response.status === 'not_authorized') {
      console.log('Err');
    } else {
      console.log('Err');
    }
  }

  function getFbUserData() {
    FB.api('/me', {
        locale: 'en_US',
        fields: 'id,first_name,last_name,email,link,gender,locale,picture.width(260).height(260)'
      },
      function (response) {
        setupCanvas(response)
      }
    );
  }

  function setupCanvas(response) {
    var fullName = response.first_name + ' ' + response.last_name;
    placeholder.src = initImageSrcreplace('-1.jpg', '-'+fd.scent)+'jpg';
    var teamName = teams[fd.team - 1];
    var scentName = scents[fd.scent - 1];
    fd.fullName = fullName;
    $('#result-name').text(fullName)

    var fbCanvas = document.createElement('canvas');
    var ctx2 = fbCanvas.getContext('2d')

    fbPlaceholder.src = fbPlaceholderSrc.replace('-1.jpg', '-'+fd.scent)+'jpg';

    fbPlaceholder.onload = function() {
      // generate share fb photo
      fbCanvas.width = 1200;
      fbCanvas.height = 630;
      ctx2.drawImage(fbPlaceholder, 0, 0)
      ctx2.font = '500 35px \'CormorantGaramond-Medium\'';
      ctx2.textAlign='center';
      ctx2.fillText(fullName.toUpperCase(), 303, 280);
      ctx2.font = '500 32px \'CormorantGaramond-Medium\'';
      ctx2.textAlign='center';
      ctx2.fillText(teams[fd.team - 1], fbCanvas.width/2 + 250, 138);
      ctx2.textAlign='center';
      ctx2.fillText(scents[fd.scent - 1], fbCanvas.width/2 + 250, 208);
    }

    placeholder.onload = function() {
      // generate result photo
      canvas.width = 388 ;
      canvas.height = 388;
      ctx.drawImage(placeholder, 0, 0)
      ctx.font = '500 22px \'CormorantGaramond-Medium\'';
      ctx.textAlign = 'center';
      ctx.fillText(fullName.toUpperCase(), canvas.width/2, 88);

      ctx.textAlign = 'center';
      ctx.font = '500 13px \'CormorantGaramond-Medium\'';
      ctx.fillText(teamName, 96, 285);
      ctx.textAlign = 'center';
      ctx.fillText(scentName, 96, 320);

      ava.src = response.picture.data.url;
      ava.onload = function() {
        ctx.drawImage(ava, 0, 0, 260, 260, 42, 120, 115, 115);
        base64 = canvas.toDataURL('image/jpeg', 1.0);
        resultImg.src = base64;
        fd.photo = base64;


        ctx2.drawImage(ava, 0, 0, 260, 260, 166, 315, 260, 260);
        fbImg.src = fbCanvas.toDataURL('image/jpeg', 1.0);
        fd.fbSharePhoto = fbCanvas.toDataURL('image/jpeg', 1.0);
        $('#loader').fadeOut();
        goToScreen(3);
        $('.flower').hide();
      }
    }
  }

  function postCanvasToURL() {
    // Convert canvas image to Base64
    var img = snap.toDataURL();
    // Convert Base64 image to binary
    var file = dataURItoBlob(img);
  }

  function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {
      type: 'image/png'
    });
  }


})
