



  var getQueryString = function ( field, url ) {
      var href = url ? url : window.location.href;
      var reg = new RegExp( '[?&]' + field + '=([^&#]*)', 'i' );
      var string = reg.exec(href);
      return string ? string[1] : null;
  };

  var bindNewImageClick = function(item) {
      var imgSrc;
      var imgId;
      if(item.currentTarget){
            imgSrc = item.currentTarget.src;
            imgId = parseInt(item.currentTarget.dataset.id);
      } else {
          imgSrc = item.currentSrc;
          imgId = parseInt(item.dataset.id);
      }
      $('.modal-body img').attr("src", imgSrc);

      var pushState = window.location.origin + window.location.pathname +'?imageID='+imgId;
      window.history.pushState('', '', pushState);
      return item;
  }

  $(document).ready(function(){
      $('.lazy').Lazy({
         // your configuration goes here
         scrollDirection: 'vertical',
         effect: 'fadeIn',
         visibleOnly: true,
         onError: function(element) {
             console.log('error loading ' + element.data('src'));
         }
     });

      var imageId = getQueryString('imageID');
      if(imageId){
          $('#myModal').modal('show');
      }

      $('#uploadClick').click(function(){
          $('#uploadModal').modal('show');
      })

      $("#btnSubmit").click(function (event) {
          //stop submit the form, we will post it manually with js.
          event.preventDefault();
          var duplicateImg;
          // Get form
          var form = $('#imageUploadForm')[0];
          if($('img.item.lazy')[0]){
              duplicateImg = $('img.item.lazy')[0].cloneNode(true);
          } else {
              var elem = $("<img />");
              $(elem).addClass('item lazy');
              $(elem).attr('data-toggle','modal');  // set the attribute
              $(elem).attr('data-target','#myModal');  // set the attribute


              duplicateImg = $(elem)[0];
          }


          duplicateImg.src = window.location.origin+"/images/loading.gif";
  		// Create an FormData object
          var data = new FormData(form);
  		// disabled the submit button
          $("#btnSubmit").prop("disabled", true);
          $("#imageUploadForm").hide();
          $(".loader").show();
          $.ajax({
              type: "POST",
              enctype: 'multipart/form-data',
              url: window.location.pathname+"/upload",
              data: data,
              processData: false,
              contentType: false,
              cache: false,
              timeout: 600000,
              success: function (data) {
                  duplicateImg.src = data.imageUrl;
                  duplicateImg.dataset.id = data.imageID;
                  $('#gallery-collection').prepend(duplicateImg);
                  $(".loader").hide();
                  $("#btnSubmit").prop("disabled", false);
                  $('#uploadModal').modal('hide');
                  $("#imageUploadForm").show();
                  $($('.item')[0]).click(function(item){
                        bindNewImageClick(item);
                  });

              },
              error: function (e) {
                  alert('Something went wrong during the upload');
                  $("#imageUploadForm").show();
                  $("#btnSubmit").prop("disabled", false);
              }
          });
      });

      $('.item').click(function(item) {
            bindNewImageClick(item);
      });

      $('.deleteImg').click(function(item) {
          var imageId = parseInt(item.currentTarget.dataset.id);
          var imageUrl = $($(item.currentTarget).parent()[0]).children()[1].src;
          data = {
              imageUrl,
              imageId
          }
          $.ajax({
              type: "GET",
              enctype: 'multipart/form-data',
              url: window.location.pathname+"/delete/"+imageId,
              data: JSON.stringify(data),
	          contentType: 'application/json',
              timeout: 600000,
              success: function (data) {
                  console.log(data);
                  $($('img.item[data-id="'+data.imageID+'"]')).parent().remove();
              },
              error: function (e) {
                  alert('Something went wrong during the upload');
                  console.log(e);
              }
          });
      });

      $('#newAlbumMessage').click(function() {
          $('#newAlbumForm').show();
          $('#newAlbumMessage').hide();
      });

      $('#newAlbumFormCancelButton').click(function() {
          $('#newAlbumMessage').show();
          $('#newAlbumForm').hide();
      });

      $('#newAlbumFormAddButton').click(function() {
          var albumName = $('#newAlbumForm>input').val();
          if(albumName != ''){
              $.ajax({
                type: "POST",
                url: window.location.pathname,
                data: JSON.stringify({ albumName: albumName }),
                contentType: "application/json; charset=utf-8",
                dataType: "json",
                success: function (data) {
                      $('#album-collection ul li:first-child').after('<li><a href=' + data.albumUrl + '><p>' + data.albumName + '</p></a></li>');
                      $('#newAlbumForm>input').val('');
                      $('#newAlbumMessage').show();
                      $('#newAlbumMessage').text('Create Another Album')
                      $('#newAlbumForm').hide();
                  },
                  error: function (e) {
                      alert('Something went wrong during the upload');
                  }
              });
          }
      });
  });
