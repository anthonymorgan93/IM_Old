(function() {
  var changeView, loadImage360;

  window.spBuilder = {
    imagePath: '//d1liekpayvooaz.cloudfront.net/csg/imperialmotion/images/',
    currentView: 'front',
    image360Loaded: false
  };

  loadImage360 = function() {
    var h, w;
    if (window.spBuilder.image360Loaded) {
      return;
    }
    window.spBuilder.image360Loaded = true;
    w = $('#main-image-front').width();
    h = $('#main-image-front').height();
    return $('#image-360').image360({
      source: [window.spBuilder.imagePath + '360-1.jpg', window.spBuilder.imagePath + '360-2.jpg', window.spBuilder.imagePath + '360-3.jpg', window.spBuilder.imagePath + '360-4.jpg', window.spBuilder.imagePath + '360-5.jpg', window.spBuilder.imagePath + '360-6.jpg'],
      width: w,
      height: h,
      animate: false
    });
  };

  changeView = function(view) {
    if (view === "360") {
      loadImage360();
      $('#control-360').hide().fadeIn(500, function() {
        return setTimeout(function() {
          return $('#control-360').fadeOut();
        }, 2.5 * 1000);
      });
    }
    $('[data-swatch-nav]').removeClass('active');
    $('[data-swatch-nav=' + view + ']').addClass('active');
    $('.main-image').hide();
    $('#main-image-' + view).show();
    return window.spBuilder.currentView = view;
  };

  $(function() {
    return $('[data-swatch-nav]').on('click', function() {
      var view;
      view = $(this).attr('data-swatch-nav');
      changeView(view);
      return false;
    });
  });

  $(document).on('swatch:change', function(e, data) {
    var color, instance, ref;
    instance = data.instance, color = data.color;
    $('[data-swatch-picker-label=' + instance + ']').html(color);
    $('#front-' + instance).find('img').attr('src', window.spBuilder.imagePath + 'front-' + instance + '_' + color + '.png');
    $('#back-' + instance).find('img').attr('src', window.spBuilder.imagePath + 'back-' + instance + '_' + color + '.png');
    if ((ref = window.spBuilder.currentView) !== 'front' && ref !== 'back') {
      return changeView('front');
    }
  });

}).call(this);
