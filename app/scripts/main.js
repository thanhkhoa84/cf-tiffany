$(document).ready(function() {
  var canvas = document.createElement('canvas')
  canvas.width = 500
  canvas.height = 600
  var ctx = canvas.getContext('2d');
  var ava = new Image(165, 165);    
  ava.crossOrigin='anonymous';
  var base64;
  var resultImg = document.getElementById('result-image');
  if(resultImg) {
    var initImageSrc = resultImg.src;
  }
  var placeholder = new Image(500, 600);
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
    quote: '',
    photo: ''
  };
  var quotes; 
  $.getJSON( 'https://ct2018.asiadigitalhub.com/api/ct/matrix', function( data ) {
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
      $('#popup-team').fadeIn();
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
      } else if (response.status === 'not_authorized') {
        FB.login(statusChangeCallback, {
          scope: 'email,public_profile',
          return_scopes: true
        });
      } else {
        FB.login(statusChangeCallback, {
          scope: 'email,public_profile',
          return_scopes: true
        });
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
    fd.name = quotes[fd.team].items[fd.scent].name;
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
        fields: 'id,first_name,last_name,email,link,gender,locale,picture.width(165).height(165)'
      },
      function (response) {
        setupCanvas(response)
      }
    );
  }

  function setupCanvas(response) {
    var fullName = response.first_name + ' ' + response.last_name;
    placeholder.src = initImageSrc;

    placeholder.onload = function() {
      ctx.drawImage(placeholder, 0, 0)
      ctx.font = '500 25px \'CormorantGaramond-Medium\'';
      ctx.textAlign = 'center';
      ctx.fillText(fullName.toUpperCase(), canvas.width/2, 90);
      
      ctx.font = '500 21px \'CormorantGaramond-Medium\'';
      ctx.textAlign='end'; 
      ctx.fillText(teams[fd.team - 1], canvas.width - 200, canvas.height - 229);
      ctx.textAlign='start'; 
      ctx.fillText(scents[fd.scent - 1], canvas.width/2 - 40, canvas.height - 202);

      ava.src = response.picture.data.url;
      ava.onload = function() {
        ctx.drawImage(ava, 0, 0, 165, 165, 50, 125, 165, 165);
        base64 = canvas.toDataURL();
        resultImg.src = base64;
        fd.photo = base64;
        $('#loader').fadeOut();
        goToScreen(3);
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
