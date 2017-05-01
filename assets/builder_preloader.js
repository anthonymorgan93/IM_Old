(function() {
  var preload;

  preload = function(imageObj, idx) {
    var img, index;
    index = idx || 0;
    if (imageObj.assets && imageObj.assets.length > index) {
      img = new Image;
      img.onload = function() {
        return preload(imageObj, index + 1);
      };
      return img.src = imageObj.host + imageObj.path + imageObj.assets[index];
    }
  };

  $(window).on('load', function() {
    return preload({
      host: '//d1liekpayvooaz.cloudfront.net',
      path: '/csg/imperialmotion/images/',
      assets: ['back-body_black.png', 'back-body_charcoal.png', 'back-body_cyan.png', 'back-body_green.png', 'back-body_grey.png', 'back-body_indigo.png', 'back-body_navy.png', 'back-body_olive.png', 'back-body_orange.png', 'back-body_pink.png', 'back-body_red.png', 'back-body_reef.png', 'back-body_white.png', 'back-body_wine.png', 'back-body_yellow.png', 'back-details.png', 'back-forearm_black.png', 'back-forearm_charcoal.png', 'back-forearm_cyan.png', 'back-forearm_green.png', 'back-forearm_grey.png', 'back-forearm_indigo.png', 'back-forearm_navy.png', 'back-forearm_orange.png', 'back-forearm_pink.png', 'back-forearm_red.png', 'back-forearm_reef.png', 'back-forearm_white.png', 'back-forearm_wine.png', 'back-forearm_yellow.png', 'back-sidepanels_black.png', 'back-sidepanels_charcoal.png', 'back-sidepanels_cyan.png', 'back-sidepanels_green.png', 'back-sidepanels_grey.png', 'back-sidepanels_indigo.png', 'back-sidepanels_navy.png', 'back-sidepanels_orange.png', 'back-sidepanels_pink.png', 'back-sidepanels_red.png', 'back-sidepanels_reef.png', 'back-sidepanels_white.png', 'back-sidepanels_wine.png', 'back-sidepanels_yellow.png', 'front-body_black.png', 'front-body_charcoal.png', 'front-body_cyan.png', 'front-body_green.png', 'front-body_grey.png', 'front-body_indigo.png', 'front-body_navy.png', 'front-body_olive.png', 'front-body_orange.png', 'front-body_pink.png', 'front-body_red.png', 'front-body_reef.png', 'front-body_white.png', 'front-body_wine.png', 'front-body_yellow.png', 'front-details.png', 'front-forearm_black.png', 'front-forearm_charcoal.png', 'front-forearm_cyan.png', 'front-forearm_green.png', 'front-forearm_grey.png', 'front-forearm_indigo.png', 'front-forearm_navy.png', 'front-forearm_olive.png', 'front-forearm_orange.png', 'front-forearm_pink.png', 'front-forearm_red.png', 'front-forearm_reef.png', 'front-forearm_white.png', 'front-forearm_wine.png', 'front-forearm_yellow.png', 'front-logos_black.png', 'front-logos_white.png', 'front-sidepanels_black.png', 'front-sidepanels_charcoal.png', 'front-sidepanels_cyan.png', 'front-sidepanels_green.png', 'front-sidepanels_grey.png', 'front-sidepanels_indigo.png', 'front-sidepanels_navy.png', 'front-sidepanels_olive.png', 'front-sidepanels_orange.png', 'front-sidepanels_pink.png', 'front-sidepanels_red.png', 'front-sidepanels_reef.png', 'front-sidepanels_white.png', 'front-sidepanels_wine.png', 'front-sidepanels_yellow.png', 'inside.png', '360-1.jpg', '360-2.jpg', '360-3.jpg', '360-4.jpg', '360-5.jpg', '360-6.jpg']
    });
  });

}).call(this);