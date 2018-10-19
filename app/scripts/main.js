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
    photo: '',
    url: '',
    shareOptions: {}
  };
  var quotes;
  $.getJSON( 'https://na0019n7azcbjfp.devcloud.acquia-sites.com/api/ct/matrix', function( data ) {
    quotes = data;
    console.log(quotes)
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
    fd.quote = quotes[fd.team].items[fd.scent].content;
    $('#result-text').text(fd.quote);
    $('#result-name').text(fd.name);
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
      FB.getLoginStatus(function (response) {
        if (response.status === 'connected') {
          $('#loader').show();
          getFbUserData(response);
        } else {
          $('#popup-login').show();
        }
      });
    }
  });

  $('#fbLogin').on('click', function(e) {
    $('#loader').show();
    $('#popup-login').hide();
    FB.getLoginStatus(function (response) {
      if (response.status === 'connected') {
        return;
      } else {
        FB.login(statusChangeCallback, {
          scope: 'email,public_profile',
          return_scopes: true
        });
      }
    });
  });

  $('#fbShare').on('click', function(e) {
    e.preventDefault();
    shareFb()
  })

  $('.close').on('click', function(e) {
    e.preventDefault();
    $('.popup').hide();
  })

  function goToScreen(screen) {
    $('.step').hide();
    $('.step-'+screen).show();
  }

  function shareFb() {
    FB.ui({
      method: 'feed',
      mobile_iframe: true,
      name: 'Comfort',
      hashtag: '#ComfortHươngNướcHoaThiênNhiên',
      href: fd.shareOptions.share_url,
      link: fd.shareOptions.share_url
    }, function (response) {
      let error_code = response['error_code'] || false;
      if (error_code) {
        console.error(response);
      }
      else {
        window.location.href = $('#fbShare').data('url');
      }
    }
  );
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
        fields: 'id,name,first_name,last_name,middle_name,email,link,gender,locale,picture.width(260).height(260)'
      },
      function (response) {
        setupCanvas(response)
      }
    );
  }

  function setupCanvas(response) {
    var fullName = response.first_name + ' ' + response.last_name;
    placeholder.src = initImageSrc.replace('-1.jpg', '-'+fd.team+fd.scent)+'.jpg';
    var teamName = teams[fd.team - 1];
    var scentName = scents[fd.scent - 1];
    fd.fullName = fullName;
    $('#result-name').text(fullName)

    var fbCanvas = document.createElement('canvas');
    var ctx2 = fbCanvas.getContext('2d')

    fbPlaceholder.src = fbPlaceholderSrc.replace('-1.jpg', '-'+fd.team+fd.scent)+'.jpg';

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
      ctx.fillText(teamName, 94, 285);
      ctx.textAlign = 'center';
      ctx.fillText(scentName, 94, 316);

      ava.src = response.picture.data.url;
      ava.onload = function() {
        ctx.drawImage(ava, 0, 0, 260, 260, 42, 120, 115, 115);
        ctx2.drawImage(ava, 0, 0, 260, 260, 166, 315, 260, 260);

        // $.ajax
        var dataToSend = {
          id: response.id || '',
          base64: canvas.toDataURL('image/jpeg', 1.0),
          share_base64: fbCanvas.toDataURL('image/jpeg', 1.0),
          email: response.email,
          full_name: fullName || '',
          first_name: response.first_name || '',
          middle_name: response.middle_name || 'aaa ',
          last_name: response.last_name || '',
          group: fd.team || 1,
          option: fd.scent || 1
        }

        $.ajax({
          url: $('#fbShare').data('action'),
          data: JSON.stringify(dataToSend),
          type: 'POST',
          success: function(res) {
            fd.shareOptions = res;
            $('#loader').fadeOut();
            resultImg.src = res.image;
            fbImg.src = res.fb_image;
            goToScreen(3);
          },
          error: function (xhr, status, error) {
            $('#loader').fadeOut();
          }
        })
      }
    }
  }
});
