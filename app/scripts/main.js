$(document).ready(function() {
  var base64;

  $('#btn-start').on('click', function(e) {
    e.preventDefault();
  });
  $('#fbShare').on('click', function(e) {
    e.preventDefault();
    fbLogin()
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
    console.log(response);
    if (accessToken) {
      var accessToken = response.authResponse.accessToken;
    }
    if (response.status === 'connected') {
      getFbUserData(accessToken);
    } else if (response.status === 'not_authorized') {
      console.log("Err");
    } else {
      console.log("Err");
    }
  }

  function fbLogin() {
    FB.login(function (response) {
      if (response.authResponse) {
        // Get and display the user profile data
        getFbUserData();
      } else {
        console.log('User cancelled login or did not fully authorize');
      }
    }, {
      scope: 'email'
    });
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

  function postImageToFacebook(token, filename, mimeType, imageData, message) {
    var fd = new FormData();
    fd.append("access_token", token);
    fd.append("source", imageData);
    fd.append("no_story", true);

    // Upload image to facebook without story(post to feed)
    $.ajax({
      url: "https://graph.facebook.com/me/photos?access_token=" + token,
      type: "POST",
      data: fd,
      processData: false,
      contentType: false,
      cache: false,
      success: function (data) {
        console.log("success: ", data);
        // Get image source url
        FB.api(
          "/" + data.id + "?fields=images",
          function (response) {
            if (response && !response.error) {
              //console.log(response.images[0].source);

              // Create facebook post using image
              FB.api(
                "/me/feed",
                "POST", {
                  "message": "",
                  "picture": response.images[0].source,
                  "link": window.location.href,
                  "name": 'Look at the cute panda!',
                  "description": message,
                  "privacy": {
                    value: 'SELF'
                  }
                },
                function (response) {
                  if (response && !response.error) {
                    /* handle the result */
                    console.log("Posted story to facebook");
                  }
                }
              );
            }
          }
        );
      },
      error: function (shr, status, data) {
        console.log("error " + data + " Status " + shr.status);
      },
      complete: function (data) {
        //console.log('Post to facebook Complete');
      }
    });
  }

  $('#fbShare').on('click', function(e) {
    e.preventDefault();
    fbLogin();
  });

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

  function setupCanvas(response) {
    var canvas = document.createElement('canvas')
    canvas.width = 500
    canvas.height = 600
    var ctx = canvas.getContext('2d')
    var fullName = response.first_name + ' ' + response.last_name;
    var placeholder = new Image(500, 600);
    placeholder.src = '../images/placeholder.jpg';
    var ava = new Image(165, 165);    
    ava.crossOrigin="anonymous";
    var resultImg = document.getElementById('result-image')

    placeholder.onload = function() {
      ctx.drawImage(placeholder, 0, 0)
      ctx.font = "30px 'Cormorant Garamond'";
      ctx.textAlign = "center";
      ctx.fillText(fullName.toUpperCase(), canvas.width/2, 90);

      ava.src = response.picture.data.url;

      ava.onload = function() {
        ctx.drawImage(ava, 0, 0, 165, 165, 50, 125, 165, 165);
        base64 = canvas.toDataURL();
        resultImg.src = base64
      }
    }
  }
})
