(function() {
  (function($) {
    var Spin, bind, clamp, detectSubsampling, load, log, modEvents, name, naturalSize, padNumber, prevent, preventEvents, unbind, wrap;
    padNumber = function(num, length, pad) {
      num = String(num);
      while (num.length < length) {
        num = String(pad) + num;
      }
      return num;
    };
    clamp = function(value, min, max) {
      if (value > max) {
        return max;
      } else if (value < min) {
        return min;
      } else {
        return value;
      }
    };
    wrap = function(value, min, max, size) {
      while (value > max) {
        value -= size;
      }
      while (value < min) {
        value += size;
      }
      return value;
    };
    prevent = function(e) {
      e.preventDefault();
      return false;
    };
    log = function() {
      if (window.console && window.console.log) {
        window.console.log.apply(window.console, arguments);
      }
    };
    bind = function(target, event, func) {
      if (func) {
        target.bind(event + '.' + name, func);
      }
    };
    unbind = function(target) {
      target.unbind('.' + name);
    };
    load = function(opts) {
      var completed, count, firstLoaded, i, images, img, src, targetCount, tick;
      src = typeof opts.source === 'string' ? [opts.source] : opts.source;
      i = void 0;
      count = 0;
      img = void 0;
      images = [];
      targetCount = opts.preloadCount || src.length;
      completed = false;
      firstLoaded = false;
      tick = function() {
        count += 1;
        if (typeof opts.progress === 'function') {
          opts.progress({
            index: $.inArray(this, images),
            loaded: count,
            total: src.length,
            percent: Math.round(count / src.length * 100)
          });
        }
        firstLoaded = firstLoaded || this === images[0];
        if (!completed && count >= targetCount && firstLoaded && typeof opts.complete === 'function') {
          completed = true;
          opts.complete(images);
        }
      };
      i = 0;
      while (i < src.length) {
        img = new Image;
        images.push(img);
        img.onload = img.onabort = img.onerror = tick;
        img.src = src[i];
        i += 1;
      }
      if (typeof opts.initiated === 'function') {
        opts.initiated(images);
      }
    };
    detectSubsampling = function(img, size) {
      var canvas, context, dat, err, ih, iw;
      iw = (size || img).width;
      ih = (size || img).height;
      if (iw * ih <= 1024 * 1024) {
        return false;
      }
      canvas = void 0;
      canvas = document.createElement('canvas');
      if (!canvas || !canvas.getContext) {
        return false;
      }
      context = canvas.getContext('2d');
      if (!context) {
        return false;
      }
      canvas.width = canvas.height = 1;
      context.fillStyle = '#FF00FF';
      context.fillRect(0, 0, 1, 1);
      context.drawImage(img, -iw + 1, 0);
      try {
        dat = context.getImageData(0, 0, 1, 1).data;
        return dat[0] === 255 && dat[1] === 0 && dat[2] === 255;
      } catch (_error) {
        err = _error;
        log(err.message, err.stack);
        return false;
      }
    };
    naturalSize = function(image) {
      var img;
      if (image.naturalWidth !== null) {
        return {
          width: image.naturalWidth,
          height: image.naturalHeight
        };
      }
      img = new Image;
      img.src = image.src;
      return {
        width: img.width,
        height: img.height
      };
    };
    'use strict';
    name = 'image360';
    modEvents = ['mousedown', 'mousemove', 'mouseup', 'mouseenter', 'mouseover', 'mouseleave', 'dblclick', 'touchstart', 'touchmove', 'touchend', 'touchcancel', 'selectstart', 'gesturestart', 'gesturechange', 'gestureend'];
    preventEvents = ['dragstart'];
    Spin = {};

    /**
    	 * @module image360
    	 * @type {object}
     */
    window.image360 = Spin;

    /**
    	 * The namespace that is used to bind functions to DOM events and set the data object to DOM elements
    	 * @type {string}
     */
    Spin.namespace = name;

    /**
    	 * Collection of modules that can be used to extend the functionality of image360.
    	 * @type {object}
     */
    Spin.mods = {};

    /**
    	 * Default set of image360 options. This also represents the majority of data attributes that are used during the
    	 * lifetime of a image360 instance. The data is stored inside the target DOM element on which the plugin is called.
    	 * @type {object}
     */
    Spin.defaults = {
      source: void 0,
      width: void 0,
      height: void 0,
      frames: void 0,
      framesX: void 0,
      lanes: 1,
      sizeMode: void 0,
      module: '360',
      behavior: 'drag',
      renderer: 'canvas',
      lane: 0,
      frame: 0,
      frameTime: 40,
      animate: true,
      reverse: false,
      loop: true,
      stopFrame: 0,
      wrap: true,
      wrapLane: false,
      sense: 1,
      senseLane: void 0,
      orientation: 'horizontal',
      detectSubsampling: true,
      scrollThreshold: 50,
      preloadCount: void 0,
      onInit: void 0,
      onProgress: void 0,
      onLoad: void 0,
      onFrame: void 0,
      onDraw: void 0
    };
    Spin.clamp = clamp;
    Spin.wrap = wrap;

    /**
    	 * Generates an array of source strings
    	 * - path is a source string where the frame number of the file name is exposed as '{frame}'
    	 * - start indicates the first frame number
    	 * - end indicates the last frame number
    	 * - digits is the number of digits used in the file name for the frame number
    	 * @example
    	 *      sourceArray('http://example.com/image_{frame}.jpg, { frame: [1, 3], digits: 2 })
    	 *      // -> [ 'http://example.com/image_01.jpg', 'http://example.com/image_02.jpg', 'http://example.com/image_03.jpg' ]
    	 * @param path
    	 * @param opts
    	 * @returns {Array}
     */
    Spin.sourceArray = function(path, opts) {
      var digits, fEnd, fStart, i, j, lEnd, lStart, result, temp;
      fStart = 0;
      fEnd = 0;
      lStart = 0;
      lEnd = 0;
      digits = opts.digits || 2;
      if (opts.frame) {
        fStart = opts.frame[0];
        fEnd = opts.frame[1];
      }
      if (opts.lane) {
        lStart = opts.lane[0];
        lEnd = opts.lane[1];
      }
      i = void 0;
      j = void 0;
      temp = void 0;
      result = [];
      i = lStart;
      while (i <= lEnd) {
        j = fStart;
      }
      while (j <= fEnd) {
        temp = path.replace('{lane}', padNumber(i, digits, 0));
        temp = temp.replace('{frame}', padNumber(j, digits, 0));
        result.push(temp);
        j += 1;
      }
      i += 1;
      return result;
    };

    /**
    	 * Measures the image frames that are used in the given data object
    	 * @param {object} data
     */
    Spin.measureSource = function(data) {
      var framesY, img, size;
      img = data.images[0];
      size = naturalSize(img);
      if (data.images.length === 1) {
        data.sourceWidth = size.width;
        data.sourceHeight = size.height;
        if (data.detectSubsampling && detectSubsampling(img, size)) {
          data.sourceWidth /= 2;
          data.sourceHeight /= 2;
        }
        data.framesX = data.framesX || data.frames;
        if (!data.frameWidth || !data.frameHeight) {
          if (data.framesX) {
            data.frameWidth = Math.floor(data.sourceWidth / data.framesX);
            framesY = Math.ceil(data.frames * data.lanes / data.framesX);
            data.frameHeight = Math.floor(data.sourceHeight / framesY);
          } else {
            data.frameWidth = size.width;
            data.frameHeight = size.height;
          }
        }
      } else {
        data.sourceWidth = data.frameWidth = size.width;
        data.sourceHeight = data.frameHeight = size.height;
        if (detectSubsampling(img, size)) {
          data.sourceWidth = data.frameWidth = size.width / 2;
          data.sourceHeight = data.frameHeight = size.height / 2;
        }
        data.frames = data.frames || data.images.length;
      }
    };

    /**
    	 * Resets the input state of the image360 data.
    	 * @param {object} data
     */
    Spin.resetInput = function(data) {
      data.startX = data.startY = void 0;
      data.currentX = data.currentY = void 0;
      data.oldX = data.oldY = void 0;
      data.dX = data.dY = data.dW = 0;
      data.ddX = data.ddY = data.ddW = 0;
    };

    /**
    	 * Updates the input state of the image360 data using the given mouse or touch event.
    	 * @param {*} e
    	 * @param {object} data
     */
    Spin.updateInput = function(e, data) {
      if (e.touches === void 0 && e.originalEvent !== void 0) {
        e.touches = e.originalEvent.touches;
      }
      data.oldX = data.currentX;
      data.oldY = data.currentY;
      if (e.touches !== void 0 && e.touches.length > 0) {
        data.currentX = e.touches[0].clientX || 0;
        data.currentY = e.touches[0].clientY || 0;
      } else {
        data.currentX = e.clientX || 0;
        data.currentY = e.clientY || 0;
      }
      if (data.oldX === void 0 || data.oldY === void 0) {
        data.oldX = data.currentX;
        data.oldY = data.currentY;
      }
      if (data.startX === void 0 || data.startY === void 0) {
        data.startX = data.currentX;
        data.startY = data.currentY;
        data.clickframe = data.frame;
        data.clicklane = data.lane;
      }
      data.dX = data.currentX - data.startX;
      data.dY = data.currentY - data.startY;
      data.ddX = data.currentX - data.oldX;
      data.ddY = data.currentY - data.oldY;
      data.ndX = data.dX / data.width;
      data.ndY = data.dY / data.height;
      data.nddX = data.ddX / data.width;
      data.nddY = data.ddY / data.height;
    };

    /**
    	 * Updates the frame number of the image360 data. Performs an auto increment if no frame number is given.
    	 * @param {object} data
    	 * @param {number} [frame]
    	 * @param {number} [lane]
     */
    Spin.updateFrame = function(data, frame, lane) {
      if (frame !== void 0) {
        data.frame = Number(frame);
      } else if (data.animation) {
        data.frame += data.reverse ? -1 : 1;
      }
      if (data.animation) {
        data.frame = wrap(data.frame, 0, data.frames - 1, data.frames);
        if (!data.loop && data.frame === data.stopFrame) {
          Spin.stopAnimation(data);
        }
      } else if (data.wrap) {
        data.frame = wrap(data.frame, 0, data.frames - 1, data.frames);
      } else {
        data.frame = clamp(data.frame, 0, data.frames - 1);
      }
      if (lane !== void 0) {
        data.lane = lane;
        if (data.wrapLane) {
          data.lane = wrap(data.lane, 0, data.lanes - 1, data.lanes);
        } else {
          data.lane = clamp(data.lane, 0, data.lanes - 1);
        }
      }
      data.target.trigger('onFrame', data);
      data.target.trigger('onDraw', data);
    };

    /**
    	 * Stops the running animation on given image360 data.
    	 * @param {object} data
     */
    Spin.stopAnimation = function(data) {
      data.animate = false;
      if (data.animation) {
        window.clearInterval(data.animation);
        data.animation = null;
      }
    };

    /**
    	 * Starts animation on given image360 data if animation is enabled.
    	 * @param {object} data
     */
    Spin.setAnimation = function(data) {
      if (data.animate) {
        Spin.requestFrame(data);
      } else {
        Spin.stopAnimation(data);
      }
    };
    Spin.requestFrame = function(data) {
      if (data.animation) {
        return;
      }
      if (data.frameFunction === void 0) {
        data.frameFunction = function() {
          var ignore;
          try {
            Spin.updateFrame(data);
          } catch (_error) {
            ignore = _error;
          }
        };
      }
      data.animation = window.setInterval(data.frameFunction, data.frameTime);
    };

    /**
    	 * Replaces module names on given image360 data and replaces them with actual implementations.
    	 * @param {object} data
     */
    Spin.setModules = function(data) {
      var i, mod, modName;
      i = void 0;
      modName = void 0;
      mod = void 0;
      i = 0;
      while (i < data.mods.length) {
        modName = data.mods[i];
        if (typeof modName === 'string') {
          mod = Spin.mods[modName];
          if (mod) {
            data.mods[i] = mod;
          } else {
            $.error('No module found with name ' + modName);
          }
        }
        i += 1;
      }
    };
    Spin.calculateInnerLayout = function(data) {
      var a, a1, css, h, h1, mode, w, w1;
      w = Math.floor(data.width || data.frameWidth || data.target.innerWidth());
      h = Math.floor(data.height || data.frameHeight || data.target.innerHeight());
      a = w / h;
      w1 = data.frameWidth || w;
      h1 = data.frameHeight || h;
      a1 = w1 / h1;
      css = {
        width: '100%',
        height: '100%',
        top: 0,
        left: 0,
        bottom: 0,
        right: 0,
        position: 'absolute',
        overflow: 'hidden'
      };
      mode = data.sizeMode;
      if (!mode || mode === 'scale') {
        return css;
      }
      if (mode === 'original') {
        css.width = w1;
        css.height = h1;
      } else if (mode === 'fit') {
        if (a1 >= a) {
          css.width = w;
          css.height = w / a1;
        } else {
          css.height = h;
          css.width = h * a1;
        }
      } else if (mode === 'fill') {
        if (a1 >= a) {
          css.height = h;
          css.width = h * a1;
        } else {
          css.width = w;
          css.height = w / a1;
        }
      }
      css.width = css.width | 0;
      css.height = css.height | 0;
      css.top = (h - css.height) / 2 | 0;
      css.left = (w - css.width) / 2 | 0;
      css.right = css.left;
      css.bottom = css.top;
      return css;
    };

    /**
    	 * Applies css attributes to layout the image360 containers.
    	 * @param {object} data
     */
    Spin.setLayout = function(data) {
      var css, h, w;
      data.target.attr('unselectable', 'on').css({
        '-ms-user-select': 'none',
        '-moz-user-select': 'none',
        '-khtml-user-select': 'none',
        '-webkit-user-select': 'none',
        'user-select': 'none'
      });
      w = Math.floor(data.width || data.frameWidth || data.target.innerWidth());
      h = Math.floor(data.height || data.frameHeight || data.target.innerHeight());
      data.target.css({
        width: w,
        height: h,
        position: 'relative',
        overflow: 'hidden'
      });
      css = Spin.calculateInnerLayout(data);
      data.stage.css(css).hide();
      if (data.canvas) {
        data.canvas[0].width = w;
        data.canvas[0].height = h;
        data.canvas.css(css).hide();
      }
    };

    /**
    	 * (re)binds all image360 events on the target element
    	 * @param data
     */
    Spin.setEvents = function(data) {
      var i, j, mod, target;
      i = void 0;
      j = void 0;
      mod = void 0;
      target = data.target;
      unbind(target);
      j = 0;
      while (j < preventEvents.length) {
        bind(target, preventEvents[j], prevent);
        j += 1;
      }
      i = 0;
      while (i < data.mods.length) {
        mod = data.mods[i];
        j = 0;
        while (j < modEvents.length) {
          bind(target, modEvents[j], mod[modEvents[j]]);
          j += 1;
        }
        bind(target, 'onInit', mod.onInit);
        bind(target, 'onProgress', mod.onProgress);
        bind(target, 'onLoad', mod.onLoad);
        bind(target, 'onFrame', mod.onFrame);
        bind(target, 'onDraw', mod.onDraw);
        i += 1;
      }
      bind(target, 'onLoad', function(e, data) {
        Spin.setAnimation(data);
      });
      bind(target, 'onInit', data.onInit);
      bind(target, 'onProgress', data.onProgress);
      bind(target, 'onLoad', data.onLoad);
      bind(target, 'onFrame', data.onFrame);
      bind(target, 'onDraw', data.onDraw);
    };

    /**
    	 * Runs the boot process. (re)creates modules, (re)sets the layout, (re)binds all events and loads source images.
    	 * @param {object} data
     */
    Spin.boot = function(data) {
      Spin.setModules(data);
      Spin.setLayout(data);
      Spin.setEvents(data);
      data.target.addClass('loading').trigger('onInit', data);
      data.loading = true;
      load({
        source: data.source,
        preloadCount: data.preloadCount,
        progress: function(progress) {
          data.target.trigger('onProgress', [progress, data]);
        },
        complete: function(images) {
          data.images = images;
          data.loading = false;
          Spin.measureSource(data);
          data.stage.show();
          data.target.removeClass('loading').trigger('onLoad', data).trigger('onFrame', data).trigger('onDraw', data);
        }
      });
    };

    /**
    	 * Initializes the target element with image360 data.
    	 * @param {object} options
     */
    Spin.create = function(options) {
      var $this, canvas, data;
      $this = options.target;
      data = $this.data(name);
      if (!data) {
        data = $.extend({}, Spin.defaults, options);
        data.source = data.source || [];
        $this.find('img').each(function() {
          data.source.push($(this).attr('src'));
        });
        $this.empty().addClass('image360-instance').append('<div class=\'image360-stage\'></div>');
        if (data.renderer === 'canvas') {
          canvas = $('<canvas class=\'image360-canvas\'></canvas>')[0];
          if (!!(canvas.getContext && canvas.getContext('2d'))) {
            data.canvas = $(canvas);
            data.context = canvas.getContext('2d');
            $this.append(data.canvas);
            $this.addClass('with-canvas');
          } else {
            data.renderer = 'image';
          }
        }
        data.target = $this;
        data.stage = $this.find('.image360-stage');
        $this.data(name, data);
      } else {
        $.extend(data, options);
      }
      if (typeof data.source === 'string') {
        data.source = [data.source];
      }
      if (data.mods) {
        delete data.behavior;
        delete data.module;
      }
      if (data.behavior || data.module) {
        data.mods = [];
        if (data.behavior) {
          data.mods.push(data.behavior);
        }
        if (data.module) {
          data.mods.push(data.module);
        }
        delete data.behavior;
        delete data.module;
      }
      Spin.boot(data);
    };

    /**
    	 * Stops running animation, unbinds all events and deletes the data on the target element of the given data object.
    	 * @param {object} data The image360 data object.
     */
    Spin.destroy = function(data) {
      if (data) {
        Spin.stopAnimation(data);
        unbind(data.target);
        data.target.removeData(name);
      }
    };

    /**
    	 * Registers a module implementation as an available extension to image360.
    	 * Use this to add custom Rendering or Updating modules that can be addressed with the 'module' option.
    	 * @param {string} name the name of the module
    	 * @param {object} [module] the module implementation
    	 * @returns {object} the given module
     */
    Spin.registerModule = function(name, module) {
      if (Spin.mods[name]) {
        $.error('Module name is already taken: ' + name);
      }
      module = module || {};
      Spin.mods[name] = module;
      return module;
    };

    /**
    	#
    	 * @param data
    	 * @class image360.Api
    	 * @constructor
     */
    Spin.Api = function(data) {
      this.data = data;
    };

    /**
    	 * Helper method that allows to extend the api with more methods.
    	 * Receives an object with named functions that are extensions to the API.
    	 * @param methods
    	 * @returns {image360.Api.prototype}
     */
    Spin.extendApi = function(methods) {
      var api, key;
      key = void 0;
      api = Spin.Api.prototype;
      for (key in methods) {
        key = key;
        if (methods.hasOwnProperty(key)) {
          if (api[key]) {
            $.error('API method is already defined: ' + key);
          } else {
            api[key] = methods[key];
          }
        }
      }
      return api;
    };

    /**
    	 * Instantiates or updates already created instances of image360 on the nodes in target
    	 * @param {object|string} obj
    	 * @param {*} [value]
    	 * @returns {*}
     */
    $.fn.image360 = function(obj, value) {
      var data, tmp;
      if (obj === 'data') {
        return this.data(name);
      }
      if (obj === 'api') {
        data = this.data(name);
        data.api = data.api || new Spin.Api(data);
        return data.api;
      }
      if (obj === 'destroy') {
        return $(this).each(function() {
          Spin.destroy($(this).data(name));
        });
      }
      if (arguments.length === 2 && typeof obj === 'string') {
        tmp = {};
        tmp[obj] = value;
        obj = tmp;
      }
      if (typeof obj === 'object') {
        obj.target = obj.target || $(this);
        Spin.create(obj);
        return obj.target;
      }
      return $.error('Invalid call to image360');
    };
  })(window.jQuery || window.Zepto || window.$);

  (function($) {
    'use strict';
    var image360;
    image360 = window.image360;
    image360.extendApi({
      isPlaying: function() {
        return this.data.animation !== null;
      },
      isLooping: function() {
        return this.data.loop;
      },
      toggleAnimation: function() {
        this.data.animate = !this.data.animate;
        image360.setAnimation(this.data);
      },
      stopAnimation: function() {
        this.data.animate = false;
        image360.setAnimation(this.data);
      },
      startAnimation: function() {
        this.data.animate = true;
        image360.setAnimation(this.data);
      },
      loop: function(value) {
        this.data.loop = value;
        image360.setAnimation(this.data);
        return this;
      },
      currentFrame: function() {
        return this.data.frame;
      },
      updateFrame: function(frame) {
        image360.updateFrame(this.data, frame);
        return this;
      },
      skipFrames: function(step) {
        var data;
        data = this.data;
        image360.updateFrame(data, data.frame + (data.reverse ? -step : +step));
        return this;
      },
      nextFrame: function() {
        return this.skipFrames(1);
      },
      prevFrame: function() {
        return this.skipFrames(-1);
      },
      playTo: function(frame, options) {
        var a, b, c, data;
        data = this.data;
        options = options || {};
        if (!options.force && data.frame === frame) {
          return;
        }
        if (options.nearest) {
          a = frame - data.frame;
          b = frame > data.frame ? a - data.frames : a + data.frames;
          c = Math.abs(a) < Math.abs(b) ? a : b;
          data.reverse = c < 0;
        }
        data.animate = true;
        data.loop = false;
        data.stopFrame = frame;
        image360.setAnimation(data);
        return this;
      }
    });
  })(window.jQuery || window.Zepto || window.$);

  (function($) {
    var bindChangeEvent, changeEvent, exitFullscreen, fn, fullscreenElement, fullscreenEnabled, image360, isFullscreen, requestFullscreen, unbindChangeEvent;
    requestFullscreen = function(e) {
      e = e || document.documentElement;
      e[fn.requestFullscreen]();
    };
    exitFullscreen = function() {
      return document[fn.exitFullscreen]();
    };
    fullscreenEnabled = function() {
      return document[fn.fullscreenEnabled];
    };
    fullscreenElement = function() {
      return document[fn.fullscreenElement];
    };
    isFullscreen = function() {
      return !!fullscreenElement();
    };
    unbindChangeEvent = function() {
      $(document).unbind(changeEvent);
    };
    bindChangeEvent = function(callback) {
      unbindChangeEvent();
      $(document).bind(changeEvent, callback);
    };
    'use strict';
    fn = (function() {
      var fnMap, i, l, ret, val, valLength;
      val = void 0;
      valLength = void 0;
      fnMap = [['requestFullscreen', 'exitFullscreen', 'fullscreenElement', 'fullscreenEnabled', 'fullscreenchange', 'fullscreenerror'], ['webkitRequestFullscreen', 'webkitExitFullscreen', 'webkitFullscreenElement', 'webkitFullscreenEnabled', 'webkitfullscreenchange', 'webkitfullscreenerror'], ['webkitRequestFullScreen', 'webkitCancelFullScreen', 'webkitCurrentFullScreenElement', 'webkitCancelFullScreen', 'webkitfullscreenchange', 'webkitfullscreenerror'], ['mozRequestFullScreen', 'mozCancelFullScreen', 'mozFullScreenElement', 'mozFullScreenEnabled', 'mozfullscreenchange', 'mozfullscreenerror'], ['msRequestFullscreen', 'msExitFullscreen', 'msFullscreenElement', 'msFullscreenEnabled', 'MSFullscreenChange', 'MSFullscreenError']];
      i = 0;
      l = fnMap.length;
      ret = {};
      while (i < l) {
        val = fnMap[i];
        if (val && val[1] in document) {
          i = 0;
          valLength = val.length;
          while (i < valLength) {
            ret[fnMap[0][i]] = val[i];
            i++;
          }
          return ret;
        }
        i++;
      }
      return false;
    })();
    image360 = window.image360;
    changeEvent = fn.fullscreenchange + '.' + image360.namespace;
    image360.extendApi({
      fullscreenEnabled: fullscreenEnabled,
      fullscreenElement: fullscreenElement,
      exitFullscreen: exitFullscreen,
      toggleFullscreen: function(opts) {
        if (isFullscreen()) {
          this.requestFullscreen(opts);
        } else {
          this.exitFullscreen();
        }
      },
      requestFullscreen: function(opts) {
        var api, data, oHeight, oSource, oWidth;
        opts = opts || {};
        api = this;
        data = api.data;
        oWidth = data.width;
        oHeight = data.height;
        oSource = data.source;
        bindChangeEvent(function() {
          if (isFullscreen()) {
            data.width = window.screen.width;
            data.height = window.screen.height;
            data.source = opts.source || oSource;
            image360.boot(data);
          } else {
            unbindChangeEvent();
            data.width = oWidth;
            data.height = oHeight;
            data.source = oSource;
            image360.boot(data);
          }
        });
        requestFullscreen(data.target[0]);
      }
    });
  })(window.jQuery || window.Zepto || window.$);

  (function($, image360) {
    var click;
    click = function(e) {
      var $this, data, half, pos;
      $this = $(this);
      data = $this.data('image360');
      image360.updateInput(e, data);
      half = void 0;
      pos = void 0;
      if (data.orientation === 'horizontal') {
        half = data.target.innerWidth() / 2;
        pos = data.currentX - (data.target.offset().left);
      } else {
        half = data.target.innerHeight() / 2;
        pos = data.currentY - (data.target.offset().top);
      }
      if (pos > half) {
        $this.image360('next');
      } else {
        $this.image360('prev');
      }
    };
    'use strict';
    image360.registerModule('click', {
      mouseup: click,
      touchend: click
    });
  })(window.jQuery || window.Zepto || window.$, window.image360);

  (function($, image360) {
    var drag, dragEnd, dragStart;
    dragStart = function(e) {
      var data;
      data = $(this).image360('data');
      if (data.loading || data.dragging || !data.stage.is(':visible')) {
        return;
      }
      data.dragFrame = data.frame || 0;
      data.dragLane = data.lane || 0;
      image360.updateInput(e, data);
      data.dragging = true;
    };
    dragEnd = function(e) {
      var $this, data;
      $this = $(this);
      data = $this.image360('data');
      data.dragging = false;
      if (data.stage.is(':visible')) {
        image360.resetInput(data);
      }
    };
    drag = function(e) {
      var $this, angle, cs, data, frame, lane, sn, x, y;
      lane = void 0;
      frame = void 0;
      $this = $(this);
      data = $this.image360('data');
      if (!data.dragging) {
        return;
      }
      image360.updateInput(e, data);
      if (Math.abs(data.ddY) > Math.abs(data.ddX)) {
        return;
      }
      e.preventDefault();
      angle = 0;
      if (typeof data.orientation === 'number') {
        angle = (Number(data.orientation) || 0) * Math.PI / 180;
      } else if (data.orientation === 'horizontal') {
        angle = 0;
      } else {
        angle = Math.PI / 2;
      }
      sn = Math.sin(angle);
      cs = Math.cos(angle);
      x = (data.nddX * cs - (data.nddY * sn)) * data.sense || 0;
      y = (data.nddX * sn + data.nddY * cs) * (data.senseLane || data.sense) || 0;
      data.dragFrame += data.frames * x;
      data.dragLane += data.lanes * y;
      if (!data.wrap) {
        data.dragFrame = Math.min(data.dragFrame, data.frames);
        data.dragFrame = Math.max(data.dragFrame, 0);
      }
      if (!data.wrapLane) {
        data.dragLane = Math.min(data.dragLane, data.lanes);
        data.dragLane = Math.max(data.dragLane, 0);
      }
      frame = Math.floor(data.dragFrame);
      lane = Math.floor(data.dragLane);
      image360.updateFrame(data, frame, lane);
      image360.stopAnimation(data);
    };
    'use strict';
    image360.registerModule('drag', {
      mousedown: dragStart,
      mousemove: drag,
      mouseup: dragEnd,
      touchstart: dragStart,
      touchmove: drag,
      touchend: dragEnd
    });
    image360.registerModule('move', {
      mousemove: function(e) {
        dragStart.call(this, e);
        drag.call(this, e);
      },
      mouseleave: dragEnd,
      touchstart: dragStart,
      touchmove: drag,
      touchend: dragEnd,
      touchcancel: dragEnd
    });
  })(window.jQuery || window.Zepto || window.$, window.image360);

  (function($, image360) {
    var startAnimation, stopAnimation, updateInput;
    startAnimation = function(e) {
      var $this, data;
      $this = $(this);
      data = $this.image360('data');
      if (data.loading) {
        return;
      }
      image360.updateInput(e, data);
      data.dragging = true;
      $this.image360('api').startAnimation();
    };
    stopAnimation = function(e) {
      var $this, data;
      $this = $(this);
      data = $this.image360('data');
      image360.resetInput(data);
      data.dragging = false;
      $this.image360('api').stopAnimation();
    };
    updateInput = function(e) {
      var $this, data, delta, half;
      $this = $(this);
      data = $this.image360('data');
      if (data.dragging) {
        image360.updateInput(e, data);
        half = void 0;
        delta = void 0;
        if (data.orientation === 'horizontal') {
          half = data.target.innerWidth() / 2;
          delta = (data.currentX - (data.target.offset().left) - half) / half;
        } else {
          half = data.height / 2;
          delta = (data.currentY - (data.target.offset().top) - half) / half;
        }
        data.reverse = delta < 0;
        delta = delta < 0 ? -delta : delta;
        data.frameTime = 80 * (1 - delta) + 20;
        if (data.orientation === 'horizontal' && data.dX < data.dY || data.orientation === 'vertical' && data.dX < data.dY) {
          e.preventDefault();
        }
      }
    };
    'use strict';
    image360.registerModule('hold', {
      mousedown: startAnimation,
      mousemove: updateInput,
      mouseup: stopAnimation,
      mouseleave: stopAnimation,
      touchstart: startAnimation,
      touchmove: updateInput,
      touchend: stopAnimation,
      touchcancel: stopAnimation,
      onFrame: function() {
        $(this).image360('api').startAnimation();
      }
    });
  })(window.jQuery || window.Zepto || window.$, window.image360);

  (function($, image360) {
    var drag, dragEnd, dragStart;
    dragStart = function(e) {
      var data;
      data = $(this).image360('data');
      if (data.loading) {
        return;
      }
      image360.updateInput(e, data);
      data.dragging = true;
    };
    dragEnd = function() {
      var data;
      data = $(this).image360('data');
      data.dragging = false;
      image360.resetInput(data);
    };
    drag = function(e) {
      var $this, d, data, frame, s, snap;
      $this = $(this);
      data = $this.image360('data');
      if (data.dragging) {
        image360.updateInput(e, data);
        frame = data.frame;
        snap = data.snap || 0.25;
        d = void 0;
        s = void 0;
        if (data.orientation === 'horizontal') {
          d = data.dX;
          s = data.target.innerWidth() * snap;
        } else {
          d = data.dY;
          s = data.target.innerHeight() * snap;
        }
        if (d > s) {
          frame = data.frame - 1;
          data.dragging = false;
        } else if (d < -s) {
          frame = data.frame + 1;
          data.dragging = false;
        }
        $this.image360('update', frame);
        $this.image360('animate', false);
        if (data.orientation === 'horizontal' && data.dX < data.dY || data.orientation === 'vertical' && data.dX < data.dY) {
          e.preventDefault();
        }
      }
    };
    'use strict';
    image360.registerModule('swipe', {
      mousedown: dragStart,
      mousemove: drag,
      mouseup: dragEnd,
      mouseleave: dragEnd,
      touchstart: dragStart,
      touchmove: drag,
      touchend: dragEnd,
      touchcancel: dragEnd
    });
  })(window.jQuery || window.Zepto || window.$, window.image360);

  (function($, image360) {
    var drawFrames, drawSprite, floor;
    drawSprite = function(data) {
      var index, x, y;
      index = data.lane * data.frames + data.frame;
      x = data.frameWidth * index % data.framesX;
      y = data.frameHeight * floor(index / data.framesX);
      if (data.renderer === 'canvas') {
        data.context.clearRect(0, 0, data.width, data.height);
        data.context.drawImage(data.images[0], x, y, data.frameWidth, data.frameHeight, 0, 0, data.width, data.height);
        return;
      }
      x = -floor(x * data.scaleWidth);
      y = -floor(y * data.scaleHeight);
      if (data.renderer === 'background') {
        data.stage.css({
          'background-image': ['url(\'', data.source[0], '\')'].join(''),
          'background-position': [x, 'px ', y, 'px'].join('')
        });
      } else {
        $(data.images).css({
          top: y,
          left: x
        });
      }
    };
    drawFrames = function(data) {
      var img, index;
      index = data.lane * data.frames + data.frame;
      img = data.images[index];
      if (data.renderer === 'canvas') {
        if (img && img.complete !== false) {
          data.context.clearRect(0, 0, data.width, data.height);
          data.context.drawImage(img, 0, 0, data.width, data.height);
        }
      } else if (data.renderer === 'background') {
        data.stage.css({
          'background-image': ['url(\'', data.source[index], '\')'].join(''),
          'background-position': [0, 'px ', 0, 'px'].join('')
        });
      } else {
        $(data.images).hide();
        $(data.images[index]).show();
      }
    };
    'use strict';
    floor = Math.floor;
    image360.registerModule('360', {
      onLoad: function(e, data) {
        var background, h, w;
        w = void 0;
        h = void 0;
        data.scaleWidth = data.width / data.frameWidth;
        data.scaleHeight = data.height / data.frameHeight;
        data.sourceIsSprite = data.images.length === 1;
        data.stage.empty().css({
          'background-image': 'none'
        }).show();
        if (data.renderer === 'canvas') {
          data.context.clearRect(0, 0, data.width, data.height);
          data.canvas.show();
        } else if (data.renderer === 'background') {
          if (data.sourceIsSprite) {
            w = floor(data.sourceWidth * data.scaleWidth);
            h = floor(data.sourceHeight * data.scaleHeight);
          } else {
            w = floor(data.frameWidth * data.scaleWidth);
            h = floor(data.frameHeight * data.scaleHeight);
          }
          background = [w, 'px ', h, 'px'].join('');
          data.stage.css({
            'background-repeat': 'no-repeat',
            '-webkit-background-size': background,
            '-moz-background-size': background,
            '-o-background-size': background,
            'background-size': background
          });
        } else if (data.renderer === 'image') {
          if (data.sourceIsSprite) {
            w = floor(data.sourceWidth * data.scaleWidth);
            h = floor(data.sourceHeight * data.scaleHeight);
          } else {
            w = h = '100%';
          }
          $(data.images).appendTo(data.stage).css({
            width: w,
            height: h,
            position: 'absolute'
          });
        }
      },
      onDraw: function(e, data) {
        if (data.sourceIsSprite) {
          drawSprite(data);
        } else {
          drawFrames(data);
        }
      }
    });
  })(window.jQuery || window.Zepto || window.$, window.image360);

  (function($) {
    'use strict';
    var Module;
    Module = window.image360.mods.gallery = {};
    Module.onLoad = function(e, data) {
      var i, img, size;
      data.images = [];
      data.offsets = [];
      data.stage.empty();
      data.speed = 500;
      data.opacity = 0.25;
      data.oldFrame = 0;
      size = 0;
      i = void 0;
      i = 0;
      while (i < data.source.length) {
        img = $('<img src=\'' + data.source[i] + '\'/>');
        data.stage.append(img);
        data.images.push(img);
        data.offsets.push(-size + (data.width - img[0].width) / 2);
        size += img[0].width;
        img.css({
          opacity: 0.25
        });
        i += 1;
      }
      data.stage.css({
        width: size
      });
      data.images[data.oldFrame].animate({
        opacity: 1
      }, data.speed);
    };
    Module.onDraw = function(e, data) {
      if (data.oldFrame !== data.frame && data.offsets) {
        data.stage.stop(true, false);
        data.stage.animate({
          'left': data.offsets[data.frame]
        }, data.speed);
        data.images[data.oldFrame].animate({
          opacity: data.opacity
        }, data.speed);
        data.oldFrame = data.frame;
        data.images[data.oldFrame].animate({
          opacity: 1
        }, data.speed);
      } else {
        data.stage.css({
          'left': data.offsets[data.frame] + data.dX
        });
      }
    };
    Module.resetInput = function(e, data) {
      if (!data.onDrag) {
        data.stage.animate({
          'left': data.offsets[data.frame]
        });
      }
    };
  })(window.jQuery || window.Zepto || window.$);

  (function($, image360) {
    'use strict';
    var floor;
    floor = Math.floor;
    image360.registerModule('panorama', {
      onLoad: function(e, data) {
        var background, h, w;
        data.stage.empty().show();
        data.frames = data.sourceWidth;
        if (data.orientation === 'horizontal') {
          data.scale = data.height / data.sourceHeight;
          data.frames = data.sourceWidth;
        } else {
          data.scale = data.width / data.sourceWidth;
          data.frames = data.sourceHeight;
        }
        w = floor(data.sourceWidth * data.scale);
        h = floor(data.sourceHeight * data.scale);
        background = [w, 'px ', h, 'px'].join('');
        data.stage.css({
          'background-image': ['url(\'', data.source[0], '\')'].join(''),
          'background-repeat': 'repeat-both',
          '-webkit-background-size': background,
          '-moz-background-size': background,
          '-o-background-size': background,
          'background-size': background
        });
      },
      onDraw: function(e, data) {
        var x, y;
        x = 0;
        y = 0;
        if (data.orientation === 'horizontal') {
          x = -floor(data.frame % data.frames * data.scale);
        } else {
          y = -floor(data.frame % data.frames * data.scale);
        }
        data.stage.css({
          'background-position': [x, 'px ', y, 'px'].join('')
        });
      }
    });
  })(window.jQuery || window.Zepto || window.$, window.image360);

  (function($, image360) {
    var onclick, onmove, updateInput;
    updateInput = function(e, data) {
      var dx, dy, x, y;
      e.preventDefault();
      data.dragging = false;
      if (!e.touches && e.originalEvent) {
        e.touches = e.originalEvent.touches;
      }
      x = void 0;
      y = void 0;
      dx = void 0;
      dy = void 0;
      if (e.touches && e.touches.length) {
        x = e.touches[0].clientX || 0;
        y = e.touches[0].clientY || 0;
      } else {
        x = e.clientX || 0;
        y = e.clientY || 0;
      }
      x /= data.width;
      y /= data.height;
      if (data.zoomPX === null) {
        data.zoomPX = x;
        data.zoomPY = y;
      }
      if (data.zoomX === null) {
        data.zoomX = x;
        data.zoomY = y;
      }
      dx = x - data.zoomPX;
      dy = y - data.zoomPY;
      data.zoomPX = x;
      data.zoomPY = y;
      if (e.type.match(/touch/)) {
        dx = -dx;
        dy = -dy;
      }
      data.zoomX = image360.clamp(data.zoomX + dx, 0, 1);
      data.zoomY = image360.clamp(data.zoomY + dy, 0, 1);
      image360.updateFrame(data);
    };
    onclick = function(e) {
      var data, now, timeDelta;
      e.preventDefault();
      data = $(this).image360('data');
      now = (new Date).getTime();
      delete data.zoomPX;
      delete data.zoomPY;
      if (!data.zoomClickTime) {
        data.zoomClickTime = now;
        return;
      }
      timeDelta = now - data.zoomClickTime;
      if (timeDelta > 500) {
        data.zoomClickTime = now;
        return;
      }
      data.zoomClickTime = 0;
      if ($(this).image360('api').toggleZoom()) {
        updateInput(e, data);
      }
    };
    onmove = function(e) {
      var data;
      data = $(this).image360('data');
      if (!data.zoomStage.is(':visible')) {
        return;
      }
      updateInput(e, data);
    };
    'use strict';
    image360.registerModule('zoom', {
      mousedown: onclick,
      touchstart: onclick,
      mousemove: onmove,
      touchmove: onmove,
      onInit: function(e, data) {
        if (!data.zoomStage) {
          data.zoomStage = $('<div class=\'spritezoom-stage\'></div>').css({
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute'
          }).appendTo(data.target).hide();
        }
      },
      onDraw: function(e, data) {
        var index, source, x, y;
        index = data.lane * data.frames + data.frame;
        source = data.source[index];
        if (data.zoomSource) {
          source = data.zoomSource[index];
        }
        if (!source) {
          return;
        }
        x = data.zoomX;
        y = data.zoomY;
        if (x === null || y === null) {
          x = data.zoomX = 0.5;
          y = data.zoomY = 0.5;
        }
        data.zoomStage.css({
          'background-repeat': 'no-repeat',
          'background-image': ['url(\'', source, '\')'].join(''),
          'background-position': [x * 100 | 0, '% ', y * 100 | 0, '%'].join('')
        });
      }
    });
    image360.extendApi({
      toggleZoom: function() {
        var data;
        data = this.data;
        if (!data.zoomStage) {
          $.error('zoom module is not initialized or is not available.');
          return false;
        }
        if (data.zoomStage.is(':visible')) {
          data.zoomStage.fadeOut();
          data.stage.fadeIn();
        } else {
          data.zoomStage.fadeIn();
          data.stage.fadeOut();
          return true;
        }
        return false;
      }
    });
  })(window.jQuery || window.Zepto || window.$, window.image360);

}).call(this);
