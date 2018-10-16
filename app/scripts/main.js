$(document).ready(function() {
  var canvas = document.createElement('canvas')
  canvas.width = 500
  canvas.height = 600
  var ctx = canvas.getContext('2d');
  var ava = new Image(165, 165);    
  ava.crossOrigin='anonymous';
  var base64;
  var resultImg = document.getElementById('result-image');
  var initImageSrc = resultImg.src;
  var placeholder = new Image(500, 600);

  var fd = {
    team: 1,
    scent: 1,
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
    fd.team = $(this).data('team')
  })

  $('#scent li a').on('click', function(e) {
    fd.scent = $(this).data('scent');
  })

  $('#btnTeam').on('click', function(e) {
    goToScreen(2);
  })

  $('#seeResult').on('click', function(e) {
    fd.quote = quotes[fd.team].items[fd.scent].content;
    fd.name = quotes[fd.team].items[fd.scent].name;
    setResultText();
    FB.getLoginStatus(function (response) {
      if (response.status === 'connected') {
        getFbUserData();
      } else {
        showPopUp();
      }
    });
  });

  $('#fbShare').on('click', function(e) {
    e.preventDefault();
    FB.ui({
      method: 'share_open_graph',
      action_type: 'og.likes',
      action_properties: JSON.stringify({
        object: {
          image:'https://ct2018.asiadigitalhub.com/sites/default/files/101556094912508251539674674_5331.jpg',
          url: 'https://ct2018.asiadigitalhub.com',
          title: fd.name,
          description: fd.quote
        }
      })
    }, function(response) {
      console.log(repsonse)
    })
  })

  $('#reset').on('click', function(e) {
    e.preventDefault();
    reset()
  });

  $('#fbLogin').on('click', function(e) {
    e.preventDefault();
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
    $('.popup').fadeIn();
  }

  function hidePopup() {
    $('.popup').fadeOut();
  }

  function goToScreen(screen) {
    $('.step').hide();
    $('.step-'+screen).show();
  }

  function setResultText() {
    $('#result-text').text(fd.quote);
    $('#result-name').text(fd.name)
    sendDataToServer(fd);
  }

  function sendDataToServer(fd) {
    // $.ajax
  }

  function reset() {
    fd = {
      team: 1,
      scent: 1,
      name: '',
      quote: '',
      photo: ''
    };
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
      ctx.font = '30px \'Cormorant Garamond\'';
      ctx.textAlign = 'center';
      ctx.fillText(fullName.toUpperCase(), canvas.width/2, 90);

      ava.src = response.picture.data.url;

      ava.onload = function() {
        ctx.drawImage(ava, 0, 0, 165, 165, 50, 125, 165, 165);
        base64 = canvas.toDataURL();
        resultImg.src = base64;
        fd.photo = base64;
        hidePopup();
        goToScreen(3);
      }
    }
  }

  function postImageToFacebook(token, filename, mimeType, imageData, message) {
    var fd = new FormData();
    fd.append('access_token', token);
    fd.append('source', imageData);
    fd.append('no_story', true);

    // Upload image to facebook without story(post to feed)
    $.ajax({
      url: 'https://graph.facebook.com/me/photos?access_token=' + token,
      type: 'POST',
      data: fd,
      processData: false,
      contentType: false,
      cache: false,
      success: function (data) {
        console.log('success: ', data);
        // Get image source url
        FB.api(
          '/' + data.id + '?fields=images',
          function (response) {
            if (response && !response.error) {
              //console.log(response.images[0].source);

              // Create facebook post using image
              FB.api(
                '/me/feed',
                'POST', {
                  'message': '',
                  'picture': response.images[0].source,
                  'link': window.location.href,
                  'name': 'Look at the cute panda!',
                  'description': message,
                  'privacy': {
                    value: 'SELF'
                  }
                },
                function (response) {
                  if (response && !response.error) {
                    /* handle the result */
                    console.log('Posted story to facebook');
                  }
                }
              );
            }
          }
        );
      },
      error: function (shr, status, data) {
        console.log('error ' + data + ' Status ' + shr.status);
      },
      complete: function (data) {
        //console.log('Post to facebook Complete');
      }
    });
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
