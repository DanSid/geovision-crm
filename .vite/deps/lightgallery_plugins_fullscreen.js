import "./chunk-PLDDJCW6.js";

// node_modules/lightgallery/plugins/fullscreen/lg-fullscreen.es5.js
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
var fullscreenSettings = {
  fullScreen: true,
  fullscreenPluginStrings: {
    toggleFullscreen: "Toggle Fullscreen"
  }
};
var FullScreen = (
  /** @class */
  (function() {
    function FullScreen2(instance, $LG) {
      this.core = instance;
      this.$LG = $LG;
      this.settings = __assign(__assign({}, fullscreenSettings), this.core.settings);
      return this;
    }
    FullScreen2.prototype.init = function() {
      var fullScreen = "";
      if (this.settings.fullScreen) {
        if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled && !document.mozFullScreenEnabled && !document.msFullscreenEnabled) {
          return;
        } else {
          fullScreen = '<button type="button" aria-label="' + this.settings.fullscreenPluginStrings["toggleFullscreen"] + '" class="lg-fullscreen lg-icon"></button>';
          this.core.$toolbar.append(fullScreen);
          this.fullScreen();
        }
      }
    };
    FullScreen2.prototype.isFullScreen = function() {
      return document.fullscreenElement || document.mozFullScreenElement || document.webkitFullscreenElement || document.msFullscreenElement;
    };
    FullScreen2.prototype.requestFullscreen = function() {
      var el = document.documentElement;
      if (el.requestFullscreen) {
        el.requestFullscreen();
      } else if (el.msRequestFullscreen) {
        el.msRequestFullscreen();
      } else if (el.mozRequestFullScreen) {
        el.mozRequestFullScreen();
      } else if (el.webkitRequestFullscreen) {
        el.webkitRequestFullscreen();
      }
    };
    FullScreen2.prototype.exitFullscreen = function() {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
    };
    FullScreen2.prototype.fullScreen = function() {
      var _this = this;
      this.$LG(document).on("fullscreenchange.lg.global" + this.core.lgId + " \n            webkitfullscreenchange.lg.global" + this.core.lgId + " \n            mozfullscreenchange.lg.global" + this.core.lgId + " \n            MSFullscreenChange.lg.global" + this.core.lgId, function() {
        if (!_this.core.lgOpened)
          return;
        _this.core.outer.toggleClass("lg-fullscreen-on");
      });
      this.core.outer.find(".lg-fullscreen").first().on("click.lg", function() {
        if (_this.isFullScreen()) {
          _this.exitFullscreen();
        } else {
          _this.requestFullscreen();
        }
      });
    };
    FullScreen2.prototype.closeGallery = function() {
      if (this.isFullScreen()) {
        this.exitFullscreen();
      }
    };
    FullScreen2.prototype.destroy = function() {
      this.$LG(document).off("fullscreenchange.lg.global" + this.core.lgId + " \n            webkitfullscreenchange.lg.global" + this.core.lgId + " \n            mozfullscreenchange.lg.global" + this.core.lgId + " \n            MSFullscreenChange.lg.global" + this.core.lgId);
    };
    return FullScreen2;
  })()
);
var lg_fullscreen_es5_default = FullScreen;
export {
  lg_fullscreen_es5_default as default
};
//# sourceMappingURL=lightgallery_plugins_fullscreen.js.map
