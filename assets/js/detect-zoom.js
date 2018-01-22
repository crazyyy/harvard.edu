/* Detect-zoom
 * -----------
 * Cross Browser Zoom and Pixel Ratio Detector
 * Version 1.0.4 | Apr 1 2013
 * dual-licensed under the WTFPL and MIT license
 * Maintained by https://github/tombigel
 * Original developer https://github.com/yonran
 */

//AMD and CommonJS initialization copied from https://github.com/zohararad/audio5js
(function(root, ns, factory) {
  "use strict";

  if (typeof(module) !== 'undefined' && module.exports) { // CommonJS
    module.exports = factory(ns, root);
  } else if (typeof(define) === 'function' && define.amd) { // AMD
    define("factory", function() {
      return factory(ns, root);
    });
  } else {
    root[ns] = factory(ns, root);
  }

}(window, 'detectZoom', function() {

  /**
   * Use devicePixelRatio if supported by the browser
   * @return {Number}
   * @private
   */
  var devicePixelRatio = function() {
    return window.devicePixelRatio || 1;
  };

  /**
   * Fallback function to set default values
   * @return {Object}
   * @private
   */
  var fallback = function() {
    return {
      zoom: 1,
      devicePxPerCssPx: 1
    };
  };
  /**
   * IE 8 and 9: no trick needed!
   * TODO: Test on IE10 and Windows 8 RT
   * @return {Object}
   * @private
   **/
  var ie8 = function() {
    var zoom = Math.round((screen.deviceXDPI / screen.logicalXDPI) * 100) / 100;
    return {
      zoom: zoom,
      devicePxPerCssPx: zoom * devicePixelRatio()
    };
  };

  /**
   * For IE10 we need to change our technique again...
   * thanks https://github.com/stefanvanburen
   * @return {Object}
   * @private
   */
  var ie10 = function() {
    var zoom = Math.round((document.documentElement.offsetHeight / window.innerHeight) * 100) / 100;
    return {
      zoom: zoom,
      devicePxPerCssPx: zoom * devicePixelRatio()
    };
  };

  /**
   * Mobile WebKit
   * the trick: window.innerWIdth is in CSS pixels, while
   * screen.width and screen.height are in system pixels.
   * And there are no scrollbars to mess up the measurement.
   * @return {Object}
   * @private
   */
  var webkitMobile = function() {
    var deviceWidth = (Math.abs(window.orientation) == 90) ? screen.height : screen.width;
    var zoom = deviceWidth / window.innerWidth;
    return {
      zoom: zoom,
      devicePxPerCssPx: zoom * devicePixelRatio()
    };
  };

  /**
   * Desktop Webkit
   * the trick: an element's clientHeight is in CSS pixels, while you can
   * set its line-height in system pixels using font-size and
   * -webkit-text-size-adjust:none.
   * device-pixel-ratio: http://www.webkit.org/blog/55/high-dpi-web-sites/
   *
   * Previous trick (used before http://trac.webkit.org/changeset/100847):
   * documentElement.scrollWidth is in CSS pixels, while
   * document.width was in system pixels. Note that this is the
   * layout width of the document, which is slightly different from viewport
   * because document width does not include scrollbars and might be wider
   * due to big elements.
   * @return {Object}
   * @private
   */
  var webkit = function() {
    var important = function(str) {
      return str.replace(/;/g, " !important;");
    };

    var div = document.createElement('div');
    div.innerHTML = "1<br>2<br>3<br>4<br>5<br>6<br>7<br>8<br>9<br>0";
    div.setAttribute('style', important('font: 100px/1em sans-serif; -webkit-text-size-adjust: none; text-size-adjust: none; height: auto; width: 1em; padding: 0; overflow: visible;'));

    // The container exists so that the div will be laid out in its own flow
    // while not impacting the layout, viewport size, or display of the
    // webpage as a whole.
    // Add !important and relevant CSS rule resets
    // so that other rules cannot affect the results.
    var container = document.createElement('div');
    container.setAttribute('style', important('width:0; height:0; overflow:hidden; visibility:hidden; position: absolute;'));
    container.appendChild(div);

    document.body.appendChild(container);
    var zoom = 1000 / div.clientHeight;
    zoom = Math.round(zoom * 100) / 100;
    document.body.removeChild(container);

    return {
      zoom: zoom,
      devicePxPerCssPx: zoom * devicePixelRatio()
    };
  };

  /**
   * no real trick; device-pixel-ratio is the ratio of device dpi / css dpi.
   * (Note that this is a different interpretation than Webkit's device
   * pixel ratio, which is the ratio device dpi / system dpi).
   *
   * Also, for Mozilla, there is no difference between the zoom factor and the device ratio.
   *
   * @return {Object}
   * @private
   */
  var firefox4 = function() {
    var zoom = mediaQueryBinarySearch('min--moz-device-pixel-ratio', '', 0, 10, 20, 0.0001);
    zoom = Math.round(zoom * 100) / 100;
    return {
      zoom: zoom,
      devicePxPerCssPx: zoom
    };
  };

  /**
   * Firefox 18.x
   * Mozilla added support for devicePixelRatio to Firefox 18,
   * but it is affected by the zoom level, so, like in older
   * Firefox we can't tell if we are in zoom mode or in a device
   * with a different pixel ratio
   * @return {Object}
   * @private
   */
  var firefox18 = function() {
    return {
      zoom: firefox4().zoom,
      devicePxPerCssPx: devicePixelRatio()
    };
  };

  /**
   * works starting Opera 11.11
   * the trick: outerWidth is the viewport width including scrollbars in
   * system px, while innerWidth is the viewport width including scrollbars
   * in CSS px
   * @return {Object}
   * @private
   */
  var opera11 = function() {
    var zoom = window.top.outerWidth / window.top.innerWidth;
    zoom = Math.round(zoom * 100) / 100;
    return {
      zoom: zoom,
      devicePxPerCssPx: zoom * devicePixelRatio()
    };
  };

  /**
   * Use a binary search through media queries to find zoom level in Firefox
   * @param property
   * @param unit
   * @param a
   * @param b
   * @param maxIter
   * @param epsilon
   * @return {Number}
   */
  var mediaQueryBinarySearch = function(property, unit, a, b, maxIter, epsilon) {
    var matchMedia;
    var head, style, div;
    if (window.matchMedia) {
      matchMedia = window.matchMedia;
    } else {
      head = document.getElementsByTagName('head')[0];
      style = document.createElement('style');
      head.appendChild(style);

      div = document.createElement('div');
      div.className = 'mediaQueryBinarySearch';
      div.style.display = 'none';
      document.body.appendChild(div);

      matchMedia = function(query) {
        style.sheet.insertRule('@media ' + query + '{.mediaQueryBinarySearch ' + '{text-decoration: underline} }', 0);
        var matched = getComputedStyle(div, null).textDecoration == 'underline';
        style.sheet.deleteRule(0);
        return {
          matches: matched
        };
      };
    }
    var ratio = binarySearch(a, b, maxIter);
    if (div) {
      head.removeChild(style);
      document.body.removeChild(div);
    }
    return ratio;

    function binarySearch(a, b, maxIter) {
      var mid = (a + b) / 2;
      if (maxIter <= 0 || b - a < epsilon) {
        return mid;
      }
      var query = "(" + property + ":" + mid + unit + ")";
      if (matchMedia(query).matches) {
        return binarySearch(mid, b, maxIter - 1);
      } else {
        return binarySearch(a, mid, maxIter - 1);
      }
    }
  };

  /**
   * Generate detection function
   * @private
   */
  var detectFunction = (function() {
    var func = fallback;
    //IE8+
    if (!isNaN(screen.logicalXDPI) && !isNaN(screen.systemXDPI)) {
      func = ie8;
    }
    // IE10+ / Touch
    else if (window.navigator.msMaxTouchPoints) {
      func = ie10;
    }
    //Mobile Webkit
    else if ('orientation' in window && typeof document.body.style.webkitMarquee === 'string') {
      func = webkitMobile;
    }
    //WebKit
    else if (typeof document.body.style.webkitMarquee === 'string') {
      func = webkit;
    }
    //Opera
    else if (navigator.userAgent.indexOf('Opera') >= 0) {
      func = opera11;
    }
    //Last one is Firefox
    //FF 18.x
    else if (window.devicePixelRatio) {
      func = firefox18;
    }
    //FF 4.0 - 17.x
    else if (firefox4().zoom > 0.001) {
      func = firefox4;
    }

    return func;
  }());


  return ({

    /**
     * Ratios.zoom shorthand
     * @return {Number} Zoom level
     */
    zoom: function() {
      return detectFunction().zoom;
    },

    /**
     * Ratios.devicePxPerCssPx shorthand
     * @return {Number} devicePxPerCssPx level
     */
    device: function() {
      return detectFunction().devicePxPerCssPx;
    }
  });
}));

var wpcom_img_zoomer = {
  clientHintSupport: {
    gravatar: false,
    files: false,
    photon: false,
    mshots: false,
    staticAssets: false,
    latex: false,
    imgpress: false,
  },
  useHints: false,
  zoomed: false,
  timer: null,
  interval: 1000, // zoom polling interval in millisecond

  // Should we apply width/height attributes to control the image size?
  imgNeedsSizeAtts: function(img) {
    // Do not overwrite existing width/height attributes.
    if (img.getAttribute('width') !== null || img.getAttribute('height') !== null)
      return false;
    // Do not apply the attributes if the image is already constrained by a parent element.
    if (img.width < img.naturalWidth || img.height < img.naturalHeight)
      return false;
    return true;
  },

  hintsFor: function(service) {
    if (this.useHints === false) {
      return false;
    }
    if (this.hints() === false) {
      return false;
    }
    if (typeof this.clientHintSupport[service] === "undefined") {
      return false;
    }
    if (this.clientHintSupport[service] === true) {
      return true;
    }
    return false;
  },

  hints: function() {
    try {
      var chrome = window.navigator.userAgent.match(/\sChrome\/([0-9]+)\.[.0-9]+\s/)
      if (chrome !== null) {
        var version = parseInt(chrome[1], 10)
        if (isNaN(version) === false && version >= 46) {
          return true
        }
      }
    } catch (e) {
      return false
    }
    return false
  },

  init: function() {
    var t = this;
    try {
      t.zoomImages();
      t.timer = setInterval(function() {
        t.zoomImages();
      }, t.interval);
    } catch (e) {}
  },

  stop: function() {
    if (this.timer)
      clearInterval(this.timer);
  },

  getScale: function() {
    var scale = detectZoom.device();
    // Round up to 1.5 or the next integer below the cap.
    if (scale <= 1.0) scale = 1.0;
    else if (scale <= 1.5) scale = 1.5;
    else if (scale <= 2.0) scale = 2.0;
    else if (scale <= 3.0) scale = 3.0;
    else if (scale <= 4.0) scale = 4.0;
    else scale = 5.0;
    return scale;
  },

  shouldZoom: function(scale) {
    var t = this;
    // Do not operate on hidden frames.
    if ("innerWidth" in window && !window.innerWidth)
      return false;
    // Don't do anything until scale > 1
    if (scale == 1.0 && t.zoomed == false)
      return false;
    return true;
  },

  zoomImages: function() {
    var t = this;
    var scale = t.getScale();
    if (!t.shouldZoom(scale)) {
      return;
    }
    t.zoomed = true;
    // Loop through all the <img> elements on the page.
    var imgs = document.getElementsByTagName("img");

    for (var i = 0; i < imgs.length; i++) {
      // Wait for original images to load
      if ("complete" in imgs[i] && !imgs[i].complete)
        continue;

      // Skip images that have srcset attributes.
      if (imgs[i].hasAttribute('srcset')) {
        continue;
      }

      // Skip images that don't need processing.
      var imgScale = imgs[i].getAttribute("scale");
      if (imgScale == scale || imgScale == "0")
        continue;

      // Skip images that have already failed at this scale
      var scaleFail = imgs[i].getAttribute("scale-fail");
      if (scaleFail && scaleFail <= scale)
        continue;

      // Skip images that have no dimensions yet.
      if (!(imgs[i].width && imgs[i].height))
        continue;

      // Skip images from Lazy Load plugins
      if (!imgScale && imgs[i].getAttribute("data-lazy-src") && (imgs[i].getAttribute("data-lazy-src") !== imgs[i].getAttribute("src")))
        continue;

      if (t.scaleImage(imgs[i], scale)) {
        // Mark the img as having been processed at this scale.
        imgs[i].setAttribute("scale", scale);
      } else {
        // Set the flag to skip this image.
        imgs[i].setAttribute("scale", "0");
      }
    }
  },

  scaleImage: function(img, scale) {
    var t = this;
    var newSrc = img.src;

    var isFiles = false;
    var isLatex = false;
    var isPhoton = false;

    // Skip slideshow images
    if (img.parentNode.className.match(/slideshow-slide/))
      return false;

    // Scale gravatars that have ?s= or ?size=
    if (img.src.match(/^https?:\/\/([^\/]*\.)?gravatar\.com\/.+[?&](s|size)=/)) {
      if (this.hintsFor("gravatar") === true) {
        return false;
      }
      newSrc = img.src.replace(/([?&](s|size)=)(\d+)/, function($0, $1, $2, $3) {
        // Stash the original size
        var originalAtt = "originals",
          originalSize = img.getAttribute(originalAtt);
        if (originalSize === null) {
          originalSize = $3;
          img.setAttribute(originalAtt, originalSize);
          if (t.imgNeedsSizeAtts(img)) {
            // Fix width and height attributes to rendered dimensions.
            img.width = img.width;
            img.height = img.height;
          }
        }
        // Get the width/height of the image in CSS pixels
        var size = img.clientWidth;
        // Convert CSS pixels to device pixels
        var targetSize = Math.ceil(img.clientWidth * scale);
        // Don't go smaller than the original size
        targetSize = Math.max(targetSize, originalSize);
        // Don't go larger than the service supports
        targetSize = Math.min(targetSize, 512);
        return $1 + targetSize;
      });
    }

    // Scale mshots that have width
    else if (img.src.match(/^https?:\/\/([^\/]+\.)*(wordpress|wp)\.com\/mshots\/.+[?&]w=\d+/)) {
      if (this.hintsFor("mshots") === true) {
        return false;
      }
      newSrc = img.src.replace(/([?&]w=)(\d+)/, function($0, $1, $2) {
        // Stash the original size
        var originalAtt = 'originalw',
          originalSize = img.getAttribute(originalAtt);
        if (originalSize === null) {
          originalSize = $2;
          img.setAttribute(originalAtt, originalSize);
          if (t.imgNeedsSizeAtts(img)) {
            // Fix width and height attributes to rendered dimensions.
            img.width = img.width;
            img.height = img.height;
          }
        }
        // Get the width of the image in CSS pixels
        var size = img.clientWidth;
        // Convert CSS pixels to device pixels
        var targetSize = Math.ceil(size * scale);
        // Don't go smaller than the original size
        targetSize = Math.max(targetSize, originalSize);
        // Don't go bigger unless the current one is actually lacking
        if (scale > img.getAttribute("scale") && targetSize <= img.naturalWidth)
          targetSize = $2;
        if ($2 != targetSize)
          return $1 + targetSize;
        return $0;
      });

      // Update height attribute to match width
      newSrc = newSrc.replace(/([?&]h=)(\d+)/, function($0, $1, $2) {
        if (newSrc == img.src) {
          return $0;
        }
        // Stash the original size
        var originalAtt = 'originalh',
          originalSize = img.getAttribute(originalAtt);
        if (originalSize === null) {
          originalSize = $2;
          img.setAttribute(originalAtt, originalSize);
        }
        // Get the height of the image in CSS pixels
        var size = img.clientHeight;
        // Convert CSS pixels to device pixels
        var targetSize = Math.ceil(size * scale);
        // Don't go smaller than the original size
        targetSize = Math.max(targetSize, originalSize);
        // Don't go bigger unless the current one is actually lacking
        if (scale > img.getAttribute("scale") && targetSize <= img.naturalHeight)
          targetSize = $2;
        if ($2 != targetSize)
          return $1 + targetSize;
        return $0;
      });
    }

    // Scale simple imgpress queries (s0.wp.com) that only specify w/h/fit
    else if (img.src.match(/^https?:\/\/([^\/.]+\.)*(wp|wordpress)\.com\/imgpress\?(.+)/)) {
      if (this.hintsFor("imgpress") === true) {
        return false;
      }
      var imgpressSafeFunctions = ["zoom", "url", "h", "w", "fit", "filter", "brightness", "contrast", "colorize", "smooth", "unsharpmask"];
      // Search the query string for unsupported functions.
      var qs = RegExp.$3.split('&');
      for (var q in qs) {
        q = qs[q].split('=')[0];
        if (imgpressSafeFunctions.indexOf(q) == -1) {
          return false;
        }
      }
      // Fix width and height attributes to rendered dimensions.
      img.width = img.width;
      img.height = img.height;
      // Compute new src
      if (scale == 1)
        newSrc = img.src.replace(/\?(zoom=[^&]+&)?/, '?');
      else
        newSrc = img.src.replace(/\?(zoom=[^&]+&)?/, '?zoom=' + scale + '&');
    }

    // Scale files.wordpress.com, LaTeX, or Photon images (i#.wp.com)
    else if (
      (isFiles = img.src.match(/^https?:\/\/([^\/]+)\.files\.wordpress\.com\/.+[?&][wh]=/)) ||
      (isLatex = img.src.match(/^https?:\/\/([^\/.]+\.)*(wp|wordpress)\.com\/latex\.php\?(latex|zoom)=(.+)/)) ||
      (isPhoton = img.src.match(/^https?:\/\/i[\d]{1}\.wp\.com\/(.+)/))
    ) {
      if (false !== isFiles && this.hintsFor("files") === true) {
        return false
      }
      if (false !== isLatex && this.hintsFor("latex") === true) {
        return false
      }
      if (false !== isPhoton && this.hintsFor("photon") === true) {
        return false
      }
      // Fix width and height attributes to rendered dimensions.
      img.width = img.width;
      img.height = img.height;
      // Compute new src
      if (scale == 1) {
        newSrc = img.src.replace(/\?(zoom=[^&]+&)?/, '?');
      } else {
        newSrc = img.src;

        var url_var = newSrc.match(/([?&]w=)(\d+)/);
        if (url_var !== null && url_var[2]) {
          newSrc = newSrc.replace(url_var[0], url_var[1] + img.width);
        }

        url_var = newSrc.match(/([?&]h=)(\d+)/);
        if (url_var !== null && url_var[2]) {
          newSrc = newSrc.replace(url_var[0], url_var[1] + img.height);
        }

        var zoom_arg = '&zoom=2';
        if (!newSrc.match(/\?/)) {
          zoom_arg = '?zoom=2';
        }
        img.setAttribute('srcset', newSrc + zoom_arg + ' ' + scale + 'x');
      }
    }

    // Scale static assets that have a name matching *-1x.png or *@1x.png
    else if (img.src.match(/^https?:\/\/[^\/]+\/.*[-@]([12])x\.(gif|jpeg|jpg|png)(\?|$)/)) {
      if (this.hintsFor("staticAssets") === true) {
        return false;
      }
      // Fix width and height attributes to rendered dimensions.
      img.width = img.width;
      img.height = img.height;
      var currentSize = RegExp.$1,
        newSize = currentSize;
      if (scale <= 1)
        newSize = 1;
      else
        newSize = 2;
      if (currentSize != newSize)
        newSrc = img.src.replace(/([-@])[12]x\.(gif|jpeg|jpg|png)(\?|$)/, '$1' + newSize + 'x.$2$3');
    } else {
      return false;
    }

    // Don't set img.src unless it has changed. This avoids unnecessary reloads.
    if (newSrc != img.src) {
      // Store the original img.src
      var prevSrc, origSrc = img.getAttribute("src-orig");
      if (!origSrc) {
        origSrc = img.src;
        img.setAttribute("src-orig", origSrc);
      }
      // In case of error, revert img.src
      prevSrc = img.src;
      img.onerror = function() {
        img.src = prevSrc;
        if (img.getAttribute("scale-fail") < scale)
          img.setAttribute("scale-fail", scale);
        img.onerror = null;
      };
      // Finally load the new image
      img.src = newSrc;
    }

    return true;
  }
};

wpcom_img_zoomer.init();;
/* global pm, wpcom_reblog */

var jetpackLikesWidgetQueue = [];
var jetpackLikesWidgetBatch = [];
var jetpackLikesMasterReady = false;

function JetpackLikespostMessage(message, target) {
  if ('string' === typeof message) {
    try {
      message = JSON.parse(message);
    } catch (e) {
      return;
    }
  }

  pm({
    target: target,
    type: 'likesMessage',
    data: message,
    origin: '*'
  });
}

function JetpackLikesBatchHandler() {
  var requests = [];
  jQuery('div.jetpack-likes-widget-unloaded').each(function() {
    if (jetpackLikesWidgetBatch.indexOf(this.id) > -1) {
      return;
    }
    jetpackLikesWidgetBatch.push(this.id);
    var regex = /like-(post|comment)-wrapper-(\d+)-(\d+)-(\w+)/,
      match = regex.exec(this.id),
      info;

    if (!match || match.length !== 5) {
      return;
    }

    info = {
      blog_id: match[2],
      width: this.width
    };

    if ('post' === match[1]) {
      info.post_id = match[3];
    } else if ('comment' === match[1]) {
      info.comment_id = match[3];
    }

    info.obj_id = match[4];

    requests.push(info);
  });

  if (requests.length > 0) {
    JetpackLikespostMessage({
      event: 'initialBatch',
      requests: requests
    }, window.frames['likes-master']);
  }
}

function JetpackLikesMessageListener(event, message) {
  var allowedOrigin, $container, $list, offset, rowLength, height, scrollbarWidth;

  if ('undefined' === typeof event.event) {
    return;
  }

  // We only allow messages from one origin
  allowedOrigin = window.location.protocol + 'https://widgets.wp.com/';
  if (allowedOrigin !== message.origin) {
    return;
  }

  if ('masterReady' === event.event) {
    jQuery(document).ready(function() {
      jetpackLikesMasterReady = true;

      var stylesData = {
          event: 'injectStyles'
        },
        $sdTextColor = jQuery('.sd-text-color'),
        $sdLinkColor = jQuery('.sd-link-color');

      if (jQuery('iframe.admin-bar-likes-widget').length > 0) {
        JetpackLikespostMessage({
          event: 'adminBarEnabled'
        }, window.frames['likes-master']);

        stylesData.adminBarStyles = {
          background: jQuery('#wpadminbar .quicklinks li#wp-admin-bar-wpl-like > a').css('background'),
          isRtl: ('rtl' === jQuery('#wpadminbar').css('direction'))
        };
      }

      if (!window.addEventListener) {
        jQuery('#wp-admin-bar-admin-bar-likes-widget').hide();
      }

      stylesData.textStyles = {
        color: $sdTextColor.css('color'),
        fontFamily: $sdTextColor.css('font-family'),
        fontSize: $sdTextColor.css('font-size'),
        direction: $sdTextColor.css('direction'),
        fontWeight: $sdTextColor.css('font-weight'),
        fontStyle: $sdTextColor.css('font-style'),
        textDecoration: $sdTextColor.css('text-decoration')
      };

      stylesData.linkStyles = {
        color: $sdLinkColor.css('color'),
        fontFamily: $sdLinkColor.css('font-family'),
        fontSize: $sdLinkColor.css('font-size'),
        textDecoration: $sdLinkColor.css('text-decoration'),
        fontWeight: $sdLinkColor.css('font-weight'),
        fontStyle: $sdLinkColor.css('font-style')
      };

      JetpackLikespostMessage(stylesData, window.frames['likes-master']);

      JetpackLikesBatchHandler();

      jQuery(document).on('inview', 'div.jetpack-likes-widget-unloaded', function() {
        jetpackLikesWidgetQueue.push(this.id);
      });
    });
  }

  if ('showLikeWidget' === event.event) {
    jQuery('#' + event.id + ' .post-likes-widget-placeholder').fadeOut('fast', function() {
      jQuery('#' + event.id + ' .post-likes-widget').fadeIn('fast', function() {
        JetpackLikespostMessage({
          event: 'likeWidgetDisplayed',
          blog_id: event.blog_id,
          post_id: event.post_id,
          obj_id: event.obj_id
        }, window.frames['likes-master']);
      });
    });
  }

  if ('clickReblogFlair' === event.event) {
    wpcom_reblog.toggle_reblog_box_flair(event.obj_id);
  }

  if ('showOtherGravatars' === event.event) {
    $container = jQuery('#likes-other-gravatars');
    $list = $container.find('ul');

    $container.hide();
    $list.html('');

    $container.find('.likes-text span').text(event.total);

    jQuery.each(event.likers, function(i, liker) {
      var element = jQuery('<li><a><img /></a></li>');
      element.addClass(liker.css_class);

      element.find('a').
      attr({
        href: liker.profile_URL,
        rel: 'nofollow',
        target: '_parent'
      }).
      addClass('wpl-liker');

      element.find('img').
      attr({
        src: liker.avatar_URL,
        alt: liker.name
      }).
      css({
        width: '30px',
        height: '30px',
        paddingRight: '3px'
      });

      $list.append(element);
    });

    offset = jQuery('[name=\'' + event.parent + '\']').offset();

    $container.css('left', offset.left + event.position.left - 10 + 'px');
    $container.css('top', offset.top + event.position.top - 33 + 'px');

    rowLength = Math.floor(event.width / 37);
    height = (Math.ceil(event.likers.length / rowLength) * 37) + 13;
    if (height > 204) {
      height = 204;
    }

    $container.css('height', height + 'px');
    $container.css('width', rowLength * 37 - 7 + 'px');

    $list.css('width', rowLength * 37 + 'px');

    $container.fadeIn('slow');

    scrollbarWidth = $list[0].offsetWidth - $list[0].clientWidth;
    if (scrollbarWidth > 0) {
      $container.width($container.width() + scrollbarWidth);
      $list.width($list.width() + scrollbarWidth);
    }
  }
}

pm.bind('likesMessage', JetpackLikesMessageListener);

jQuery(document).click(function(e) {
  var $container = jQuery('#likes-other-gravatars');

  if ($container.has(e.target).length === 0) {
    $container.fadeOut('slow');
  }
});

function JetpackLikesWidgetQueueHandler() {
  var $wrapper, wrapperID, found;
  if (!jetpackLikesMasterReady) {
    setTimeout(JetpackLikesWidgetQueueHandler, 500);
    return;
  }

  if (jetpackLikesWidgetQueue.length > 0) {
    // We may have a widget that needs creating now
    found = false;
    while (jetpackLikesWidgetQueue.length > 0) {
      // Grab the first member of the queue that isn't already loading.
      wrapperID = jetpackLikesWidgetQueue.splice(0, 1)[0];
      if (jQuery('#' + wrapperID).hasClass('jetpack-likes-widget-unloaded')) {
        found = true;
        break;
      }
    }
    if (!found) {
      setTimeout(JetpackLikesWidgetQueueHandler, 500);
      return;
    }
  } else if (jQuery('div.jetpack-likes-widget-unloaded').length > 0) {
    // Grab any unloaded widgets for a batch request
    JetpackLikesBatchHandler();

    // Get the next unloaded widget
    wrapperID = jQuery('div.jetpack-likes-widget-unloaded').first()[0].id;
    if (!wrapperID) {
      // Everything is currently loaded
      setTimeout(JetpackLikesWidgetQueueHandler, 500);
      return;
    }
  }

  if ('undefined' === typeof wrapperID) {
    setTimeout(JetpackLikesWidgetQueueHandler, 500);
    return;
  }

  $wrapper = jQuery('#' + wrapperID);
  $wrapper.find('iframe').remove();

  if ($wrapper.hasClass('slim-likes-widget')) {
    $wrapper.find('.post-likes-widget-placeholder').after('<iframe class="post-likes-widget jetpack-likes-widget" name="' + $wrapper.data('name') + '" height="22px" width="68px" frameBorder="0" scrolling="no" src="' + $wrapper.data('src') + '"></iframe>');
  } else {
    $wrapper.find('.post-likes-widget-placeholder').after('<iframe class="post-likes-widget jetpack-likes-widget" name="' + $wrapper.data('name') + '" height="55px" width="100%" frameBorder="0" src="' + $wrapper.data('src') + '"></iframe>');
  }

  $wrapper.removeClass('jetpack-likes-widget-unloaded').addClass('jetpack-likes-widget-loading');

  $wrapper.find('iframe').load(function(e) {
    var $iframe = jQuery(e.target);
    $wrapper.removeClass('jetpack-likes-widget-loading').addClass('jetpack-likes-widget-loaded');

    JetpackLikespostMessage({
      event: 'loadLikeWidget',
      name: $iframe.attr('name'),
      width: $iframe.width()
    }, window.frames['likes-master']);

    if ($wrapper.hasClass('slim-likes-widget')) {
      $wrapper.find('iframe').Jetpack('resizeable');
    }
  });
  setTimeout(JetpackLikesWidgetQueueHandler, 250);
}
JetpackLikesWidgetQueueHandler();;
/*
 * jQuery FlexSlider v2.6.1
 * Copyright 2012 WooThemes
 * Contributing Author: Tyler Smith
 */
;
(function($) {

  var focused = true;

  //FlexSlider: Object Instance
  $.flexslider = function(el, options) {
    var slider = $(el);

    // making variables public
    slider.vars = $.extend({}, $.flexslider.defaults, options);

    var namespace = slider.vars.namespace,
      msGesture = window.navigator && window.navigator.msPointerEnabled && window.MSGesture,
      touch = (("ontouchstart" in window) || msGesture || window.DocumentTouch && document instanceof DocumentTouch) && slider.vars.touch,
      // depricating this idea, as devices are being released with both of these events
      eventType = "click touchend MSPointerUp keyup",
      watchedEvent = "",
      watchedEventClearTimer,
      vertical = slider.vars.direction === "vertical",
      reverse = slider.vars.reverse,
      carousel = (slider.vars.itemWidth > 0),
      fade = slider.vars.animation === "fade",
      asNav = slider.vars.asNavFor !== "",
      methods = {};

    // Store a reference to the slider object
    $.data(el, "flexslider", slider);

    // Private slider methods
    methods = {
      init: function() {
        slider.animating = false;
        // Get current slide and make sure it is a number
        slider.currentSlide = parseInt((slider.vars.startAt ? slider.vars.startAt : 0), 10);
        if (isNaN(slider.currentSlide)) {
          slider.currentSlide = 0;
        }
        slider.animatingTo = slider.currentSlide;
        slider.atEnd = (slider.currentSlide === 0 || slider.currentSlide === slider.last);
        slider.containerSelector = slider.vars.selector.substr(0, slider.vars.selector.search(' '));
        slider.slides = $(slider.vars.selector, slider);
        slider.container = $(slider.containerSelector, slider);
        slider.count = slider.slides.length;
        // SYNC:
        slider.syncExists = $(slider.vars.sync).length > 0;
        // SLIDE:
        if (slider.vars.animation === "slide") {
          slider.vars.animation = "swing";
        }
        slider.prop = (vertical) ? "top" : "marginLeft";
        slider.args = {};
        // SLIDESHOW:
        slider.manualPause = false;
        slider.stopped = false;
        //PAUSE WHEN INVISIBLE
        slider.started = false;
        slider.startTimeout = null;
        // TOUCH/USECSS:
        slider.transitions = !slider.vars.video && !fade && slider.vars.useCSS && (function() {
          var obj = document.createElement('div'),
            props = ['perspectiveProperty', 'WebkitPerspective', 'MozPerspective', 'OPerspective', 'msPerspective'];
          for (var i in props) {
            if (obj.style[props[i]] !== undefined) {
              slider.pfx = props[i].replace('Perspective', '').toLowerCase();
              slider.prop = "-" + slider.pfx + "-transform";
              return true;
            }
          }
          return false;
        }());
        slider.ensureAnimationEnd = '';
        // CONTROLSCONTAINER:
        if (slider.vars.controlsContainer !== "") slider.controlsContainer = $(slider.vars.controlsContainer).length > 0 && $(slider.vars.controlsContainer);
        // MANUAL:
        if (slider.vars.manualControls !== "") slider.manualControls = $(slider.vars.manualControls).length > 0 && $(slider.vars.manualControls);

        // CUSTOM DIRECTION NAV:
        if (slider.vars.customDirectionNav !== "") slider.customDirectionNav = $(slider.vars.customDirectionNav).length === 2 && $(slider.vars.customDirectionNav);

        // RANDOMIZE:
        if (slider.vars.randomize) {
          slider.slides.sort(function() {
            return (Math.round(Math.random()) - 0.5);
          });
          slider.container.empty().append(slider.slides);
        }

        slider.doMath();

        // INIT
        slider.setup("init");

        // CONTROLNAV:
        if (slider.vars.controlNav) {
          methods.controlNav.setup();
        }

        // DIRECTIONNAV:
        if (slider.vars.directionNav) {
          methods.directionNav.setup();
        }

        // KEYBOARD:
        if (slider.vars.keyboard && ($(slider.containerSelector).length === 1 || slider.vars.multipleKeyboard)) {
          $(document).bind('keyup', function(event) {
            var keycode = event.keyCode;
            if (!slider.animating && (keycode === 39 || keycode === 37)) {
              var target = (keycode === 39) ? slider.getTarget('next') :
                (keycode === 37) ? slider.getTarget('prev') : false;
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }
          });
        }
        // MOUSEWHEEL:
        if (slider.vars.mousewheel) {
          slider.bind('mousewheel', function(event, delta, deltaX, deltaY) {
            event.preventDefault();
            var target = (delta < 0) ? slider.getTarget('next') : slider.getTarget('prev');
            slider.flexAnimate(target, slider.vars.pauseOnAction);
          });
        }

        // PAUSEPLAY
        if (slider.vars.pausePlay) {
          methods.pausePlay.setup();
        }

        //PAUSE WHEN INVISIBLE
        if (slider.vars.slideshow && slider.vars.pauseInvisible) {
          methods.pauseInvisible.init();
        }

        // SLIDSESHOW
        if (slider.vars.slideshow) {
          if (slider.vars.pauseOnHover) {
            slider.hover(function() {
              if (!slider.manualPlay && !slider.manualPause) {
                slider.pause();
              }
            }, function() {
              if (!slider.manualPause && !slider.manualPlay && !slider.stopped) {
                slider.play();
              }
            });
          }
          // initialize animation
          //If we're visible, or we don't use PageVisibility API
          if (!slider.vars.pauseInvisible || !methods.pauseInvisible.isHidden()) {
            (slider.vars.initDelay > 0) ? slider.startTimeout = setTimeout(slider.play, slider.vars.initDelay): slider.play();
          }
        }

        // ASNAV:
        if (asNav) {
          methods.asNav.setup();
        }

        // TOUCH
        if (touch && slider.vars.touch) {
          methods.touch();
        }

        // FADE&&SMOOTHHEIGHT || SLIDE:
        if (!fade || (fade && slider.vars.smoothHeight)) {
          $(window).bind("resize orientationchange focus", methods.resize);
        }

        slider.find("img").attr("draggable", "false");

        // API: start() Callback
        setTimeout(function() {
          slider.vars.start(slider);
        }, 200);
      },
      asNav: {
        setup: function() {
          slider.asNav = true;
          slider.animatingTo = Math.floor(slider.currentSlide / slider.move);
          slider.currentItem = slider.currentSlide;
          slider.slides.removeClass(namespace + "active-slide").eq(slider.currentItem).addClass(namespace + "active-slide");
          if (!msGesture) {
            slider.slides.on(eventType, function(e) {
              e.preventDefault();
              var $slide = $(this),
                target = $slide.index();
              var posFromLeft = $slide.offset().left - $(slider).scrollLeft(); // Find position of slide relative to left of slider container
              if (posFromLeft <= 0 && $slide.hasClass(namespace + 'active-slide')) {
                slider.flexAnimate(slider.getTarget("prev"), true);
              } else if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass(namespace + "active-slide")) {
                slider.direction = (slider.currentItem < target) ? "next" : "prev";
                slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
              }
            });
          } else {
            el._slider = slider;
            slider.slides.each(function() {
              var that = this;
              that._gesture = new MSGesture();
              that._gesture.target = that;
              that.addEventListener("MSPointerDown", function(e) {
                e.preventDefault();
                if (e.currentTarget._gesture) {
                  e.currentTarget._gesture.addPointer(e.pointerId);
                }
              }, false);
              that.addEventListener("MSGestureTap", function(e) {
                e.preventDefault();
                var $slide = $(this),
                  target = $slide.index();
                if (!$(slider.vars.asNavFor).data('flexslider').animating && !$slide.hasClass('active')) {
                  slider.direction = (slider.currentItem < target) ? "next" : "prev";
                  slider.flexAnimate(target, slider.vars.pauseOnAction, false, true, true);
                }
              });
            });
          }
        }
      },
      controlNav: {
        setup: function() {
          if (!slider.manualControls) {
            methods.controlNav.setupPaging();
          } else { // MANUALCONTROLS:
            methods.controlNav.setupManual();
          }
        },
        setupPaging: function() {
          var type = (slider.vars.controlNav === "thumbnails") ? 'control-thumbs' : 'control-paging',
            j = 1,
            item,
            slide;

          slider.controlNavScaffold = $('<ol class="' + namespace + 'control-nav ' + namespace + type + '"></ol>');

          if (slider.pagingCount > 1) {
            for (var i = 0; i < slider.pagingCount; i++) {
              slide = slider.slides.eq(i);
              if (undefined === slide.attr('data-thumb-alt')) {
                slide.attr('data-thumb-alt', '');
              }
              var altText = ('' !== slide.attr('data-thumb-alt')) ? altText = ' alt="' + slide.attr('data-thumb-alt') + '"' : '';
              item = (slider.vars.controlNav === "thumbnails") ? '<img src="' + slide.attr('data-thumb') + '"' + altText + '/>' : '<a href="#">' + j + '</a>';
              if ('thumbnails' === slider.vars.controlNav && true === slider.vars.thumbCaptions) {
                var captn = slide.attr('data-thumbcaption');
                if ('' !== captn && undefined !== captn) {
                  item += '<span class="' + namespace + 'caption">' + captn + '</span>';
                }
              }
              slider.controlNavScaffold.append('<li>' + item + '</li>');
              j++;
            }
          }

          // CONTROLSCONTAINER:
          (slider.controlsContainer) ? $(slider.controlsContainer).append(slider.controlNavScaffold): slider.append(slider.controlNavScaffold);
          methods.controlNav.set();

          methods.controlNav.active();

          slider.controlNavScaffold.delegate('a, img', eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              var $this = $(this),
                target = slider.controlNav.index($this);

              if (!$this.hasClass(namespace + 'active')) {
                slider.direction = (target > slider.currentSlide) ? "next" : "prev";
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();

          });
        },
        setupManual: function() {
          slider.controlNav = slider.manualControls;
          methods.controlNav.active();

          slider.controlNav.bind(eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              var $this = $(this),
                target = slider.controlNav.index($this);

              if (!$this.hasClass(namespace + 'active')) {
                (target > slider.currentSlide) ? slider.direction = "next": slider.direction = "prev";
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        set: function() {
          var selector = (slider.vars.controlNav === "thumbnails") ? 'img' : 'a';
          slider.controlNav = $('.' + namespace + 'control-nav li ' + selector, (slider.controlsContainer) ? slider.controlsContainer : slider);
        },
        active: function() {
          slider.controlNav.removeClass(namespace + "active").eq(slider.animatingTo).addClass(namespace + "active");
        },
        update: function(action, pos) {
          if (slider.pagingCount > 1 && action === "add") {
            slider.controlNavScaffold.append($('<li><a href="#">' + slider.count + '</a></li>'));
          } else if (slider.pagingCount === 1) {
            slider.controlNavScaffold.find('li').remove();
          } else {
            slider.controlNav.eq(pos).closest('li').remove();
          }
          methods.controlNav.set();
          (slider.pagingCount > 1 && slider.pagingCount !== slider.controlNav.length) ? slider.update(pos, action): methods.controlNav.active();
        }
      },
      directionNav: {
        setup: function() {
          var directionNavScaffold = $('<ul class="' + namespace + 'direction-nav"><li class="' + namespace + 'nav-prev"><a class="' + namespace + 'prev" href="#">' + slider.vars.prevText + '</a></li><li class="' + namespace + 'nav-next"><a class="' + namespace + 'next" href="#">' + slider.vars.nextText + '</a></li></ul>');

          // CUSTOM DIRECTION NAV:
          if (slider.customDirectionNav) {
            slider.directionNav = slider.customDirectionNav;
            // CONTROLSCONTAINER:
          } else if (slider.controlsContainer) {
            $(slider.controlsContainer).append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider.controlsContainer);
          } else {
            slider.append(directionNavScaffold);
            slider.directionNav = $('.' + namespace + 'direction-nav li a', slider);
          }

          methods.directionNav.update();

          slider.directionNav.bind(eventType, function(event) {
            event.preventDefault();
            var target;

            if (watchedEvent === "" || watchedEvent === event.type) {
              target = ($(this).hasClass(namespace + 'next')) ? slider.getTarget('next') : slider.getTarget('prev');
              slider.flexAnimate(target, slider.vars.pauseOnAction);
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        update: function() {
          var disabledClass = namespace + 'disabled';
          if (slider.pagingCount === 1) {
            slider.directionNav.addClass(disabledClass).attr('tabindex', '-1');
          } else if (!slider.vars.animationLoop) {
            if (slider.animatingTo === 0) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "prev").addClass(disabledClass).attr('tabindex', '-1');
            } else if (slider.animatingTo === slider.last) {
              slider.directionNav.removeClass(disabledClass).filter('.' + namespace + "next").addClass(disabledClass).attr('tabindex', '-1');
            } else {
              slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
            }
          } else {
            slider.directionNav.removeClass(disabledClass).removeAttr('tabindex');
          }
        }
      },
      pausePlay: {
        setup: function() {
          var pausePlayScaffold = $('<div class="' + namespace + 'pauseplay"><a href="#"></a></div>');

          // CONTROLSCONTAINER:
          if (slider.controlsContainer) {
            slider.controlsContainer.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider.controlsContainer);
          } else {
            slider.append(pausePlayScaffold);
            slider.pausePlay = $('.' + namespace + 'pauseplay a', slider);
          }

          methods.pausePlay.update((slider.vars.slideshow) ? namespace + 'pause' : namespace + 'play');

          slider.pausePlay.bind(eventType, function(event) {
            event.preventDefault();

            if (watchedEvent === "" || watchedEvent === event.type) {
              if ($(this).hasClass(namespace + 'pause')) {
                slider.manualPause = true;
                slider.manualPlay = false;
                slider.pause();
              } else {
                slider.manualPause = false;
                slider.manualPlay = true;
                slider.play();
              }
            }

            // setup flags to prevent event duplication
            if (watchedEvent === "") {
              watchedEvent = event.type;
            }
            methods.setToClearWatchedEvent();
          });
        },
        update: function(state) {
          (state === "play") ? slider.pausePlay.removeClass(namespace + 'pause').addClass(namespace + 'play').html(slider.vars.playText): slider.pausePlay.removeClass(namespace + 'play').addClass(namespace + 'pause').html(slider.vars.pauseText);
        }
      },
      touch: function() {
        var startX,
          startY,
          offset,
          cwidth,
          dx,
          startT,
          onTouchStart,
          onTouchMove,
          onTouchEnd,
          scrolling = false,
          localX = 0,
          localY = 0,
          accDx = 0;

        if (!msGesture) {
          onTouchStart = function(e) {
            if (slider.animating) {
              e.preventDefault();
            } else if ((window.navigator.msPointerEnabled) || e.touches.length === 1) {
              slider.pause();
              // CAROUSEL:
              cwidth = (vertical) ? slider.h : slider.w;
              startT = Number(new Date());
              // CAROUSEL:

              // Local vars for X and Y points.
              localX = e.touches[0].pageX;
              localY = e.touches[0].pageY;

              offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                (carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                (carousel && slider.currentSlide === slider.last) ? slider.limit :
                (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
              startX = (vertical) ? localY : localX;
              startY = (vertical) ? localX : localY;

              el.addEventListener('touchmove', onTouchMove, false);
              el.addEventListener('touchend', onTouchEnd, false);
            }
          };

          onTouchMove = function(e) {
            // Local vars for X and Y points.

            localX = e.touches[0].pageX;
            localY = e.touches[0].pageY;

            dx = (vertical) ? startX - localY : startX - localX;
            scrolling = (vertical) ? (Math.abs(dx) < Math.abs(localX - startY)) : (Math.abs(dx) < Math.abs(localY - startY));

            var fxms = 500;

            if (!scrolling || Number(new Date()) - startT > fxms) {
              e.preventDefault();
              if (!fade && slider.transitions) {
                if (!slider.vars.animationLoop) {
                  dx = dx / ((slider.currentSlide === 0 && dx < 0 || slider.currentSlide === slider.last && dx > 0) ? (Math.abs(dx) / cwidth + 2) : 1);
                }
                slider.setProps(offset + dx, "setTouch");
              }
            }
          };

          onTouchEnd = function(e) {
            // finish the touch by undoing the touch session
            el.removeEventListener('touchmove', onTouchMove, false);

            if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
              var updateDx = (reverse) ? -dx : dx,
                target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

              if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth / 2)) {
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              } else {
                if (!fade) {
                  slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
                }
              }
            }
            el.removeEventListener('touchend', onTouchEnd, false);

            startX = null;
            startY = null;
            dx = null;
            offset = null;
          };

          el.addEventListener('touchstart', onTouchStart, false);
        } else {
          el.style.msTouchAction = "none";
          el._gesture = new MSGesture();
          el._gesture.target = el;
          el.addEventListener("MSPointerDown", onMSPointerDown, false);
          el._slider = slider;
          el.addEventListener("MSGestureChange", onMSGestureChange, false);
          el.addEventListener("MSGestureEnd", onMSGestureEnd, false);

          function onMSPointerDown(e) {
            e.stopPropagation();
            if (slider.animating) {
              e.preventDefault();
            } else {
              slider.pause();
              el._gesture.addPointer(e.pointerId);
              accDx = 0;
              cwidth = (vertical) ? slider.h : slider.w;
              startT = Number(new Date());
              // CAROUSEL:

              offset = (carousel && reverse && slider.animatingTo === slider.last) ? 0 :
                (carousel && reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                (carousel && slider.currentSlide === slider.last) ? slider.limit :
                (carousel) ? ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.currentSlide :
                (reverse) ? (slider.last - slider.currentSlide + slider.cloneOffset) * cwidth : (slider.currentSlide + slider.cloneOffset) * cwidth;
            }
          }

          function onMSGestureChange(e) {
            e.stopPropagation();
            var slider = e.target._slider;
            if (!slider) {
              return;
            }
            var transX = -e.translationX,
              transY = -e.translationY;

            //Accumulate translations.
            accDx = accDx + ((vertical) ? transY : transX);
            dx = accDx;
            scrolling = (vertical) ? (Math.abs(accDx) < Math.abs(-transX)) : (Math.abs(accDx) < Math.abs(-transY));

            if (e.detail === e.MSGESTURE_FLAG_INERTIA) {
              setImmediate(function() {
                el._gesture.stop();
              });

              return;
            }

            if (!scrolling || Number(new Date()) - startT > 500) {
              e.preventDefault();
              if (!fade && slider.transitions) {
                if (!slider.vars.animationLoop) {
                  dx = accDx / ((slider.currentSlide === 0 && accDx < 0 || slider.currentSlide === slider.last && accDx > 0) ? (Math.abs(accDx) / cwidth + 2) : 1);
                }
                slider.setProps(offset + dx, "setTouch");
              }
            }
          }

          function onMSGestureEnd(e) {
            e.stopPropagation();
            var slider = e.target._slider;
            if (!slider) {
              return;
            }
            if (slider.animatingTo === slider.currentSlide && !scrolling && !(dx === null)) {
              var updateDx = (reverse) ? -dx : dx,
                target = (updateDx > 0) ? slider.getTarget('next') : slider.getTarget('prev');

              if (slider.canAdvance(target) && (Number(new Date()) - startT < 550 && Math.abs(updateDx) > 50 || Math.abs(updateDx) > cwidth / 2)) {
                slider.flexAnimate(target, slider.vars.pauseOnAction);
              } else {
                if (!fade) {
                  slider.flexAnimate(slider.currentSlide, slider.vars.pauseOnAction, true);
                }
              }
            }

            startX = null;
            startY = null;
            dx = null;
            offset = null;
            accDx = 0;
          }
        }
      },
      resize: function() {
        if (!slider.animating && slider.is(':visible')) {
          if (!carousel) {
            slider.doMath();
          }

          if (fade) {
            // SMOOTH HEIGHT:
            methods.smoothHeight();
          } else if (carousel) { //CAROUSEL:
            slider.slides.width(slider.computedW);
            slider.update(slider.pagingCount);
            slider.setProps();
          } else if (vertical) { //VERTICAL:
            slider.viewport.height(slider.h);
            slider.setProps(slider.h, "setTotal");
          } else {
            // SMOOTH HEIGHT:
            if (slider.vars.smoothHeight) {
              methods.smoothHeight();
            }
            slider.newSlides.width(slider.computedW);
            slider.setProps(slider.computedW, "setTotal");
          }
        }
      },
      smoothHeight: function(dur) {
        if (!vertical || fade) {
          var $obj = (fade) ? slider : slider.viewport;
          (dur) ? $obj.animate({
            "height": slider.slides.eq(slider.animatingTo).innerHeight()
          }, dur): $obj.innerHeight(slider.slides.eq(slider.animatingTo).innerHeight());
        }
      },
      sync: function(action) {
        var $obj = $(slider.vars.sync).data("flexslider"),
          target = slider.animatingTo;

        switch (action) {
          case "animate":
            $obj.flexAnimate(target, slider.vars.pauseOnAction, false, true);
            break;
          case "play":
            if (!$obj.playing && !$obj.asNav) {
              $obj.play();
            }
            break;
          case "pause":
            $obj.pause();
            break;
        }
      },
      uniqueID: function($clone) {
        // Append _clone to current level and children elements with id attributes
        $clone.filter('[id]').add($clone.find('[id]')).each(function() {
          var $this = $(this);
          $this.attr('id', $this.attr('id') + '_clone');
        });
        return $clone;
      },
      pauseInvisible: {
        visProp: null,
        init: function() {
          var visProp = methods.pauseInvisible.getHiddenProp();
          if (visProp) {
            var evtname = visProp.replace(/[H|h]idden/, '') + 'visibilitychange';
            document.addEventListener(evtname, function() {
              if (methods.pauseInvisible.isHidden()) {
                if (slider.startTimeout) {
                  clearTimeout(slider.startTimeout); //If clock is ticking, stop timer and prevent from starting while invisible
                } else {
                  slider.pause(); //Or just pause
                }
              } else {
                if (slider.started) {
                  slider.play(); //Initiated before, just play
                } else {
                  if (slider.vars.initDelay > 0) {
                    setTimeout(slider.play, slider.vars.initDelay);
                  } else {
                    slider.play(); //Didn't init before: simply init or wait for it
                  }
                }
              }
            });
          }
        },
        isHidden: function() {
          var prop = methods.pauseInvisible.getHiddenProp();
          if (!prop) {
            return false;
          }
          return document[prop];
        },
        getHiddenProp: function() {
          var prefixes = ['webkit', 'moz', 'ms', 'o'];
          // if 'hidden' is natively supported just return it
          if ('hidden' in document) {
            return 'hidden';
          }
          // otherwise loop over all the known prefixes until we find one
          for (var i = 0; i < prefixes.length; i++) {
            if ((prefixes[i] + 'Hidden') in document) {
              return prefixes[i] + 'Hidden';
            }
          }
          // otherwise it's not supported
          return null;
        }
      },
      setToClearWatchedEvent: function() {
        clearTimeout(watchedEventClearTimer);
        watchedEventClearTimer = setTimeout(function() {
          watchedEvent = "";
        }, 3000);
      }
    };

    // public methods
    slider.flexAnimate = function(target, pause, override, withSync, fromNav) {
      if (!slider.vars.animationLoop && target !== slider.currentSlide) {
        slider.direction = (target > slider.currentSlide) ? "next" : "prev";
      }

      if (asNav && slider.pagingCount === 1) slider.direction = (slider.currentItem < target) ? "next" : "prev";

      if (!slider.animating && (slider.canAdvance(target, fromNav) || override) && slider.is(":visible")) {
        if (asNav && withSync) {
          var master = $(slider.vars.asNavFor).data('flexslider');
          slider.atEnd = target === 0 || target === slider.count - 1;
          master.flexAnimate(target, true, false, true, fromNav);
          slider.direction = (slider.currentItem < target) ? "next" : "prev";
          master.direction = slider.direction;

          if (Math.ceil((target + 1) / slider.visible) - 1 !== slider.currentSlide && target !== 0) {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            target = Math.floor(target / slider.visible);
          } else {
            slider.currentItem = target;
            slider.slides.removeClass(namespace + "active-slide").eq(target).addClass(namespace + "active-slide");
            return false;
          }
        }

        slider.animating = true;
        slider.animatingTo = target;

        // SLIDESHOW:
        if (pause) {
          slider.pause();
        }

        // API: before() animation Callback
        slider.vars.before(slider);

        // SYNC:
        if (slider.syncExists && !fromNav) {
          methods.sync("animate");
        }

        // CONTROLNAV
        if (slider.vars.controlNav) {
          methods.controlNav.active();
        }

        // !CAROUSEL:
        // CANDIDATE: slide active class (for add/remove slide)
        if (!carousel) {
          slider.slides.removeClass(namespace + 'active-slide').eq(target).addClass(namespace + 'active-slide');
        }

        // INFINITE LOOP:
        // CANDIDATE: atEnd
        slider.atEnd = target === 0 || target === slider.last;

        // DIRECTIONNAV:
        if (slider.vars.directionNav) {
          methods.directionNav.update();
        }

        if (target === slider.last) {
          // API: end() of cycle Callback
          slider.vars.end(slider);
          // SLIDESHOW && !INFINITE LOOP:
          if (!slider.vars.animationLoop) {
            slider.pause();
          }
        }

        // SLIDE:
        if (!fade) {
          var dimension = (vertical) ? slider.slides.filter(':first').height() : slider.computedW,
            margin, slideString, calcNext;

          // INFINITE LOOP / REVERSE:
          if (carousel) {
            margin = slider.vars.itemMargin;
            calcNext = ((slider.itemW + margin) * slider.move) * slider.animatingTo;
            slideString = (calcNext > slider.limit && slider.visible !== 1) ? slider.limit : calcNext;
          } else if (slider.currentSlide === 0 && target === slider.count - 1 && slider.vars.animationLoop && slider.direction !== "next") {
            slideString = (reverse) ? (slider.count + slider.cloneOffset) * dimension : 0;
          } else if (slider.currentSlide === slider.last && target === 0 && slider.vars.animationLoop && slider.direction !== "prev") {
            slideString = (reverse) ? 0 : (slider.count + 1) * dimension;
          } else {
            slideString = (reverse) ? ((slider.count - 1) - target + slider.cloneOffset) * dimension : (target + slider.cloneOffset) * dimension;
          }
          slider.setProps(slideString, "", slider.vars.animationSpeed);
          if (slider.transitions) {
            if (!slider.vars.animationLoop || !slider.atEnd) {
              slider.animating = false;
              slider.currentSlide = slider.animatingTo;
            }

            // Unbind previous transitionEnd events and re-bind new transitionEnd event
            slider.container.unbind("webkitTransitionEnd transitionend");
            slider.container.bind("webkitTransitionEnd transitionend", function() {
              clearTimeout(slider.ensureAnimationEnd);
              slider.wrapup(dimension);
            });

            // Insurance for the ever-so-fickle transitionEnd event
            clearTimeout(slider.ensureAnimationEnd);
            slider.ensureAnimationEnd = setTimeout(function() {
              slider.wrapup(dimension);
            }, slider.vars.animationSpeed + 100);

          } else {
            slider.container.animate(slider.args, slider.vars.animationSpeed, slider.vars.easing, function() {
              slider.wrapup(dimension);
            });
          }
        } else { // FADE:
          if (!touch) {
            //slider.slides.eq(slider.currentSlide).fadeOut(slider.vars.animationSpeed, slider.vars.easing);
            //slider.slides.eq(target).fadeIn(slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);

            slider.slides.eq(slider.currentSlide).css({
              "zIndex": 1
            }).animate({
              "opacity": 0
            }, slider.vars.animationSpeed, slider.vars.easing);
            slider.slides.eq(target).css({
              "zIndex": 2
            }).animate({
              "opacity": 1
            }, slider.vars.animationSpeed, slider.vars.easing, slider.wrapup);

          } else {
            slider.slides.eq(slider.currentSlide).css({
              "opacity": 0,
              "zIndex": 1
            });
            slider.slides.eq(target).css({
              "opacity": 1,
              "zIndex": 2
            });
            slider.wrapup(dimension);
          }
        }
        // SMOOTH HEIGHT:
        if (slider.vars.smoothHeight) {
          methods.smoothHeight(slider.vars.animationSpeed);
        }
      }
    };
    slider.wrapup = function(dimension) {
      // SLIDE:
      if (!fade && !carousel) {
        if (slider.currentSlide === 0 && slider.animatingTo === slider.last && slider.vars.animationLoop) {
          slider.setProps(dimension, "jumpEnd");
        } else if (slider.currentSlide === slider.last && slider.animatingTo === 0 && slider.vars.animationLoop) {
          slider.setProps(dimension, "jumpStart");
        }
      }
      slider.animating = false;
      slider.currentSlide = slider.animatingTo;
      // API: after() animation Callback
      slider.vars.after(slider);
    };

    // SLIDESHOW:
    slider.animateSlides = function() {
      if (!slider.animating && focused) {
        slider.flexAnimate(slider.getTarget("next"));
      }
    };
    // SLIDESHOW:
    slider.pause = function() {
      clearInterval(slider.animatedSlides);
      slider.animatedSlides = null;
      slider.playing = false;
      // PAUSEPLAY:
      if (slider.vars.pausePlay) {
        methods.pausePlay.update("play");
      }
      // SYNC:
      if (slider.syncExists) {
        methods.sync("pause");
      }
    };
    // SLIDESHOW:
    slider.play = function() {
      if (slider.playing) {
        clearInterval(slider.animatedSlides);
      }
      slider.animatedSlides = slider.animatedSlides || setInterval(slider.animateSlides, slider.vars.slideshowSpeed);
      slider.started = slider.playing = true;
      // PAUSEPLAY:
      if (slider.vars.pausePlay) {
        methods.pausePlay.update("pause");
      }
      // SYNC:
      if (slider.syncExists) {
        methods.sync("play");
      }
    };
    // STOP:
    slider.stop = function() {
      slider.pause();
      slider.stopped = true;
    };
    slider.canAdvance = function(target, fromNav) {
      // ASNAV:
      var last = (asNav) ? slider.pagingCount - 1 : slider.last;
      return (fromNav) ? true :
        (asNav && slider.currentItem === slider.count - 1 && target === 0 && slider.direction === "prev") ? true :
        (asNav && slider.currentItem === 0 && target === slider.pagingCount - 1 && slider.direction !== "next") ? false :
        (target === slider.currentSlide && !asNav) ? false :
        (slider.vars.animationLoop) ? true :
        (slider.atEnd && slider.currentSlide === 0 && target === last && slider.direction !== "next") ? false :
        (slider.atEnd && slider.currentSlide === last && target === 0 && slider.direction === "next") ? false :
        true;
    };
    slider.getTarget = function(dir) {
      slider.direction = dir;
      if (dir === "next") {
        return (slider.currentSlide === slider.last) ? 0 : slider.currentSlide + 1;
      } else {
        return (slider.currentSlide === 0) ? slider.last : slider.currentSlide - 1;
      }
    };

    // SLIDE:
    slider.setProps = function(pos, special, dur) {
      var target = (function() {
        var posCheck = (pos) ? pos : ((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo,
          posCalc = (function() {
            if (carousel) {
              return (special === "setTouch") ? pos :
                (reverse && slider.animatingTo === slider.last) ? 0 :
                (reverse) ? slider.limit - (((slider.itemW + slider.vars.itemMargin) * slider.move) * slider.animatingTo) :
                (slider.animatingTo === slider.last) ? slider.limit : posCheck;
            } else {
              switch (special) {
                case "setTotal":
                  return (reverse) ? ((slider.count - 1) - slider.currentSlide + slider.cloneOffset) * pos : (slider.currentSlide + slider.cloneOffset) * pos;
                case "setTouch":
                  return (reverse) ? pos : pos;
                case "jumpEnd":
                  return (reverse) ? pos : slider.count * pos;
                case "jumpStart":
                  return (reverse) ? slider.count * pos : pos;
                default:
                  return pos;
              }
            }
          }());

        return (posCalc * -1) + "px";
      }());

      if (slider.transitions) {
        target = (vertical) ? "translate3d(0," + target + ",0)" : "translate3d(" + target + ",0,0)";
        dur = (dur !== undefined) ? (dur / 1000) + "s" : "0s";
        slider.container.css("-" + slider.pfx + "-transition-duration", dur);
        slider.container.css("transition-duration", dur);
      }

      slider.args[slider.prop] = target;
      if (slider.transitions || dur === undefined) {
        slider.container.css(slider.args);
      }

      slider.container.css('transform', target);
    };

    slider.setup = function(type) {
      // SLIDE:
      if (!fade) {
        var sliderOffset, arr;

        if (type === "init") {
          slider.viewport = $('<div class="' + namespace + 'viewport"></div>').css({
            "overflow": "hidden",
            "position": "relative"
          }).appendTo(slider).append(slider.container);
          // INFINITE LOOP:
          slider.cloneCount = 0;
          slider.cloneOffset = 0;
          // REVERSE:
          if (reverse) {
            arr = $.makeArray(slider.slides).reverse();
            slider.slides = $(arr);
            slider.container.empty().append(slider.slides);
          }
        }
        // INFINITE LOOP && !CAROUSEL:
        if (slider.vars.animationLoop && !carousel) {
          slider.cloneCount = 2;
          slider.cloneOffset = 1;
          // clear out old clones
          if (type !== "init") {
            slider.container.find('.clone').remove();
          }
          slider.container.append(methods.uniqueID(slider.slides.first().clone().addClass('clone')).attr('aria-hidden', 'true'))
            .prepend(methods.uniqueID(slider.slides.last().clone().addClass('clone')).attr('aria-hidden', 'true'));
        }
        slider.newSlides = $(slider.vars.selector, slider);

        sliderOffset = (reverse) ? slider.count - 1 - slider.currentSlide + slider.cloneOffset : slider.currentSlide + slider.cloneOffset;
        // VERTICAL:
        if (vertical && !carousel) {
          slider.container.height((slider.count + slider.cloneCount) * 200 + "%").css("position", "absolute").width("100%");
          setTimeout(function() {
            slider.newSlides.css({
              "display": "block"
            });
            slider.doMath();
            slider.viewport.height(slider.h);
            slider.setProps(sliderOffset * slider.h, "init");
          }, (type === "init") ? 100 : 0);
        } else {
          slider.container.width((slider.count + slider.cloneCount) * 200 + "%");
          slider.setProps(sliderOffset * slider.computedW, "init");
          setTimeout(function() {
            slider.doMath();
            slider.newSlides.css({
              "width": slider.computedW,
              "marginRight": slider.computedM,
              "float": "left",
              "display": "block"
            });
            // SMOOTH HEIGHT:
            if (slider.vars.smoothHeight) {
              methods.smoothHeight();
            }
          }, (type === "init") ? 100 : 0);
        }
      } else { // FADE:
        slider.slides.css({
          "width": "100%",
          "float": "left",
          "marginRight": "-100%",
          "position": "relative"
        });
        if (type === "init") {
          if (!touch) {
            //slider.slides.eq(slider.currentSlide).fadeIn(slider.vars.animationSpeed, slider.vars.easing);
            if (slider.vars.fadeFirstSlide == false) {
              slider.slides.css({
                "opacity": 0,
                "display": "block",
                "zIndex": 1
              }).eq(slider.currentSlide).css({
                "zIndex": 2
              }).css({
                "opacity": 1
              });
            } else {
              slider.slides.css({
                "opacity": 0,
                "display": "block",
                "zIndex": 1
              }).eq(slider.currentSlide).css({
                "zIndex": 2
              }).animate({
                "opacity": 1
              }, slider.vars.animationSpeed, slider.vars.easing);
            }
          } else {
            slider.slides.css({
              "opacity": 0,
              "display": "block",
              "webkitTransition": "opacity " + slider.vars.animationSpeed / 1000 + "s ease",
              "zIndex": 1
            }).eq(slider.currentSlide).css({
              "opacity": 1,
              "zIndex": 2
            });
          }
        }
        // SMOOTH HEIGHT:
        if (slider.vars.smoothHeight) {
          methods.smoothHeight();
        }
      }
      // !CAROUSEL:
      // CANDIDATE: active slide
      if (!carousel) {
        slider.slides.removeClass(namespace + "active-slide").eq(slider.currentSlide).addClass(namespace + "active-slide");
      }

      //FlexSlider: init() Callback
      slider.vars.init(slider);
    };

    slider.doMath = function() {
      var slide = slider.slides.first(),
        slideMargin = slider.vars.itemMargin,
        minItems = slider.vars.minItems,
        maxItems = slider.vars.maxItems;

      slider.w = (slider.viewport === undefined) ? slider.width() : slider.viewport.width();
      slider.h = slide.height();
      slider.boxPadding = slide.outerWidth() - slide.width();

      // CAROUSEL:
      if (carousel) {
        slider.itemT = slider.vars.itemWidth + slideMargin;
        slider.itemM = slideMargin;
        slider.minW = (minItems) ? minItems * slider.itemT : slider.w;
        slider.maxW = (maxItems) ? (maxItems * slider.itemT) - slideMargin : slider.w;
        slider.itemW = (slider.minW > slider.w) ? (slider.w - (slideMargin * (minItems - 1))) / minItems :
          (slider.maxW < slider.w) ? (slider.w - (slideMargin * (maxItems - 1))) / maxItems :
          (slider.vars.itemWidth > slider.w) ? slider.w : slider.vars.itemWidth;

        slider.visible = Math.floor(slider.w / (slider.itemW));
        slider.move = (slider.vars.move > 0 && slider.vars.move < slider.visible) ? slider.vars.move : slider.visible;
        slider.pagingCount = Math.ceil(((slider.count - slider.visible) / slider.move) + 1);
        slider.last = slider.pagingCount - 1;
        slider.limit = (slider.pagingCount === 1) ? 0 :
          (slider.vars.itemWidth > slider.w) ? (slider.itemW * (slider.count - 1)) + (slideMargin * (slider.count - 1)) : ((slider.itemW + slideMargin) * slider.count) - slider.w - slideMargin;
      } else {
        slider.itemW = slider.w;
        slider.itemM = slideMargin;
        slider.pagingCount = slider.count;
        slider.last = slider.count - 1;
      }
      slider.computedW = slider.itemW - slider.boxPadding;
      slider.computedM = slider.itemM;
    };

    slider.update = function(pos, action) {
      slider.doMath();

      // update currentSlide and slider.animatingTo if necessary
      if (!carousel) {
        if (pos < slider.currentSlide) {
          slider.currentSlide += 1;
        } else if (pos <= slider.currentSlide && pos !== 0) {
          slider.currentSlide -= 1;
        }
        slider.animatingTo = slider.currentSlide;
      }

      // update controlNav
      if (slider.vars.controlNav && !slider.manualControls) {
        if ((action === "add" && !carousel) || slider.pagingCount > slider.controlNav.length) {
          methods.controlNav.update("add");
        } else if ((action === "remove" && !carousel) || slider.pagingCount < slider.controlNav.length) {
          if (carousel && slider.currentSlide > slider.last) {
            slider.currentSlide -= 1;
            slider.animatingTo -= 1;
          }
          methods.controlNav.update("remove", slider.last);
        }
      }
      // update directionNav
      if (slider.vars.directionNav) {
        methods.directionNav.update();
      }

    };

    slider.addSlide = function(obj, pos) {
      var $obj = $(obj);

      slider.count += 1;
      slider.last = slider.count - 1;

      // append new slide
      if (vertical && reverse) {
        (pos !== undefined) ? slider.slides.eq(slider.count - pos).after($obj): slider.container.prepend($obj);
      } else {
        (pos !== undefined) ? slider.slides.eq(pos).before($obj): slider.container.append($obj);
      }

      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.update(pos, "add");

      // update slider.slides
      slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();

      //FlexSlider: added() Callback
      slider.vars.added(slider);
    };
    slider.removeSlide = function(obj) {
      var pos = (isNaN(obj)) ? slider.slides.index($(obj)) : obj;

      // update count
      slider.count -= 1;
      slider.last = slider.count - 1;

      // remove slide
      if (isNaN(obj)) {
        $(obj, slider.slides).remove();
      } else {
        (vertical && reverse) ? slider.slides.eq(slider.last).remove(): slider.slides.eq(obj).remove();
      }

      // update currentSlide, animatingTo, controlNav, and directionNav
      slider.doMath();
      slider.update(pos, "remove");

      // update slider.slides
      slider.slides = $(slider.vars.selector + ':not(.clone)', slider);
      // re-setup the slider to accomdate new slide
      slider.setup();

      // FlexSlider: removed() Callback
      slider.vars.removed(slider);
    };

    //FlexSlider: Initialize
    methods.init();
  };

  // Ensure the slider isn't focussed if the window loses focus.
  $(window).blur(function(e) {
    focused = false;
  }).focus(function(e) {
    focused = true;
  });

  //FlexSlider: Default Settings
  $.flexslider.defaults = {
    namespace: "flex-", //{NEW} String: Prefix string attached to the class of every element generated by the plugin
    selector: ".slides > li", //{NEW} Selector: Must match a simple pattern. '{container} > {slide}' -- Ignore pattern at your own peril
    animation: "fade", //String: Select your animation type, "fade" or "slide"
    easing: "swing", //{NEW} String: Determines the easing method used in jQuery transitions. jQuery easing plugin is supported!
    direction: "horizontal", //String: Select the sliding direction, "horizontal" or "vertical"
    reverse: false, //{NEW} Boolean: Reverse the animation direction
    animationLoop: true, //Boolean: Should the animation loop? If false, directionNav will received "disable" classes at either end
    smoothHeight: false, //{NEW} Boolean: Allow height of the slider to animate smoothly in horizontal mode
    startAt: 0, //Integer: The slide that the slider should start on. Array notation (0 = first slide)
    slideshow: true, //Boolean: Animate slider automatically
    slideshowSpeed: 7000, //Integer: Set the speed of the slideshow cycling, in milliseconds
    animationSpeed: 600, //Integer: Set the speed of animations, in milliseconds
    initDelay: 0, //{NEW} Integer: Set an initialization delay, in milliseconds
    randomize: false, //Boolean: Randomize slide order
    fadeFirstSlide: true, //Boolean: Fade in the first slide when animation type is "fade"
    thumbCaptions: false, //Boolean: Whether or not to put captions on thumbnails when using the "thumbnails" controlNav.

    // Usability features
    pauseOnAction: true, //Boolean: Pause the slideshow when interacting with control elements, highly recommended.
    pauseOnHover: false, //Boolean: Pause the slideshow when hovering over slider, then resume when no longer hovering
    pauseInvisible: true, //{NEW} Boolean: Pause the slideshow when tab is invisible, resume when visible. Provides better UX, lower CPU usage.
    useCSS: true, //{NEW} Boolean: Slider will use CSS3 transitions if available
    touch: true, //{NEW} Boolean: Allow touch swipe navigation of the slider on touch-enabled devices
    video: false, //{NEW} Boolean: If using video in the slider, will prevent CSS3 3D Transforms to avoid graphical glitches

    // Primary Controls
    controlNav: true, //Boolean: Create navigation for paging control of each slide? Note: Leave true for manualControls usage
    directionNav: true, //Boolean: Create navigation for previous/next navigation? (true/false)
    prevText: "Previous", //String: Set the text for the "previous" directionNav item
    nextText: "Next", //String: Set the text for the "next" directionNav item

    // Secondary Navigation
    keyboard: true, //Boolean: Allow slider navigating via keyboard left/right keys
    multipleKeyboard: false, //{NEW} Boolean: Allow keyboard navigation to affect multiple sliders. Default behavior cuts out keyboard navigation with more than one slider present.
    mousewheel: false, //{UPDATED} Boolean: Requires jquery.mousewheel.js (https://github.com/brandonaaron/jquery-mousewheel) - Allows slider navigating via mousewheel
    pausePlay: false, //Boolean: Create pause/play dynamic element
    pauseText: "Pause", //String: Set the text for the "pause" pausePlay item
    playText: "Play", //String: Set the text for the "play" pausePlay item

    // Special properties
    controlsContainer: "", //{UPDATED} jQuery Object/Selector: Declare which container the navigation elements should be appended too. Default container is the FlexSlider element. Example use would be $(".flexslider-container"). Property is ignored if given element is not found.
    manualControls: "", //{UPDATED} jQuery Object/Selector: Declare custom control navigation. Examples would be $(".flex-control-nav li") or "#tabs-nav li img", etc. The number of elements in your controlNav should match the number of slides/tabs.
    customDirectionNav: "", //{NEW} jQuery Object/Selector: Custom prev / next button. Must be two jQuery elements. In order to make the events work they have to have the classes "prev" and "next" (plus namespace)
    sync: "", //{NEW} Selector: Mirror the actions performed on this slider with another slider. Use with care.
    asNavFor: "", //{NEW} Selector: Internal property exposed for turning the slider into a thumbnail navigation for another slider

    // Carousel Options
    itemWidth: 0, //{NEW} Integer: Box-model width of individual carousel items, including horizontal borders and padding.
    itemMargin: 0, //{NEW} Integer: Margin between carousel items.
    minItems: 1, //{NEW} Integer: Minimum number of carousel items that should be visible. Items will resize fluidly when below this.
    maxItems: 0, //{NEW} Integer: Maxmimum number of carousel items that should be visible. Items will resize fluidly when above this limit.
    move: 0, //{NEW} Integer: Number of carousel items that should move on animation. If 0, slider will move all visible items.
    allowOneSlide: true, //{NEW} Boolean: Whether or not to allow a slider comprised of a single slide

    // Callback API
    start: function() {}, //Callback: function(slider) - Fires when the slider loads the first slide
    before: function() {}, //Callback: function(slider) - Fires asynchronously with each slider animation
    after: function() {}, //Callback: function(slider) - Fires after each slider animation completes
    end: function() {}, //Callback: function(slider) - Fires when the slider reaches the last slide (asynchronous)
    added: function() {}, //{NEW} Callback: function(slider) - Fires after a slide is added
    removed: function() {}, //{NEW} Callback: function(slider) - Fires after a slide is removed
    init: function() {} //{NEW} Callback: function(slider) - Fires after the slider is initially setup
  };

  //FlexSlider: Plugin Function
  $.fn.flexslider = function(options) {
    if (options === undefined) {
      options = {};
    }

    if (typeof options === "object") {
      return this.each(function() {
        var $this = $(this),
          selector = (options.selector) ? options.selector : ".slides > li",
          $slides = $this.find(selector);

        if (($slides.length === 1 && options.allowOneSlide === false) || $slides.length === 0) {
          $slides.fadeIn(400);
          if (options.start) {
            options.start($this);
          }
        } else if ($this.data('flexslider') === undefined) {
          new $.flexslider(this, options);
        }
      });
    } else {
      // Helper strings to quickly perform functions on the slider
      var $slider = $(this).data('flexslider');
      switch (options) {
        case "play":
          $slider.play();
          break;
        case "pause":
          $slider.pause();
          break;
        case "stop":
          $slider.stop();
          break;
        case "next":
          $slider.flexAnimate($slider.getTarget("next"), true);
          break;
        case "prev":
        case "previous":
          $slider.flexAnimate($slider.getTarget("prev"), true);
          break;
        default:
          if (typeof options === "number") {
            $slider.flexAnimate(options, true);
          }
      }
    }
  };
})(jQuery);;
// JavaScript Document


/*
 * Tiny Scrollbar
 * http://www.baijs.nl/tinyscrollbar/
 *
 * Dual licensed under the MIT or GPL Version 2 licenses.
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.opensource.org/licenses/gpl-2.0.php
 *
 * Date: 13 / 08 / 2012
 * @version 1.81
 * @author Maarten Baijs
 *
 */
;
(function($) {
  $.tiny = $.tiny || {};

  $.tiny.scrollbar = {
    options: {
      axis: 'y' // vertical or horizontal scrollbar? ( x || y ).
        ,
      wheel: 40 // how many pixels must the mouswheel scroll at a time.
        ,
      scroll: true // enable or disable the mousewheel.
        ,
      lockscroll: true // return scrollwheel to browser if there is no more content.
        ,
      size: 'auto' // set the size of the scrollbar to auto or a fixed number.
        ,
      sizethumb: 'auto' // set the size of the thumb to auto or a fixed number.
        ,
      invertscroll: false // Enable mobile invert style scrolling
    }
  };

  $.fn.tinyscrollbar = function(params) {
    var options = $.extend({}, $.tiny.scrollbar.options, params);

    this.each(function() {
      $(this).data('tsb', new Scrollbar($(this), options));
    });

    return this;
  };

  $.fn.tinyscrollbar_update = function(sScroll) {
    return $(this).data('tsb').update(sScroll);
  };

  function Scrollbar(root, options) {
    var oSelf = this,
      oWrapper = root,
      oViewport = {
        obj: $('.viewport', root)
      },
      oContent = {
        obj: $('.overview', root)
      },
      oScrollbar = {
        obj: $('.scrollbar', root)
      },
      oTrack = {
        obj: $('.track', oScrollbar.obj)
      },
      oThumb = {
        obj: $('.thumb', oScrollbar.obj)
      },
      sAxis = options.axis === 'x',
      sDirection = sAxis ? 'left' : 'top',
      sSize = sAxis ? 'Width' : 'Height',
      iScroll = 0,
      iPosition = {
        start: 0,
        now: 0
      },
      iMouse = {},
      touchEvents = 'ontouchstart' in document.documentElement;

    function initialize() {
      oSelf.update();
      setEvents();

      return oSelf;
    }

    this.update = function(sScroll) {
      oViewport[options.axis] = oViewport.obj[0]['offset' + sSize];
      oContent[options.axis] = oContent.obj[0]['scroll' + sSize];
      oContent.ratio = oViewport[options.axis] / oContent[options.axis];

      oScrollbar.obj.toggleClass('disable', oContent.ratio >= 1);

      oTrack[options.axis] = options.size === 'auto' ? oViewport[options.axis] : options.size;
      oThumb[options.axis] = Math.min(oTrack[options.axis], Math.max(0, (options.sizethumb === 'auto' ? (oTrack[options.axis] * oContent.ratio) : options.sizethumb)));

      oScrollbar.ratio = options.sizethumb === 'auto' ? (oContent[options.axis] / oTrack[options.axis]) : (oContent[options.axis] - oViewport[options.axis]) / (oTrack[options.axis] - oThumb[options.axis]);

      iScroll = (sScroll === 'relative' && oContent.ratio <= 1) ? Math.min((oContent[options.axis] - oViewport[options.axis]), Math.max(0, iScroll)) : 0;
      iScroll = (sScroll === 'bottom' && oContent.ratio <= 1) ? (oContent[options.axis] - oViewport[options.axis]) : isNaN(parseInt(sScroll, 10)) ? iScroll : parseInt(sScroll, 10);

      setSize();
    };

    function setSize() {
      var sCssSize = sSize.toLowerCase();

      oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
      oContent.obj.css(sDirection, -iScroll);
      iMouse.start = oThumb.obj.offset()[sDirection];

      oScrollbar.obj.css(sCssSize, oTrack[options.axis]);
      oTrack.obj.css(sCssSize, oTrack[options.axis]);
      oThumb.obj.css(sCssSize, oThumb[options.axis]);
    }

    function setEvents() {
      if (!touchEvents) {
        oThumb.obj.bind('mousedown', start);
        oTrack.obj.bind('mouseup', drag);
      } else {
        //alert('set event');
        $(oViewport.obj[0]).bind('touchstart', function(event) {
          //alert('ontouchstart');
          //$('.searchform-wrapper').html('<div style="color:white">here</div>');
          if (1 === event.originalEvent.touches.length) {
            //event.preventDefault();
            start(event.originalEvent.touches[0]);
            event.originalEvent.stopPropagation();
          }
        });


        $('.primary').bind('touchstart', function(event) {
          //$('.searchform-wrapper').html('<div style="color:white">there</div>');
        });
        /*
                oViewport.obj[0].ontouchstart = function( event )
                {
                            //  alert('ontouchstart');
                    if( 1 === event.touches.length )
                    {
                        start( event.touches[ 0 ] );
                        event.stopPropagation();
                    }
                }; */
      }

      if (options.scroll && window.addEventListener) {
        oWrapper[0].addEventListener('DOMMouseScroll', wheel, false);
        oWrapper[0].addEventListener('mousewheel', wheel, false);
        oWrapper[0].addEventListener('MozMousePixelScroll', function(event) {
          event.preventDefault();
        }, false);
      } else if (options.scroll) {
        oWrapper[0].onmousewheel = wheel;
      }
    }

    function start(event) {
      $("body").addClass("noSelect");

      var oThumbDir = parseInt(oThumb.obj.css(sDirection), 10);
      iMouse.start = sAxis ? event.pageX : event.pageY;
      iPosition.start = oThumbDir == 'auto' ? 0 : oThumbDir;

      if (!touchEvents) {
        $(document).bind('mousemove', drag);
        $(document).bind('mouseup', end);
        oThumb.obj.bind('mouseup', end);
      } else {
        /*
                            $('.searchform-wrapper').html('<div style="color:white">start</div>');
                                $(document).bind('touchmove', function(event){
                                    $('.searchform-wrapper').html('<div style="color:white">ontouchmove</div>');
                                    event.preventDefault();
                  drag( event.originalEvent.touches[ 0 ] );
                                });
                                */
        document.ontouchmove = function(event) {
          //$('.searchform-wrapper').html('<div style="color:white">ontouchmove</div>');
          event.preventDefault();
          drag(event.touches[0]);
        };

        document.ontouchend = end;

      }
    }

    function wheel(event) {
      if (oContent.ratio < 1) {
        var oEvent = event || window.event,
          iDelta = oEvent.wheelDelta ? oEvent.wheelDelta / 120 : -oEvent.detail / 3;

        iScroll -= iDelta * options.wheel;
        iScroll = Math.min((oContent[options.axis] - oViewport[options.axis]), Math.max(0, iScroll));

        oThumb.obj.css(sDirection, iScroll / oScrollbar.ratio);
        oContent.obj.css(sDirection, -iScroll);

        if (options.lockscroll || (iScroll !== (oContent[options.axis] - oViewport[options.axis]) && iScroll !== 0)) {
          oEvent = $.event.fix(oEvent);
          oEvent.preventDefault();
        }
      }
    }

    function drag(event) {
      if (oContent.ratio < 1) {
        if (options.invertscroll && touchEvents) {
          iPosition.now = Math.min((oTrack[options.axis] - oThumb[options.axis]), Math.max(0, (iPosition.start + (iMouse.start - (sAxis ? event.pageX : event.pageY)))));
        } else {
          iPosition.now = Math.min((oTrack[options.axis] - oThumb[options.axis]), Math.max(0, (iPosition.start + ((sAxis ? event.pageX : event.pageY) - iMouse.start))));
        }

        iScroll = iPosition.now * oScrollbar.ratio;
        oContent.obj.css(sDirection, -iScroll);
        oThumb.obj.css(sDirection, iPosition.now);
      }
    }

    function end() {
      $("body").removeClass("noSelect");
      $(document).unbind('mousemove', drag);
      $(document).unbind('mouseup', end);
      oThumb.obj.unbind('mouseup', end);
      document.ontouchmove = document.ontouchend = null;
    }

    return initialize();
  }

}(jQuery));;
/*! Magnific Popup - v1.1.0 - 2016-02-20
 * http://dimsemenov.com/plugins/magnific-popup/
 * Copyright (c) 2016 Dmitry Semenov; */
! function(a) {
  "function" == typeof define && define.amd ? define(["jquery"], a) : a("object" == typeof exports ? require("jquery") : window.jQuery || window.Zepto)
}(function(a) {
  var b, c, d, e, f, g, h = "Close",
    i = "BeforeClose",
    j = "AfterClose",
    k = "BeforeAppend",
    l = "MarkupParse",
    m = "Open",
    n = "Change",
    o = "mfp",
    p = "." + o,
    q = "mfp-ready",
    r = "mfp-removing",
    s = "mfp-prevent-close",
    t = function() {},
    u = !!window.jQuery,
    v = a(window),
    w = function(a, c) {
      b.ev.on(o + a + p, c)
    },
    x = function(b, c, d, e) {
      var f = document.createElement("div");
      return f.className = "mfp-" + b, d && (f.innerHTML = d), e ? c && c.appendChild(f) : (f = a(f), c && f.appendTo(c)), f
    },
    y = function(c, d) {
      b.ev.triggerHandler(o + c, d), b.st.callbacks && (c = c.charAt(0).toLowerCase() + c.slice(1), b.st.callbacks[c] && b.st.callbacks[c].apply(b, a.isArray(d) ? d : [d]))
    },
    z = function(c) {
      return c === g && b.currTemplate.closeBtn || (b.currTemplate.closeBtn = a(b.st.closeMarkup.replace("%title%", b.st.tClose)), g = c), b.currTemplate.closeBtn
    },
    A = function() {
      a.magnificPopup.instance || (b = new t, b.init(), a.magnificPopup.instance = b)
    },
    B = function() {
      var a = document.createElement("p").style,
        b = ["ms", "O", "Moz", "Webkit"];
      if (void 0 !== a.transition) return !0;
      for (; b.length;)
        if (b.pop() + "Transition" in a) return !0;
      return !1
    };
  t.prototype = {
    constructor: t,
    init: function() {
      var c = navigator.appVersion;
      b.isLowIE = b.isIE8 = document.all && !document.addEventListener, b.isAndroid = /android/gi.test(c), b.isIOS = /iphone|ipad|ipod/gi.test(c), b.supportsTransition = B(), b.probablyMobile = b.isAndroid || b.isIOS || /(Opera Mini)|Kindle|webOS|BlackBerry|(Opera Mobi)|(Windows Phone)|IEMobile/i.test(navigator.userAgent), d = a(document), b.popupsCache = {}
    },
    open: function(c) {
      var e;
      if (c.isObj === !1) {
        b.items = c.items.toArray(), b.index = 0;
        var g, h = c.items;
        for (e = 0; e < h.length; e++)
          if (g = h[e], g.parsed && (g = g.el[0]), g === c.el[0]) {
            b.index = e;
            break
          }
      } else b.items = a.isArray(c.items) ? c.items : [c.items], b.index = c.index || 0;
      if (b.isOpen) return void b.updateItemHTML();
      b.types = [], f = "", c.mainEl && c.mainEl.length ? b.ev = c.mainEl.eq(0) : b.ev = d, c.key ? (b.popupsCache[c.key] || (b.popupsCache[c.key] = {}), b.currTemplate = b.popupsCache[c.key]) : b.currTemplate = {}, b.st = a.extend(!0, {}, a.magnificPopup.defaults, c), b.fixedContentPos = "auto" === b.st.fixedContentPos ? !b.probablyMobile : b.st.fixedContentPos, b.st.modal && (b.st.closeOnContentClick = !1, b.st.closeOnBgClick = !1, b.st.showCloseBtn = !1, b.st.enableEscapeKey = !1), b.bgOverlay || (b.bgOverlay = x("bg").on("click" + p, function() {
        b.close()
      }), b.wrap = x("wrap").attr("tabindex", -1).on("click" + p, function(a) {
        b._checkIfClose(a.target) && b.close()
      }), b.container = x("container", b.wrap)), b.contentContainer = x("content"), b.st.preloader && (b.preloader = x("preloader", b.container, b.st.tLoading));
      var i = a.magnificPopup.modules;
      for (e = 0; e < i.length; e++) {
        var j = i[e];
        j = j.charAt(0).toUpperCase() + j.slice(1), b["init" + j].call(b)
      }
      y("BeforeOpen"), b.st.showCloseBtn && (b.st.closeBtnInside ? (w(l, function(a, b, c, d) {
        c.close_replaceWith = z(d.type)
      }), f += " mfp-close-btn-in") : b.wrap.append(z())), b.st.alignTop && (f += " mfp-align-top"), b.fixedContentPos ? b.wrap.css({
        overflow: b.st.overflowY,
        overflowX: "hidden",
        overflowY: b.st.overflowY
      }) : b.wrap.css({
        top: v.scrollTop(),
        position: "absolute"
      }), (b.st.fixedBgPos === !1 || "auto" === b.st.fixedBgPos && !b.fixedContentPos) && b.bgOverlay.css({
        height: d.height(),
        position: "absolute"
      }), b.st.enableEscapeKey && d.on("keyup" + p, function(a) {
        27 === a.keyCode && b.close()
      }), v.on("resize" + p, function() {
        b.updateSize()
      }), b.st.closeOnContentClick || (f += " mfp-auto-cursor"), f && b.wrap.addClass(f);
      var k = b.wH = v.height(),
        n = {};
      if (b.fixedContentPos && b._hasScrollBar(k)) {
        var o = b._getScrollbarSize();
        o && (n.marginRight = o)
      }
      b.fixedContentPos && (b.isIE7 ? a("body, html").css("overflow", "hidden") : n.overflow = "hidden");
      var r = b.st.mainClass;
      return b.isIE7 && (r += " mfp-ie7"), r && b._addClassToMFP(r), b.updateItemHTML(), y("BuildControls"), a("html").css(n), b.bgOverlay.add(b.wrap).prependTo(b.st.prependTo || a(document.body)), b._lastFocusedEl = document.activeElement, setTimeout(function() {
        b.content ? (b._addClassToMFP(q), b._setFocus()) : b.bgOverlay.addClass(q), d.on("focusin" + p, b._onFocusIn)
      }, 16), b.isOpen = !0, b.updateSize(k), y(m), c
    },
    close: function() {
      b.isOpen && (y(i), b.isOpen = !1, b.st.removalDelay && !b.isLowIE && b.supportsTransition ? (b._addClassToMFP(r), setTimeout(function() {
        b._close()
      }, b.st.removalDelay)) : b._close())
    },
    _close: function() {
      y(h);
      var c = r + " " + q + " ";
      if (b.bgOverlay.detach(), b.wrap.detach(), b.container.empty(), b.st.mainClass && (c += b.st.mainClass + " "), b._removeClassFromMFP(c), b.fixedContentPos) {
        var e = {
          marginRight: ""
        };
        b.isIE7 ? a("body, html").css("overflow", "") : e.overflow = "", a("html").css(e)
      }
      d.off("keyup" + p + " focusin" + p), b.ev.off(p), b.wrap.attr("class", "mfp-wrap").removeAttr("style"), b.bgOverlay.attr("class", "mfp-bg"), b.container.attr("class", "mfp-container"), !b.st.showCloseBtn || b.st.closeBtnInside && b.currTemplate[b.currItem.type] !== !0 || b.currTemplate.closeBtn && b.currTemplate.closeBtn.detach(), b.st.autoFocusLast && b._lastFocusedEl && a(b._lastFocusedEl).focus(), b.currItem = null, b.content = null, b.currTemplate = null, b.prevHeight = 0, y(j)
    },
    updateSize: function(a) {
      if (b.isIOS) {
        var c = document.documentElement.clientWidth / window.innerWidth,
          d = window.innerHeight * c;
        b.wrap.css("height", d), b.wH = d
      } else b.wH = a || v.height();
      b.fixedContentPos || b.wrap.css("height", b.wH), y("Resize")
    },
    updateItemHTML: function() {
      var c = b.items[b.index];
      b.contentContainer.detach(), b.content && b.content.detach(), c.parsed || (c = b.parseEl(b.index));
      var d = c.type;
      if (y("BeforeChange", [b.currItem ? b.currItem.type : "", d]), b.currItem = c, !b.currTemplate[d]) {
        var f = b.st[d] ? b.st[d].markup : !1;
        y("FirstMarkupParse", f), f ? b.currTemplate[d] = a(f) : b.currTemplate[d] = !0
      }
      e && e !== c.type && b.container.removeClass("mfp-" + e + "-holder");
      var g = b["get" + d.charAt(0).toUpperCase() + d.slice(1)](c, b.currTemplate[d]);
      b.appendContent(g, d), c.preloaded = !0, y(n, c), e = c.type, b.container.prepend(b.contentContainer), y("AfterChange")
    },
    appendContent: function(a, c) {
      b.content = a, a ? b.st.showCloseBtn && b.st.closeBtnInside && b.currTemplate[c] === !0 ? b.content.find(".mfp-close").length || b.content.append(z()) : b.content = a : b.content = "", y(k), b.container.addClass("mfp-" + c + "-holder"), b.contentContainer.append(b.content)
    },
    parseEl: function(c) {
      var d, e = b.items[c];
      if (e.tagName ? e = {
          el: a(e)
        } : (d = e.type, e = {
          data: e,
          src: e.src
        }), e.el) {
        for (var f = b.types, g = 0; g < f.length; g++)
          if (e.el.hasClass("mfp-" + f[g])) {
            d = f[g];
            break
          }
        e.src = e.el.attr("data-mfp-src"), e.src || (e.src = e.el.attr("href"))
      }
      return e.type = d || b.st.type || "inline", e.index = c, e.parsed = !0, b.items[c] = e, y("ElementParse", e), b.items[c]
    },
    addGroup: function(a, c) {
      var d = function(d) {
        d.mfpEl = this, b._openClick(d, a, c)
      };
      c || (c = {});
      var e = "click.magnificPopup";
      c.mainEl = a, c.items ? (c.isObj = !0, a.off(e).on(e, d)) : (c.isObj = !1, c.delegate ? a.off(e).on(e, c.delegate, d) : (c.items = a, a.off(e).on(e, d)))
    },
    _openClick: function(c, d, e) {
      var f = void 0 !== e.midClick ? e.midClick : a.magnificPopup.defaults.midClick;
      if (f || !(2 === c.which || c.ctrlKey || c.metaKey || c.altKey || c.shiftKey)) {
        var g = void 0 !== e.disableOn ? e.disableOn : a.magnificPopup.defaults.disableOn;
        if (g)
          if (a.isFunction(g)) {
            if (!g.call(b)) return !0
          } else if (v.width() < g) return !0;
        c.type && (c.preventDefault(), b.isOpen && c.stopPropagation()), e.el = a(c.mfpEl), e.delegate && (e.items = d.find(e.delegate)), b.open(e)
      }
    },
    updateStatus: function(a, d) {
      if (b.preloader) {
        c !== a && b.container.removeClass("mfp-s-" + c), d || "loading" !== a || (d = b.st.tLoading);
        var e = {
          status: a,
          text: d
        };
        y("UpdateStatus", e), a = e.status, d = e.text, b.preloader.html(d), b.preloader.find("a").on("click", function(a) {
          a.stopImmediatePropagation()
        }), b.container.addClass("mfp-s-" + a), c = a
      }
    },
    _checkIfClose: function(c) {
      if (!a(c).hasClass(s)) {
        var d = b.st.closeOnContentClick,
          e = b.st.closeOnBgClick;
        if (d && e) return !0;
        if (!b.content || a(c).hasClass("mfp-close") || b.preloader && c === b.preloader[0]) return !0;
        if (c === b.content[0] || a.contains(b.content[0], c)) {
          if (d) return !0
        } else if (e && a.contains(document, c)) return !0;
        return !1
      }
    },
    _addClassToMFP: function(a) {
      b.bgOverlay.addClass(a), b.wrap.addClass(a)
    },
    _removeClassFromMFP: function(a) {
      this.bgOverlay.removeClass(a), b.wrap.removeClass(a)
    },
    _hasScrollBar: function(a) {
      return (b.isIE7 ? d.height() : document.body.scrollHeight) > (a || v.height())
    },
    _setFocus: function() {
      (b.st.focus ? b.content.find(b.st.focus).eq(0) : b.wrap).focus()
    },
    _onFocusIn: function(c) {
      return c.target === b.wrap[0] || a.contains(b.wrap[0], c.target) ? void 0 : (b._setFocus(), !1)
    },
    _parseMarkup: function(b, c, d) {
      var e;
      d.data && (c = a.extend(d.data, c)), y(l, [b, c, d]), a.each(c, function(c, d) {
        if (void 0 === d || d === !1) return !0;
        if (e = c.split("_"), e.length > 1) {
          var f = b.find(p + "-" + e[0]);
          if (f.length > 0) {
            var g = e[1];
            "replaceWith" === g ? f[0] !== d[0] && f.replaceWith(d) : "img" === g ? f.is("img") ? f.attr("src", d) : f.replaceWith(a("<img>").attr("src", d).attr("class", f.attr("class"))) : f.attr(e[1], d)
          }
        } else b.find(p + "-" + c).html(d)
      })
    },
    _getScrollbarSize: function() {
      if (void 0 === b.scrollbarSize) {
        var a = document.createElement("div");
        a.style.cssText = "width: 99px; height: 99px; overflow: scroll; position: absolute; top: -9999px;", document.body.appendChild(a), b.scrollbarSize = a.offsetWidth - a.clientWidth, document.body.removeChild(a)
      }
      return b.scrollbarSize
    }
  }, a.magnificPopup = {
    instance: null,
    proto: t.prototype,
    modules: [],
    open: function(b, c) {
      return A(), b = b ? a.extend(!0, {}, b) : {}, b.isObj = !0, b.index = c || 0, this.instance.open(b)
    },
    close: function() {
      return a.magnificPopup.instance && a.magnificPopup.instance.close()
    },
    registerModule: function(b, c) {
      c.options && (a.magnificPopup.defaults[b] = c.options), a.extend(this.proto, c.proto), this.modules.push(b)
    },
    defaults: {
      disableOn: 0,
      key: null,
      midClick: !1,
      mainClass: "",
      preloader: !0,
      focus: "",
      closeOnContentClick: !1,
      closeOnBgClick: !0,
      closeBtnInside: !0,
      showCloseBtn: !0,
      enableEscapeKey: !0,
      modal: !1,
      alignTop: !1,
      removalDelay: 0,
      prependTo: null,
      fixedContentPos: "auto",
      fixedBgPos: "auto",
      overflowY: "auto",
      closeMarkup: '<button title="%title%" type="button" class="mfp-close">&#215;</button>',
      tClose: "Close (Esc)",
      tLoading: "Loading...",
      autoFocusLast: !0
    }
  }, a.fn.magnificPopup = function(c) {
    A();
    var d = a(this);
    if ("string" == typeof c)
      if ("open" === c) {
        var e, f = u ? d.data("magnificPopup") : d[0].magnificPopup,
          g = parseInt(arguments[1], 10) || 0;
        f.items ? e = f.items[g] : (e = d, f.delegate && (e = e.find(f.delegate)), e = e.eq(g)), b._openClick({
          mfpEl: e
        }, d, f)
      } else b.isOpen && b[c].apply(b, Array.prototype.slice.call(arguments, 1));
    else c = a.extend(!0, {}, c), u ? d.data("magnificPopup", c) : d[0].magnificPopup = c, b.addGroup(d, c);
    return d
  };
  var C, D, E, F = "inline",
    G = function() {
      E && (D.after(E.addClass(C)).detach(), E = null)
    };
  a.magnificPopup.registerModule(F, {
    options: {
      hiddenClass: "hide",
      markup: "",
      tNotFound: "Content not found"
    },
    proto: {
      initInline: function() {
        b.types.push(F), w(h + "." + F, function() {
          G()
        })
      },
      getInline: function(c, d) {
        if (G(), c.src) {
          var e = b.st.inline,
            f = a(c.src);
          if (f.length) {
            var g = f[0].parentNode;
            g && g.tagName && (D || (C = e.hiddenClass, D = x(C), C = "mfp-" + C), E = f.after(D).detach().removeClass(C)), b.updateStatus("ready")
          } else b.updateStatus("error", e.tNotFound), f = a("<div>");
          return c.inlineElement = f, f
        }
        return b.updateStatus("ready"), b._parseMarkup(d, {}, c), d
      }
    }
  });
  var H, I = "ajax",
    J = function() {
      H && a(document.body).removeClass(H)
    },
    K = function() {
      J(), b.req && b.req.abort()
    };
  a.magnificPopup.registerModule(I, {
    options: {
      settings: null,
      cursor: "mfp-ajax-cur",
      tError: '<a href="%url%">The content</a> could not be loaded.'
    },
    proto: {
      initAjax: function() {
        b.types.push(I), H = b.st.ajax.cursor, w(h + "." + I, K), w("BeforeChange." + I, K)
      },
      getAjax: function(c) {
        H && a(document.body).addClass(H), b.updateStatus("loading");
        var d = a.extend({
          url: c.src,
          success: function(d, e, f) {
            var g = {
              data: d,
              xhr: f
            };
            y("ParseAjax", g), b.appendContent(a(g.data), I), c.finished = !0, J(), b._setFocus(), setTimeout(function() {
              b.wrap.addClass(q)
            }, 16), b.updateStatus("ready"), y("AjaxContentAdded")
          },
          error: function() {
            J(), c.finished = c.loadError = !0, b.updateStatus("error", b.st.ajax.tError.replace("%url%", c.src))
          }
        }, b.st.ajax.settings);
        return b.req = a.ajax(d), ""
      }
    }
  });
  var L, M = function(c) {
    if (c.data && void 0 !== c.data.title) return c.data.title;
    var d = b.st.image.titleSrc;
    if (d) {
      if (a.isFunction(d)) return d.call(b, c);
      if (c.el) return c.el.attr(d) || ""
    }
    return ""
  };
  a.magnificPopup.registerModule("image", {
    options: {
      markup: '<div class="mfp-figure"><div class="mfp-close"></div><figure><div class="mfp-img"></div><figcaption><div class="mfp-bottom-bar"><div class="mfp-title"></div><div class="mfp-counter"></div></div></figcaption></figure></div>',
      cursor: "mfp-zoom-out-cur",
      titleSrc: "title",
      verticalFit: !0,
      tError: '<a href="%url%">The image</a> could not be loaded.'
    },
    proto: {
      initImage: function() {
        var c = b.st.image,
          d = ".image";
        b.types.push("image"), w(m + d, function() {
          "image" === b.currItem.type && c.cursor && a(document.body).addClass(c.cursor)
        }), w(h + d, function() {
          c.cursor && a(document.body).removeClass(c.cursor), v.off("resize" + p)
        }), w("Resize" + d, b.resizeImage), b.isLowIE && w("AfterChange", b.resizeImage)
      },
      resizeImage: function() {
        var a = b.currItem;
        if (a && a.img && b.st.image.verticalFit) {
          var c = 0;
          b.isLowIE && (c = parseInt(a.img.css("padding-top"), 10) + parseInt(a.img.css("padding-bottom"), 10)), a.img.css("max-height", b.wH - c)
        }
      },
      _onImageHasSize: function(a) {
        a.img && (a.hasSize = !0, L && clearInterval(L), a.isCheckingImgSize = !1, y("ImageHasSize", a), a.imgHidden && (b.content && b.content.removeClass("mfp-loading"), a.imgHidden = !1))
      },
      findImageSize: function(a) {
        var c = 0,
          d = a.img[0],
          e = function(f) {
            L && clearInterval(L), L = setInterval(function() {
              return d.naturalWidth > 0 ? void b._onImageHasSize(a) : (c > 200 && clearInterval(L), c++, void(3 === c ? e(10) : 40 === c ? e(50) : 100 === c && e(500)))
            }, f)
          };
        e(1)
      },
      getImage: function(c, d) {
        var e = 0,
          f = function() {
            c && (c.img[0].complete ? (c.img.off(".mfploader"), c === b.currItem && (b._onImageHasSize(c), b.updateStatus("ready")), c.hasSize = !0, c.loaded = !0, y("ImageLoadComplete")) : (e++, 200 > e ? setTimeout(f, 100) : g()))
          },
          g = function() {
            c && (c.img.off(".mfploader"), c === b.currItem && (b._onImageHasSize(c), b.updateStatus("error", h.tError.replace("%url%", c.src))), c.hasSize = !0, c.loaded = !0, c.loadError = !0)
          },
          h = b.st.image,
          i = d.find(".mfp-img");
        if (i.length) {
          var j = document.createElement("img");
          j.className = "mfp-img", c.el && c.el.find("img").length && (j.alt = c.el.find("img").attr("alt")), c.img = a(j).on("load.mfploader", f).on("error.mfploader", g), j.src = c.src, i.is("img") && (c.img = c.img.clone()), j = c.img[0], j.naturalWidth > 0 ? c.hasSize = !0 : j.width || (c.hasSize = !1)
        }
        return b._parseMarkup(d, {
          title: M(c),
          img_replaceWith: c.img
        }, c), b.resizeImage(), c.hasSize ? (L && clearInterval(L), c.loadError ? (d.addClass("mfp-loading"), b.updateStatus("error", h.tError.replace("%url%", c.src))) : (d.removeClass("mfp-loading"), b.updateStatus("ready")), d) : (b.updateStatus("loading"), c.loading = !0, c.hasSize || (c.imgHidden = !0, d.addClass("mfp-loading"), b.findImageSize(c)), d)
      }
    }
  });
  var N, O = function() {
    return void 0 === N && (N = void 0 !== document.createElement("p").style.MozTransform), N
  };
  a.magnificPopup.registerModule("zoom", {
    options: {
      enabled: !1,
      easing: "ease-in-out",
      duration: 300,
      opener: function(a) {
        return a.is("img") ? a : a.find("img")
      }
    },
    proto: {
      initZoom: function() {
        var a, c = b.st.zoom,
          d = ".zoom";
        if (c.enabled && b.supportsTransition) {
          var e, f, g = c.duration,
            j = function(a) {
              var b = a.clone().removeAttr("style").removeAttr("class").addClass("mfp-animated-image"),
                d = "all " + c.duration / 1e3 + "s " + c.easing,
                e = {
                  position: "fixed",
                  zIndex: 9999,
                  left: 0,
                  top: 0,
                  "-webkit-backface-visibility": "hidden"
                },
                f = "transition";
              return e["-webkit-" + f] = e["-moz-" + f] = e["-o-" + f] = e[f] = d, b.css(e), b
            },
            k = function() {
              b.content.css("visibility", "visible")
            };
          w("BuildControls" + d, function() {
            if (b._allowZoom()) {
              if (clearTimeout(e), b.content.css("visibility", "hidden"), a = b._getItemToZoom(), !a) return void k();
              f = j(a), f.css(b._getOffset()), b.wrap.append(f), e = setTimeout(function() {
                f.css(b._getOffset(!0)), e = setTimeout(function() {
                  k(), setTimeout(function() {
                    f.remove(), a = f = null, y("ZoomAnimationEnded")
                  }, 16)
                }, g)
              }, 16)
            }
          }), w(i + d, function() {
            if (b._allowZoom()) {
              if (clearTimeout(e), b.st.removalDelay = g, !a) {
                if (a = b._getItemToZoom(), !a) return;
                f = j(a)
              }
              f.css(b._getOffset(!0)), b.wrap.append(f), b.content.css("visibility", "hidden"), setTimeout(function() {
                f.css(b._getOffset())
              }, 16)
            }
          }), w(h + d, function() {
            b._allowZoom() && (k(), f && f.remove(), a = null)
          })
        }
      },
      _allowZoom: function() {
        return "image" === b.currItem.type
      },
      _getItemToZoom: function() {
        return b.currItem.hasSize ? b.currItem.img : !1
      },
      _getOffset: function(c) {
        var d;
        d = c ? b.currItem.img : b.st.zoom.opener(b.currItem.el || b.currItem);
        var e = d.offset(),
          f = parseInt(d.css("padding-top"), 10),
          g = parseInt(d.css("padding-bottom"), 10);
        e.top -= a(window).scrollTop() - f;
        var h = {
          width: d.width(),
          height: (u ? d.innerHeight() : d[0].offsetHeight) - g - f
        };
        return O() ? h["-moz-transform"] = h.transform = "translate(" + e.left + "px," + e.top + "px)" : (h.left = e.left, h.top = e.top), h
      }
    }
  });
  var P = "iframe",
    Q = "https://about:blank",
    R = function(a) {
      if (b.currTemplate[P]) {
        var c = b.currTemplate[P].find("iframe");
        c.length && (a || (c[0].src = Q), b.isIE8 && c.css("display", a ? "block" : "none"))
      }
    };
  a.magnificPopup.registerModule(P, {
    options: {
      markup: '<div class="mfp-iframe-scaler"><div class="mfp-close"></div><iframe class="mfp-iframe" src="https://about:blank" frameborder="0" allowfullscreen></iframe></div>',
      srcAction: "iframe_src",
      patterns: {
        youtube: {
          index: "youtube.com",
          id: "v=",
          src: "https://www.youtube.com/embed/%id%?autoplay=1"
        },
        vimeo: {
          index: "vimeo.com/",
          id: "/",
          src: "https://player.vimeo.com/video/%id%?autoplay=1"
        },
        gmaps: {
          index: "https://maps.google./",
          src: "%id%&output=embed"
        }
      }
    },
    proto: {
      initIframe: function() {
        b.types.push(P), w("BeforeChange", function(a, b, c) {
          b !== c && (b === P ? R() : c === P && R(!0))
        }), w(h + "." + P, function() {
          R()
        })
      },
      getIframe: function(c, d) {
        var e = c.src,
          f = b.st.iframe;
        a.each(f.patterns, function() {
          return e.indexOf(this.index) > -1 ? (this.id && (e = "string" == typeof this.id ? e.substr(e.lastIndexOf(this.id) + this.id.length, e.length) : this.id.call(this, e)), e = this.src.replace("%id%", e), !1) : void 0
        });
        var g = {};
        return f.srcAction && (g[f.srcAction] = e), b._parseMarkup(d, g, c), b.updateStatus("ready"), d
      }
    }
  });
  var S = function(a) {
      var c = b.items.length;
      return a > c - 1 ? a - c : 0 > a ? c + a : a
    },
    T = function(a, b, c) {
      return a.replace(/%curr%/gi, b + 1).replace(/%total%/gi, c)
    };
  a.magnificPopup.registerModule("gallery", {
    options: {
      enabled: !1,
      arrowMarkup: '<button title="%title%" type="button" class="mfp-arrow mfp-arrow-%dir%"></button>',
      preload: [0, 2],
      navigateByImgClick: !0,
      arrows: !0,
      tPrev: "Previous (Left arrow key)",
      tNext: "Next (Right arrow key)",
      tCounter: "%curr% of %total%"
    },
    proto: {
      initGallery: function() {
        var c = b.st.gallery,
          e = ".mfp-gallery";
        return b.direction = !0, c && c.enabled ? (f += " mfp-gallery", w(m + e, function() {
          c.navigateByImgClick && b.wrap.on("click" + e, ".mfp-img", function() {
            return b.items.length > 1 ? (b.next(), !1) : void 0
          }), d.on("keydown" + e, function(a) {
            37 === a.keyCode ? b.prev() : 39 === a.keyCode && b.next()
          })
        }), w("UpdateStatus" + e, function(a, c) {
          c.text && (c.text = T(c.text, b.currItem.index, b.items.length))
        }), w(l + e, function(a, d, e, f) {
          var g = b.items.length;
          e.counter = g > 1 ? T(c.tCounter, f.index, g) : ""
        }), w("BuildControls" + e, function() {
          if (b.items.length > 1 && c.arrows && !b.arrowLeft) {
            var d = c.arrowMarkup,
              e = b.arrowLeft = a(d.replace(/%title%/gi, c.tPrev).replace(/%dir%/gi, "left")).addClass(s),
              f = b.arrowRight = a(d.replace(/%title%/gi, c.tNext).replace(/%dir%/gi, "right")).addClass(s);
            e.click(function() {
              b.prev()
            }), f.click(function() {
              b.next()
            }), b.container.append(e.add(f))
          }
        }), w(n + e, function() {
          b._preloadTimeout && clearTimeout(b._preloadTimeout), b._preloadTimeout = setTimeout(function() {
            b.preloadNearbyImages(), b._preloadTimeout = null
          }, 16)
        }), void w(h + e, function() {
          d.off(e), b.wrap.off("click" + e), b.arrowRight = b.arrowLeft = null
        })) : !1
      },
      next: function() {
        b.direction = !0, b.index = S(b.index + 1), b.updateItemHTML()
      },
      prev: function() {
        b.direction = !1, b.index = S(b.index - 1), b.updateItemHTML()
      },
      goTo: function(a) {
        b.direction = a >= b.index, b.index = a, b.updateItemHTML()
      },
      preloadNearbyImages: function() {
        var a, c = b.st.gallery.preload,
          d = Math.min(c[0], b.items.length),
          e = Math.min(c[1], b.items.length);
        for (a = 1; a <= (b.direction ? e : d); a++) b._preloadItem(b.index + a);
        for (a = 1; a <= (b.direction ? d : e); a++) b._preloadItem(b.index - a)
      },
      _preloadItem: function(c) {
        if (c = S(c), !b.items[c].preloaded) {
          var d = b.items[c];
          d.parsed || (d = b.parseEl(c)), y("LazyLoad", d), "image" === d.type && (d.img = a('<img class="mfp-img" />').on("load.mfploader", function() {
            d.hasSize = !0
          }).on("error.mfploader", function() {
            d.hasSize = !0, d.loadError = !0, y("LazyLoadError", d)
          }).attr("src", d.src)), d.preloaded = !0
        }
      }
    }
  });
  var U = "retina";
  a.magnificPopup.registerModule(U, {
    options: {
      replaceSrc: function(a) {
        return a.src.replace(/\.\w+$/, function(a) {
          return "@2x" + a
        })
      },
      ratio: 1
    },
    proto: {
      initRetina: function() {
        if (window.devicePixelRatio > 1) {
          var a = b.st.retina,
            c = a.ratio;
          c = isNaN(c) ? c() : c, c > 1 && (w("ImageHasSize." + U, function(a, b) {
            b.img.css({
              "max-width": b.img[0].naturalWidth / c,
              width: "100%"
            })
          }), w("ElementParse." + U, function(b, d) {
            d.src = a.replaceSrc(d, c)
          }))
        }
      }
    }
  }), A()
});;
jQuery(document).ready(function() {

  if (jQuery('#carousel').length > 0) {
    jQuery('.flexslider_t').flexslider({
      animation: "slide",
      controlNav: "thumbnails"
    });

    jQuery('#carousel').flexslider({
      animation: "slide",
      controlNav: false,
      animationLoop: false,
      slideshow: false,
      itemWidth: 100,
      itemMargin: 0,
      asNavFor: '#slider'
    });

    jQuery('#slider').flexslider({
      animation: "slide",
      smoothHeight: false,
      controlNav: false,
      animationLoop: false,
      slideshow: false,
      sync: "#carousel"
    });

  } else {
    jQuery('.flexslider').flexslider({
      animation: "slide",
      pausePlay: true,
      useCSS: false,
      smoothHeight: false,
      start: function() {
        // slides_loaded();
      }
    });
  }

  if (use_tinyscroller()) {
    jQuery('#scrollbar1').tinyscrollbar({
      invertscroll: true
    });
  } else {
    set_scroller_height();
  }

  // legacy gazette page
  jQuery('.gazette_list').hide();
  jQuery('#yr2006').show();

  jQuery('#gz_choose_year a').click(function() {
    var yr = jQuery(this).text();
    jQuery('.gazette_list').fadeOut();
    jQuery('#yr' + yr).fadeIn();
  });

  jQuery('#nav-open-btn').click(function() {
    jQuery('#nav-open-btn').hide();
    //jQuery('#nav-open-btn').removeAttr('style');
    jQuery('#nav-close-btn').show();
    jQuery('.secondary').show();

    var touchEvents = 'ontouchstart' in document.documentElement;
    if (touchEvents) {
      //setTimeout(function() { window.scrollTo(0, 1); }, 0);
      jQuery("body").addClass("nooverflow");
    }

    if (use_tinyscroller()) {
      jQuery('#scrollbar1').tinyscrollbar({
        invertscroll: true
      });
    } else {
      set_scroller_height();
    }

    dataLayer.push({
      'eventCategory': 'nav_menu',
      'eventAction': 'click',
      'eventLabel': 'open',
      'event': 'gaEvent'
    });
  });
  jQuery('#nav-close-btn').click(function() {
    jQuery('#nav-close-btn').hide();
    //jQuery('#nav-close-btn').removeAttr('style');
    jQuery('#nav-open-btn').show();
    jQuery('.secondary').hide();
    jQuery('.secondary').removeAttr('style');
    jQuery("body").removeClass("nooverflow");

    dataLayer.push({
      'eventCategory': 'nav_menu',
      'eventAction': 'click',
      'eventLabel': 'close',
      'event': 'gaEvent'
    });
  });

  jQuery('html').click(function() {
    if (jQuery('.secondary').is(":visible") && jQuery('#nav-close-btn').is(":visible")) {
      jQuery('#nav-close-btn').hide();
      //jQuery('#nav-close-btn').removeAttr('style');
      jQuery('#nav-open-btn').show();
      jQuery('.secondary').hide();
      jQuery("body").removeClass("nooverflow");
      jQuery('.secondary').removeAttr('style');
    }
  });

  jQuery('.secondary, #nav-open-btn').click(function(e) {
    e.stopPropagation();
  });

  //check note-body content. only display "show more" when its content is overflow.
  jQuery('a.show-more').each(function() {
    var notes = jQuery(this).parent().parent().find(".photo-description");
    var note = notes[0];
    if (notes.height() + 1 >= note.scrollHeight) { //Some browser has scrollHeight bigger that height by 1 even though there is no overflow.
      jQuery(this).parent().hide();
    }
  });

  jQuery('a.show-more').click(function(e) {
    var notes = jQuery(this).parent().parent().find(".photo-description");
    if (jQuery(this).hasClass('show-more')) {
      var note = notes[0];
      var h = note.scrollHeight;
      notes.animate({
        'height': h
      });
      jQuery(this).removeClass('show-more');
      jQuery(this).addClass('show-less');
      jQuery(this).html("Show Less");
    } else {
      notes.animate({
        'height': '65px'
      });
      jQuery(this).removeClass('show-less');
      jQuery(this).addClass('show-more');
      jQuery(this).html("Show More");
    }

    e.preventDefault();
  });

  jQuery('.image-popup').append('<div class="media-action-overlay">&nbsp;</div>');
  jQuery('.image-popup').magnificPopup({
    type: 'image',
    closeOnContentClick: true,
    image: {
      verticalFit: false
    }
  });
});

function getInternetExplorerVersion() {
  var rv = -1; // Return value assumes failure.
  if (navigator.appName == 'Microsoft Internet Explorer') {
    var ua = navigator.userAgent;
    var re = new RegExp("Trident/([0-9]{1,}[\.0-9]{0,})");
    if (re.exec(ua) != null)
      rv = parseFloat(RegExp.$1);

    if (rv == 3) {
      rv = 7; //IE 7
    } else if (rv == 4) {
      rv = 8; //IE 8
    } else if (rv == 5) {
      rv = 9; //IE 9
    } else if (rv == 6) {
      rv = 10; //IE 10
    }
  }
  return rv;
}

function use_tinyscroller() {
  var touchEvents = 'ontouchstart' in document.documentElement;
  //var iOS = /(iPad|iPhone|iPod)/g.test(navigator.userAgent);
  //if ( !touchEvents || iOS ) {
  if (!touchEvents) {
    return true; //Non-touch OS
  } else {
    return false; //Android based
  }
}

function set_scroller_height() {
  $_viewport = jQuery(".viewport");
  var windowHeight = jQuery(window).height();
  var viewportOffset = $_viewport.offset().top;
  var viewportPosition = $_viewport.position().top;
  if (window.matchMedia !== "undefined" && window.matchMedia("(min-width: 1000px)").matches) {
    $_viewport.height(windowHeight - viewportPosition);
  } else {
    $_viewport.height(windowHeight - viewportOffset);
  }
  $_viewport.removeAttr('style');
  $_viewport.attr('style', 'overflow:auto');
  jQuery("#scrollbar1 .scrollbar").hide();
}

function viewport() {
  var e = window,
    a = 'inner';
  if (!('innerWidth' in window)) {
    a = 'client';
    e = document.documentElement || document.body;
  }
  return {
    width: e[a + 'Width'],
    height: e[a + 'Height']
  };
};
(function() {
  var ajaxurl = window.ajaxurl || '/wp-admin/admin-ajax.php',
    data = window.wpcomVipAnalytics,
    dataQs, percent;

  if (typeof XMLHttpRequest === 'undefined') {
    return;
  }

  if (!data) {
    return;
  }

  percent = ~~data.percentToTrack;
  if (percent && percent < 100 && (~~((Math.random() * 100) + 1) > percent)) {
    return;
  }

  dataQs = 'action=wpcom_vip_analytics';

  for (var key in data) {
    if (key === 'percentToTrack') {
      continue;
    }
    if (data.hasOwnProperty(key)) {
      dataQs += '&' +
        encodeURIComponent(key).replace(/%20/g, '+') + '=' +
        encodeURIComponent(data[key]).replace(/%20/g, '+');
    }
  }

  function sendInfo() {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', ajaxurl, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    xhr.send(dataQs);
  }

  // Delay for some time after the document is ready to ping
  function docReady() {
    setTimeout(function() {
      sendInfo();
    }, 1500);
  }

  if (document.readyState === 'complete') {
    docReady.apply();
  } else if (document.addEventListener) {
    document.addEventListener('DOMContentLoaded', docReady, false);
  } else if (document.attachEvent) {
    document.attachEvent('onreadystatechange', docReady);
  }
})();;
/***
 * Warning: This file is remotely enqueued in Jetpack's Masterbar module.
 * Changing it will also affect Jetpack sites.
 */
jQuery(document).ready(function($, wpcom) {
  var masterbar,
    menupops = $('li#wp-admin-bar-blog.menupop, li#wp-admin-bar-newdash.menupop, li#wp-admin-bar-my-account.menupop'),
    newmenu = $('#wp-admin-bar-new-post-types');

  // Unbind hoverIntent, we want clickable menus.
  menupops
    .unbind('mouseenter mouseleave')
    .removeProp('hoverIntent_t')
    .removeProp('hoverIntent_s')
    .on('mouseover', function(e) {
      var li = $(e.target).closest('li.menupop');
      menupops.not(li).removeClass('ab-hover');
      li.toggleClass('ab-hover');
    })
    .on('click touchstart', function(e) {
      var $target = $(e.target);

      if (masterbar.focusSubMenus($target)) {
        return;
      }

      e.preventDefault();
      masterbar.toggleMenu($target);
    });

  masterbar = {
    focusSubMenus: function($target) {
      // Handle selection of menu items
      if (!$target.closest('ul').hasClass('ab-top-menu')) {
        $target
          .closest('li');

        return true;
      }

      return false;
    },

    toggleMenu: function($target) {
      var $li = $target.closest('li.menupop'),
        $html = $('html');

      $('body').off('click.ab-menu');
      $('#wpadminbar li.menupop').not($li).removeClass('ab-active wpnt-stayopen wpnt-show');

      if ($li.hasClass('ab-active')) {
        $li.removeClass('ab-active');
        $html.removeClass('ab-menu-open');
      } else {
        $li.addClass('ab-active');
        $html.addClass('ab-menu-open');

        $('body').on('click.ab-menu', function(e) {
          if (!$(e.target).parents('#wpadminbar').length) {
            e.preventDefault();
            masterbar.toggleMenu($li);
            $('body').off('click.ab-menu');
          }
        });
      }
    }
  };
});;
/*globals JSON */
(function($) {
  var eventName = 'wpcom_masterbar_click';

  var linksTracksEvents = {
    //top level items
    'wp-admin-bar-blog': 'my_sites',
    'wp-admin-bar-newdash': 'reader',
    'wp-admin-bar-ab-new-post': 'write_button',
    'wp-admin-bar-my-account': 'my_account',
    'wp-admin-bar-notes': 'notifications',
    //my sites - top items
    'wp-admin-bar-switch-site': 'my_sites_switch_site',
    'wp-admin-bar-blog-info': 'my_sites_site_info',
    'wp-admin-bar-site-view': 'my_sites_view_site',
    'wp-admin-bar-blog-stats': 'my_sites_site_stats',
    'wp-admin-bar-plan': 'my_sites_plan',
    'wp-admin-bar-plan-badge': 'my_sites_plan_badge',
    //my sites - manage
    'wp-admin-bar-edit-page': 'my_sites_manage_site_pages',
    'wp-admin-bar-new-page-badge': 'my_sites_manage_add_page',
    'wp-admin-bar-edit-post': 'my_sites_manage_blog_posts',
    'wp-admin-bar-new-post-badge': 'my_sites_manage_add_post',
    'wp-admin-bar-edit-attachment': 'my_sites_manage_media',
    'wp-admin-bar-new-attachment-badge': 'my_sites_manage_add_media',
    'wp-admin-bar-comments': 'my_sites_manage_comments',
    'wp-admin-bar-edit-jetpack-testimonial': 'my_sites_manage_testimonials',
    'wp-admin-bar-new-jetpack-testimonial': 'my_sites_manage_add_testimonial',
    'wp-admin-bar-edit-jetpack-portfolio': 'my_sites_manage_portfolio',
    'wp-admin-bar-new-jetpack-portfolio': 'my_sites_manage_add_portfolio',
    //my sites - personalize
    'wp-admin-bar-themes': 'my_sites_personalize_themes',
    'wp-admin-bar-cmz': 'my_sites_personalize_themes_customize',
    //my sites - configure
    'wp-admin-bar-sharing': 'my_sites_configure_sharing',
    'wp-admin-bar-people': 'my_sites_configure_people',
    'wp-admin-bar-people-add': 'my_sites_configure_people_add_button',
    'wp-admin-bar-plugins': 'my_sites_configure_plugins',
    'wp-admin-bar-domains': 'my_sites_configure_domains',
    'wp-admin-bar-domains-add': 'my_sites_configure_add_domain',
    'wp-admin-bar-blog-settings': 'my_sites_configure_settings',
    'wp-admin-bar-legacy-dashboard': 'my_sites_configure_wp_admin',
    //reader
    'wp-admin-bar-followed-sites': 'reader_followed_sites',
    'wp-admin-bar-reader-followed-sites-manage': 'reader_manage_followed_sites',
    'wp-admin-bar-discover-discover': 'reader_discover',
    'wp-admin-bar-discover-search': 'reader_search',
    'wp-admin-bar-my-activity-my-likes': 'reader_my_likes',
    //account
    'wp-admin-bar-user-info': 'my_account_user_name',
    // account - profile
    'wp-admin-bar-my-profile': 'my_account_profile_my_profile',
    'wp-admin-bar-account-settings': 'my_account_profile_account_settings',
    'wp-admin-bar-billing': 'my_account_profile_manage_purchases',
    'wp-admin-bar-security': 'my_account_profile_security',
    'wp-admin-bar-notifications': 'my_account_profile_notifications',
    //account - special
    'wp-admin-bar-get-apps': 'my_account_special_get_apps',
    'wp-admin-bar-next-steps': 'my_account_special_next_steps',
    'wp-admin-bar-help': 'my_account_special_help',
  };

  var notesTracksEvents = {
    openSite: function(data) {
      return {
        clicked: 'masterbar_notifications_panel_site',
        site_id: data.siteId
      };
    },
    openPost: function(data) {
      return {
        clicked: 'masterbar_notifications_panel_post',
        site_id: data.siteId,
        post_id: data.postId
      };
    },
    openComment: function(data) {
      return {
        clicked: 'masterbar_notifications_panel_comment',
        site_id: data.siteId,
        post_id: data.postId,
        comment_id: data.commentId
      };
    }
  };

  function recordTracksEvent(eventProps) {
    eventProps = eventProps || {};
    window._tkq = window._tkq || [];
    window._tkq.push(['recordEvent', eventName, eventProps]);
  }

  function parseJson(s, defaultValue) {
    try {
      return JSON.parse(s);
    } catch (e) {
      return defaultValue;
    }
  }

  $(document).ready(function() {
    var trackableLinks = '.mb-trackable .ab-item:not(div),' +
      '#wp-admin-bar-notes .ab-item,' +
      '#wp-admin-bar-user-info .ab-item,' +
      '.mb-trackable .ab-secondary';

    $(trackableLinks).on('click touchstart', function(e) {
      var $target = $(e.target),
        $parent = $target.closest('li');

      if (!$parent) {
        return;
      }

      var trackingId = $target.attr('ID') || $parent.attr('ID');

      if (!linksTracksEvents.hasOwnProperty(trackingId)) {
        return;
      }

      var eventProps = {
        'clicked': linksTracksEvents[trackingId]
      };

      recordTracksEvent(eventProps);
    });
  });

})(jQuery);;
//fgnass.github.com/spin.js#v1.3

/**
 * Copyright (c) 2011-2013 Felix Gnass
 * Licensed under the MIT license
 */
(function(root, factory) {

    /* CommonJS */
    if (typeof exports == 'object') module.exports = factory()

    /* AMD module */
    else if (typeof define == 'function' && define.amd) define(factory)

    /* Browser global */
    else root.Spinner = factory()
  }
  (this, function() {
    "use strict";

    var prefixes = ['webkit', 'Moz', 'ms', 'O'] /* Vendor prefixes */ ,
      animations = {} /* Animation rules keyed by their name */ ,
      useCssAnimations /* Whether to use CSS animations or setTimeout */

    /**
     * Utility function to create elements. If no tag name is given,
     * a DIV is created. Optionally properties can be passed.
     */
    function createEl(tag, prop) {
      var el = document.createElement(tag || 'div'),
        n

      for (n in prop) el[n] = prop[n]
      return el
    }

    /**
     * Appends children and returns the parent.
     */
    function ins(parent /* child1, child2, ...*/ ) {
      for (var i = 1, n = arguments.length; i < n; i++)
        parent.appendChild(arguments[i])

      return parent
    }

    /**
     * Insert a new stylesheet to hold the @keyframe or VML rules.
     */
    var sheet = (function() {
      var el = createEl('style', {
        type: 'text/css'
      })
      ins(document.getElementsByTagName('head')[0], el)
      return el.sheet || el.styleSheet
    }())

    /**
     * Creates an opacity keyframe animation rule and returns its name.
     * Since most mobile Webkits have timing issues with animation-delay,
     * we create separate rules for each line/segment.
     */
    function addAnimation(alpha, trail, i, lines) {
      var name = ['opacity', trail, ~~(alpha * 100), i, lines].join('-'),
        start = 0.01 + i / lines * 100,
        z = Math.max(1 - (1 - alpha) / trail * (100 - start), alpha),
        prefix = useCssAnimations.substring(0, useCssAnimations.indexOf('Animation')).toLowerCase(),
        pre = prefix && '-' + prefix + '-' || ''

      if (!animations[name]) {
        sheet.insertRule(
          '@' + pre + 'keyframes ' + name + '{' +
          '0%{opacity:' + z + '}' +
          start + '%{opacity:' + alpha + '}' +
          (start + 0.01) + '%{opacity:1}' +
          (start + trail) % 100 + '%{opacity:' + alpha + '}' +
          '100%{opacity:' + z + '}' +
          '}', sheet.cssRules.length)

        animations[name] = 1
      }

      return name
    }

    /**
     * Tries various vendor prefixes and returns the first supported property.
     */
    function vendor(el, prop) {
      var s = el.style,
        pp, i

      if (s[prop] !== undefined) return prop
      prop = prop.charAt(0).toUpperCase() + prop.slice(1)
      for (i = 0; i < prefixes.length; i++) {
        pp = prefixes[i] + prop
        if (s[pp] !== undefined) return pp
      }
    }

    /**
     * Sets multiple style properties at once.
     */
    function css(el, prop) {
      for (var n in prop)
        el.style[vendor(el, n) || n] = prop[n]

      return el
    }

    /**
     * Fills in default values.
     */
    function merge(obj) {
      for (var i = 1; i < arguments.length; i++) {
        var def = arguments[i]
        for (var n in def)
          if (obj[n] === undefined) obj[n] = def[n]
      }
      return obj
    }

    /**
     * Returns the absolute page-offset of the given element.
     */
    function pos(el) {
      var o = {
        x: el.offsetLeft,
        y: el.offsetTop
      }
      while ((el = el.offsetParent))
        o.x += el.offsetLeft, o.y += el.offsetTop

      return o
    }

    // Built-in defaults

    var defaults = {
      lines: 12, // The number of lines to draw
      length: 7, // The length of each line
      width: 5, // The line thickness
      radius: 10, // The radius of the inner circle
      rotate: 0, // Rotation offset
      corners: 1, // Roundness (0..1)
      color: '#000', // #rgb or #rrggbb
      direction: 1, // 1: clockwise, -1: counterclockwise
      speed: 1, // Rounds per second
      trail: 100, // Afterglow percentage
      opacity: 1 / 4, // Opacity of the lines
      fps: 20, // Frames per second when using setTimeout()
      zIndex: 2e9, // Use a high z-index by default
      className: 'spinner', // CSS class to assign to the element
      top: 'auto', // center vertically
      left: 'auto', // center horizontally
      position: 'relative' // element position
    }

    /** The constructor */
    function Spinner(o) {
      if (typeof this == 'undefined') return new Spinner(o)
      this.opts = merge(o || {}, Spinner.defaults, defaults)
    }

    // Global defaults that override the built-ins:
    Spinner.defaults = {}

    merge(Spinner.prototype, {

      /**
       * Adds the spinner to the given target element. If this instance is already
       * spinning, it is automatically removed from its previous target b calling
       * stop() internally.
       */
      spin: function(target) {
        this.stop()

        var self = this,
          o = self.opts,
          el = self.el = css(createEl(0, {
            className: o.className
          }), {
            position: o.position,
            width: 0,
            zIndex: o.zIndex
          }),
          mid = o.radius + o.length + o.width,
          ep // element position
          , tp // target position

        if (target) {
          target.insertBefore(el, target.firstChild || null)
          tp = pos(target)
          ep = pos(el)
          css(el, {
            left: (o.left == 'auto' ? tp.x - ep.x + (target.offsetWidth >> 1) : parseInt(o.left, 10) + mid) + 'px',
            top: (o.top == 'auto' ? tp.y - ep.y + (target.offsetHeight >> 1) : parseInt(o.top, 10) + mid) + 'px'
          })
        }

        el.setAttribute('role', 'progressbar')
        self.lines(el, self.opts)

        if (!useCssAnimations) {
          // No CSS animation support, use setTimeout() instead
          var i = 0,
            start = (o.lines - 1) * (1 - o.direction) / 2,
            alpha, fps = o.fps,
            f = fps / o.speed,
            ostep = (1 - o.opacity) / (f * o.trail / 100),
            astep = f / o.lines

          ;
          (function anim() {
            i++;
            for (var j = 0; j < o.lines; j++) {
              alpha = Math.max(1 - (i + (o.lines - j) * astep) % f * ostep, o.opacity)

              self.opacity(el, j * o.direction + start, alpha, o)
            }
            self.timeout = self.el && setTimeout(anim, ~~(1000 / fps))
          })()
        }
        return self
      },

      /**
       * Stops and removes the Spinner.
       */
      stop: function() {
        var el = this.el
        if (el) {
          clearTimeout(this.timeout)
          if (el.parentNode) el.parentNode.removeChild(el)
          this.el = undefined
        }
        return this
      },

      /**
       * Internal method that draws the individual lines. Will be overwritten
       * in VML fallback mode below.
       */
      lines: function(el, o) {
        var i = 0,
          start = (o.lines - 1) * (1 - o.direction) / 2,
          seg

        function fill(color, shadow) {
          return css(createEl(), {
            position: 'absolute',
            width: (o.length + o.width) + 'px',
            height: o.width + 'px',
            background: color,
            boxShadow: shadow,
            transformOrigin: 'left',
            transform: 'rotate(' + ~~(360 / o.lines * i + o.rotate) + 'deg) translate(' + o.radius + 'px' + ',0)',
            borderRadius: (o.corners * o.width >> 1) + 'px'
          })
        }

        for (; i < o.lines; i++) {
          seg = css(createEl(), {
            position: 'absolute',
            top: 1 + ~(o.width / 2) + 'px',
            transform: o.hwaccel ? 'translate3d(0,0,0)' : '',
            opacity: o.opacity,
            animation: useCssAnimations && addAnimation(o.opacity, o.trail, start + i * o.direction, o.lines) + ' ' + 1 / o.speed + 's linear infinite'
          })

          if (o.shadow) ins(seg, css(fill('#000', '0 0 4px ' + '#000'), {
            top: 2 + 'px'
          }))

          ins(el, ins(seg, fill(o.color, '0 0 1px rgba(0,0,0,.1)')))
        }
        return el
      },

      /**
       * Internal method that adjusts the opacity of a single line.
       * Will be overwritten in VML fallback mode below.
       */
      opacity: function(el, i, val) {
        if (i < el.childNodes.length) el.childNodes[i].style.opacity = val
      }

    })


    function initVML() {

      /* Utility function to create a VML tag */
      function vml(tag, attr) {
        return createEl('<' + tag + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', attr)
      }

      // No CSS transforms but VML support, add a CSS rule for VML elements:
      sheet.addRule('.spin-vml', 'behavior:url(#default#VML)')

      Spinner.prototype.lines = function(el, o) {
        var r = o.length + o.width,
          s = 2 * r

        function grp() {
          return css(
            vml('group', {
              coordsize: s + ' ' + s,
              coordorigin: -r + ' ' + -r
            }), {
              width: s,
              height: s
            }
          )
        }

        var margin = -(o.width + o.length) * 2 + 'px',
          g = css(grp(), {
            position: 'absolute',
            top: margin,
            left: margin
          }),
          i

        function seg(i, dx, filter) {
          ins(g,
            ins(css(grp(), {
                rotation: 360 / o.lines * i + 'deg',
                left: ~~dx
              }),
              ins(css(vml('roundrect', {
                  arcsize: o.corners
                }), {
                  width: r,
                  height: o.width,
                  left: o.radius,
                  top: -o.width >> 1,
                  filter: filter
                }),
                vml('fill', {
                  color: o.color,
                  opacity: o.opacity
                }),
                vml('stroke', {
                  opacity: 0
                }) // transparent stroke to fix color bleeding upon opacity change
              )
            )
          )
        }

        if (o.shadow)
          for (i = 1; i <= o.lines; i++)
            seg(i, -2, 'progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)')

        for (i = 1; i <= o.lines; i++) seg(i)
        return ins(el, g)
      }

      Spinner.prototype.opacity = function(el, i, val, o) {
        var c = el.firstChild
        o = o.shadow && o.lines || 0
        if (c && i + o < c.childNodes.length) {
          c = c.childNodes[i + o];
          c = c && c.firstChild;
          c = c && c.firstChild
          if (c) c.opacity = val
        }
      }
    }

    var probe = css(createEl('group'), {
      behavior: 'url(#default#VML)'
    })

    if (!vendor(probe, 'transform') && probe.adj) initVML()
    else useCssAnimations = vendor(probe, 'animation')

    return Spinner

  }));;
/**
 * Copyright (c) 2011-2013 Felix Gnass
 * Licensed under the MIT license
 */

/*

Basic Usage:
============

$('#el').spin(); // Creates a default Spinner using the text color of #el.
$('#el').spin({ ... }); // Creates a Spinner using the provided options.

$('#el').spin(false); // Stops and removes the spinner.

Using Presets:
==============

$('#el').spin('small'); // Creates a 'small' Spinner using the text color of #el.
$('#el').spin('large', '#fff'); // Creates a 'large' white Spinner.

Adding a custom preset:
=======================

$.fn.spin.presets.flower = {
  lines: 9
  length: 10
  width: 20
  radius: 0
}

$('#el').spin('flower', 'red');

*/

(function(factory) {

  if (typeof exports == 'object') {
    // CommonJS
    factory(require('jquery'), require('spin'))
  } else if (typeof define == 'function' && define.amd) {
    // AMD, register as anonymous module
    define(['jquery', 'spin'], factory)
  } else {
    // Browser globals
    if (!window.Spinner) throw new Error('Spin.js not present')
    factory(window.jQuery, window.Spinner)
  }

}(function($, Spinner) {

  $.fn.spin = function(opts, color) {

    return this.each(function() {
      var $this = $(this),
        data = $this.data();

      if (data.spinner) {
        data.spinner.stop();
        delete data.spinner;
      }
      if (opts !== false) {
        opts = $.extend({
              color: color || $this.css('color')
            },
            $.fn.spin.presets[opts] || opts
          )
          // Begin WordPress Additions
          // To use opts.right, you need to have specified a length, width, and radius.
        if (typeof opts.right !== 'undefined' && typeof opts.length !== 'undefined' && typeof opts.width !== 'undefined' && typeof opts.radius !== 'undefined') {
          var pad = $this.css('padding-left');
          pad = (typeof pad === 'undefined') ? 0 : parseInt(pad, 10);
          opts.left = $this.outerWidth() - (2 * (opts.length + opts.width + opts.radius)) - pad - opts.right;
          delete opts.right;
        }
        // End WordPress Additions
        data.spinner = new Spinner(opts).spin(this)
      }
    })
  }

  $.fn.spin.presets = {
    tiny: {
      lines: 8,
      length: 2,
      width: 2,
      radius: 3
    },
    small: {
      lines: 8,
      length: 4,
      width: 3,
      radius: 5
    },
    large: {
      lines: 10,
      length: 8,
      width: 4,
      radius: 8
    }
  }

}));

// Jetpack Presets Overrides:
(function($) {
  $.fn.spin.presets.wp = {
    trail: 60,
    speed: 1.3
  };
  $.fn.spin.presets.small = $.extend({
    lines: 8,
    length: 2,
    width: 2,
    radius: 3
  }, $.fn.spin.presets.wp);
  $.fn.spin.presets.medium = $.extend({
    lines: 8,
    length: 4,
    width: 3,
    radius: 5
  }, $.fn.spin.presets.wp);
  $.fn.spin.presets.large = $.extend({
    lines: 10,
    length: 6,
    width: 4,
    radius: 7
  }, $.fn.spin.presets.wp);
  $.fn.spin.presets['small-left'] = $.extend({
    left: 5
  }, $.fn.spin.presets.small);
  $.fn.spin.presets['small-right'] = $.extend({
    right: 5
  }, $.fn.spin.presets.small);
  $.fn.spin.presets['medium-left'] = $.extend({
    left: 5
  }, $.fn.spin.presets.medium);
  $.fn.spin.presets['medium-right'] = $.extend({
    right: 5
  }, $.fn.spin.presets.medium);
  $.fn.spin.presets['large-left'] = $.extend({
    left: 5
  }, $.fn.spin.presets.large);
  $.fn.spin.presets['large-right'] = $.extend({
    right: 5
  }, $.fn.spin.presets.large);
})(jQuery);;
/* jshint sub: true, onevar: false, multistr: true, devel: true, smarttabs: true */

/**
 * jQuery Plugin to obtain touch gestures from iPhone, iPod Touch and iPad, should also work with Android mobile phones (not tested yet!)
 * Common usage: wipe images (left and right to show the previous or next image)
 *
 * @author Andreas Waltl, netCU Internetagentur (http://www.netcu.de)
 * Version 1.1.1, modified to pass the touchmove event to the callbacks.
 */
(function($) {
  $.fn.touchwipe = function(settings) {
    var config = {
      min_move_x: 20,
      min_move_y: 20,
      wipeLeft: function( /*e*/ ) {},
      wipeRight: function( /*e*/ ) {},
      wipeUp: function( /*e*/ ) {},
      wipeDown: function( /*e*/ ) {},
      preventDefaultEvents: true
    };

    if (settings) {
      $.extend(config, settings);
    }

    this.each(function() {
      var startX;
      var startY;
      var isMoving = false;

      function cancelTouch() {
        this.removeEventListener('touchmove', onTouchMove);
        startX = null;
        isMoving = false;
      }

      function onTouchMove(e) {
        if (config.preventDefaultEvents) {
          e.preventDefault();
        }
        if (isMoving) {
          var x = e.touches[0].pageX;
          var y = e.touches[0].pageY;
          var dx = startX - x;
          var dy = startY - y;
          if (Math.abs(dx) >= config.min_move_x) {
            cancelTouch();
            if (dx > 0) {
              config.wipeLeft(e);
            } else {
              config.wipeRight(e);
            }
          } else if (Math.abs(dy) >= config.min_move_y) {
            cancelTouch();
            if (dy > 0) {
              config.wipeDown(e);
            } else {
              config.wipeUp(e);
            }
          }
        }
      }

      function onTouchStart(e) {
        if (e.touches.length === 1) {
          startX = e.touches[0].pageX;
          startY = e.touches[0].pageY;
          isMoving = true;
          this.addEventListener('touchmove', onTouchMove, false);
        }
      }
      if ('ontouchstart' in document.documentElement) {
        this.addEventListener('touchstart', onTouchStart, false);
      }
    });

    return this;
  };
})(jQuery);;
