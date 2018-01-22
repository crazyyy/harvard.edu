// Avoid `console` errors in browsers that lack a console.
(function() {
  var method
  var noop = function() {}
  var methods = [
    "assert",
    "clear",
    "count",
    "debug",
    "dir",
    "dirxml",
    "error",
    "exception",
    "group",
    "groupCollapsed",
    "groupEnd",
    "info",
    "log",
    "markTimeline",
    "profile",
    "profileEnd",
    "table",
    "time",
    "timeEnd",
    "timeline",
    "timelineEnd",
    "timeStamp",
    "trace",
    "warn"
  ]
  var length = methods.length
  var console = (window.console = window.console || {})

  while (length--) {
    method = methods[length]

    // Only stub undefined methods.
    if (!console[method]) {
      console[method] = noop
    }
  }
})()
if (typeof jQuery === "undefined") {
  console.warn("jQuery hasn't loaded")
} else {
  console.log("jQuery " + jQuery.fn.jquery + " has loaded")
}
// Place any jQuery/helper plugins in here.

/**/
jQuery(document).ready(function() {

  jQuery("ul.tabs li#li1").click(function() {
    jQuery("ul.tabs li#li2").removeClass("active");
    jQuery(this).addClass("active");
    jQuery(".tabContainer #tab2").hide();
    jQuery(".tabContainer #tab1").fadeIn();
    return false;
  });

  jQuery("ul.tabs li#li2").click(function() {
    jQuery("ul.tabs li#li1").removeClass("active");
    jQuery(this).addClass("active");
    jQuery(".tabContainer #tab1").hide();
    jQuery(".tabContainer #tab2").fadeIn();
    return false;
  });

  jQuery(".emergency a.close").click(function() {
    jQuery(".emergency").slideUp();
  });

});
/**/
jQuery(window).scroll(function() {
  if (getInternetExplorerVersion() != 8) {
    var $totalHeight = jQuery('.sticky').outerHeight() + jQuery('#logo').outerHeight() + jQuery('#home-top').outerHeight() + jQuery('#homepage-feature').outerHeight();

    var scroll_top = jQuery(window).scrollTop();

    if (scroll_top <= $totalHeight) {
      jQuery('#sticky-filter').hide();
    }
    if (scroll_top > $totalHeight) {
      jQuery('#sticky-filter').show();
    }
  }
});
/**/
var prev_width = jQuery(window).width();
var prev_height = jQuery(window).height();

var inner_size = viewport();
var prev_inner_width = inner_size['width'];

window.onresize = function(event) {
  var w_width = jQuery(window).width();

  if ((w_width > 1242 && prev_width <= 1242) || (w_width <= 1242 && prev_width > 1242)) {
    if ((w_width > 1242 && prev_width <= 1242)) {
      jQuery('#nav-open-btn').hide();
      jQuery('#nav-close-btn').hide();
      jQuery('#nav-open-btn').removeAttr('style');
      jQuery('#nav-close-btn').removeAttr('style');
    }
    prev_width = w_width;
  }

  var w_height = jQuery(window).height();
  if (w_height != prev_height) {
    if (use_tinyscroller()) {
      jQuery('#scrollbar1').tinyscrollbar({
        invertscroll: true
      });
    } else {
      set_scroller_height();
    }
  }

  //For photo description
  inner_size = viewport();
  var inner_width = inner_size['width'];
  if (inner_width > 475 && prev_inner_width <= 475) {
    jQuery('.article-feature-caption.tablet .toggle-more-less').hide();
    jQuery('.photo-description').removeAttr('style');
    prev_inner_width = inner_width;
  } else if (inner_width <= 475 && prev_inner_width > 475) {
    jQuery('.article-feature-caption.tablet .toggle-more-less').show();
    jQuery('.photo-description').removeAttr('style');
    prev_inner_width = inner_width;
  }
}
