import "./chunk-PLDDJCW6.js";

// node_modules/lightgallery/plugins/autoplay/lg-autoplay.es5.js
var __assign = function() {
  __assign = Object.assign || function __assign2(t) {
    for (var s, i = 1, n = arguments.length; i < n; i++) {
      s = arguments[i];
      for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
    }
    return t;
  };
  return __assign.apply(this, arguments);
};
var lGEvents = {
  afterAppendSlide: "lgAfterAppendSlide",
  init: "lgInit",
  hasVideo: "lgHasVideo",
  containerResize: "lgContainerResize",
  updateSlides: "lgUpdateSlides",
  afterAppendSubHtml: "lgAfterAppendSubHtml",
  beforeOpen: "lgBeforeOpen",
  afterOpen: "lgAfterOpen",
  slideItemLoad: "lgSlideItemLoad",
  beforeSlide: "lgBeforeSlide",
  afterSlide: "lgAfterSlide",
  posterClick: "lgPosterClick",
  dragStart: "lgDragStart",
  dragMove: "lgDragMove",
  dragEnd: "lgDragEnd",
  beforeNextSlide: "lgBeforeNextSlide",
  beforePrevSlide: "lgBeforePrevSlide",
  beforeClose: "lgBeforeClose",
  afterClose: "lgAfterClose",
  rotateLeft: "lgRotateLeft",
  rotateRight: "lgRotateRight",
  flipHorizontal: "lgFlipHorizontal",
  flipVertical: "lgFlipVertical",
  autoplay: "lgAutoplay",
  autoplayStart: "lgAutoplayStart",
  autoplayStop: "lgAutoplayStop"
};
var autoplaySettings = {
  autoplay: true,
  slideShowAutoplay: false,
  slideShowInterval: 5e3,
  progressBar: true,
  forceSlideShowAutoplay: false,
  autoplayControls: true,
  appendAutoplayControlsTo: ".lg-toolbar",
  autoplayPluginStrings: {
    toggleAutoplay: "Toggle Autoplay"
  }
};
var Autoplay = (
  /** @class */
  (function() {
    function Autoplay2(instance) {
      this.core = instance;
      this.settings = __assign(__assign({}, autoplaySettings), this.core.settings);
      return this;
    }
    Autoplay2.prototype.init = function() {
      var _this = this;
      if (!this.settings.autoplay) {
        return;
      }
      this.interval = false;
      this.fromAuto = true;
      this.pausedOnTouchDrag = false;
      this.pausedOnSlideChange = false;
      if (this.settings.autoplayControls) {
        this.controls();
      }
      if (this.settings.progressBar) {
        this.core.outer.append('<div class="lg-progress-bar"><div class="lg-progress"></div></div>');
      }
      if (this.settings.slideShowAutoplay) {
        this.core.LGel.once(lGEvents.slideItemLoad + ".autoplay", function() {
          _this.startAutoPlay();
        });
      }
      this.core.LGel.on(lGEvents.dragStart + ".autoplay touchstart.lg.autoplay", function() {
        if (_this.interval) {
          _this.stopAutoPlay();
          _this.pausedOnTouchDrag = true;
        }
      });
      this.core.LGel.on(lGEvents.dragEnd + ".autoplay touchend.lg.autoplay", function() {
        if (!_this.interval && _this.pausedOnTouchDrag) {
          _this.startAutoPlay();
          _this.pausedOnTouchDrag = false;
        }
      });
      this.core.LGel.on(lGEvents.beforeSlide + ".autoplay", function() {
        _this.showProgressBar();
        if (!_this.fromAuto && _this.interval) {
          _this.stopAutoPlay();
          _this.pausedOnSlideChange = true;
        } else {
          _this.pausedOnSlideChange = false;
        }
        _this.fromAuto = false;
      });
      this.core.LGel.on(lGEvents.afterSlide + ".autoplay", function() {
        if (_this.pausedOnSlideChange && !_this.interval && _this.settings.forceSlideShowAutoplay) {
          _this.startAutoPlay();
          _this.pausedOnSlideChange = false;
        }
      });
      this.showProgressBar();
    };
    Autoplay2.prototype.showProgressBar = function() {
      var _this = this;
      if (this.settings.progressBar && this.fromAuto) {
        var _$progressBar_1 = this.core.outer.find(".lg-progress-bar");
        var _$progress_1 = this.core.outer.find(".lg-progress");
        if (this.interval) {
          _$progress_1.removeAttr("style");
          _$progressBar_1.removeClass("lg-start");
          setTimeout(function() {
            _$progress_1.css("transition", "width " + (_this.core.settings.speed + _this.settings.slideShowInterval) + "ms ease 0s");
            _$progressBar_1.addClass("lg-start");
          }, 20);
        }
      }
    };
    Autoplay2.prototype.controls = function() {
      var _this = this;
      var _html = '<button aria-label="' + this.settings.autoplayPluginStrings["toggleAutoplay"] + '" type="button" class="lg-autoplay-button lg-icon"></button>';
      this.core.outer.find(this.settings.appendAutoplayControlsTo).append(_html);
      this.core.outer.find(".lg-autoplay-button").first().on("click.lg.autoplay", function() {
        if (_this.core.outer.hasClass("lg-show-autoplay")) {
          _this.stopAutoPlay();
        } else {
          if (!_this.interval) {
            _this.startAutoPlay();
          }
        }
      });
    };
    Autoplay2.prototype.startAutoPlay = function() {
      var _this = this;
      this.core.outer.find(".lg-progress").css("transition", "width " + (this.core.settings.speed + this.settings.slideShowInterval) + "ms ease 0s");
      this.core.outer.addClass("lg-show-autoplay");
      this.core.outer.find(".lg-progress-bar").addClass("lg-start");
      this.core.LGel.trigger(lGEvents.autoplayStart, {
        index: this.core.index
      });
      this.interval = setInterval(function() {
        if (_this.core.index + 1 < _this.core.galleryItems.length) {
          _this.core.index++;
        } else {
          _this.core.index = 0;
        }
        _this.core.LGel.trigger(lGEvents.autoplay, {
          index: _this.core.index
        });
        _this.fromAuto = true;
        _this.core.slide(_this.core.index, false, false, "next");
      }, this.core.settings.speed + this.settings.slideShowInterval);
    };
    Autoplay2.prototype.stopAutoPlay = function() {
      if (this.interval) {
        this.core.LGel.trigger(lGEvents.autoplayStop, {
          index: this.core.index
        });
        this.core.outer.find(".lg-progress").removeAttr("style");
        this.core.outer.removeClass("lg-show-autoplay");
        this.core.outer.find(".lg-progress-bar").removeClass("lg-start");
      }
      clearInterval(this.interval);
      this.interval = false;
    };
    Autoplay2.prototype.closeGallery = function() {
      this.stopAutoPlay();
    };
    Autoplay2.prototype.destroy = function() {
      if (this.settings.autoplay) {
        this.core.outer.find(".lg-progress-bar").remove();
      }
      this.core.LGel.off(".lg.autoplay");
      this.core.LGel.off(".autoplay");
    };
    return Autoplay2;
  })()
);
var lg_autoplay_es5_default = Autoplay;
export {
  lg_autoplay_es5_default as default
};
//# sourceMappingURL=lightgallery_plugins_autoplay.js.map
