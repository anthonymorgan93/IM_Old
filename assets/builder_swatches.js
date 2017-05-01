(function() {
  var Swatch, SwatchPicker;

  SwatchPicker = (function() {
    SwatchPicker.prototype.selectSwatch = function(color) {
      $.each(this.swatches, function() {
        $(this).removeClass('selected');
        if ($(this).find('a').hasClass(color)) {
          return $(this).addClass('selected');
        }
      });
      this.selected = color;
      this.$shopifyLineItemProperty.val(color);
      return $(document).trigger('swatch:change', {
        instance: this.instance,
        color: color
      });
    };

    function SwatchPicker(container, config) {
      var $container, $picker, color, i, len, ref, ref1;
      this.container = container;
      this.selected = null;
      $container = $(this.container);
      if ((ref = config.colors) != null ? ref.length : void 0) {
        this.colors = config.colors.split(',');
      } else {
        this.colors = ['black', 'white', 'grey', 'charcoal', 'cyan', 'green', 'indigo', 'navy', 'olive', 'orange', 'pink', 'red', 'reef', 'wine', 'yellow'];
      }
      this.instance = config.instance;
      this.swatches = [];
      $picker = $('<ul class="swatches"></ul>');
      $picker.on('swatch:selected', (function(_this) {
        return function(e, data) {
          var newColor;
          e.stopPropagation();
          newColor = data.color;
          if (newColor === _this.selected) {
            return;
          }
          return _this.selectSwatch(newColor);
        };
      })(this));
      ref1 = this.colors;
      for (i = 0, len = ref1.length; i < len; i++) {
        color = ref1[i];
        this.swatches.push(Swatch(color));
      }
      $picker.append(this.swatches);
      $container.append($picker);
      this.$shopifyLineItemProperty = $('<input type="hidden" name="properties[' + this.instance + ' color]" />');
      $container.append(this.$shopifyLineItemProperty);
      if (config["default"]) {
        this.selectSwatch(config["default"]);
      }
    }

    return SwatchPicker;

  })();

  Swatch = function(color) {
    var $elem;
    $elem = $('<li></li>');
    $elem.on('click', function(e) {
      e.preventDefault();
      return $elem.trigger('swatch:selected', {
        color: color
      });
    });
    return $elem.append('<a href="#" class="swatch ' + color + '"></a>');
  };

  $(function() {
    return $('[data-swatch-picker]').each(function() {
      return new SwatchPicker(this, {
        instance: $(this).attr('data-swatch-picker'),
        "default": $(this).attr('data-swatch-picker-default'),
        colors: $(this).attr('data-swatch-picker-colors')
      });
    });
  });

}).call(this);