      <!--/.primary-->
    </div>
    <!--/.wrap-->
  </div>
  <!--/#outer-wrap-->
</body>
</html>

  <?php wp_footer(); ?>

  <script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/js/saved_resource(4).js"></script>
  <script type="text/javascript">
  // <![CDATA[
  (function() {
    try {
      if (window.external && 'msIsSiteMode' in window.external) {
        if (window.external.msIsSiteMode()) {
          var jl = document.createElement('script');
          jl.type = 'text/javascript';
          jl.async = true;
          jl.src = '/wp-content/plugins/ie-sitemode/custom-jumplist.php';
          var s = document.getElementsByTagName('script')[0];
          s.parentNode.insertBefore(jl, s);
        }
      }
    } catch (e) {}
  })();
  // ]]>
  </script>
  <script src="<?php echo get_template_directory_uri(); ?>/js/w.js" type="text/javascript" async="" defer=""></script>

  <script>
  if ('object' === typeof wpcom_mobile_user_agent_info) {

    wpcom_mobile_user_agent_info.init();
    var mobileStatsQueryString = "";

    if (false !== wpcom_mobile_user_agent_info.matchedPlatformName)
      mobileStatsQueryString += "&x_" + 'mobile_platforms' + '=' + wpcom_mobile_user_agent_info.matchedPlatformName;

    if (false !== wpcom_mobile_user_agent_info.matchedUserAgentName)
      mobileStatsQueryString += "&x_" + 'mobile_devices' + '=' + wpcom_mobile_user_agent_info.matchedUserAgentName;

    if (wpcom_mobile_user_agent_info.isIPad())
      mobileStatsQueryString += "&x_" + 'ipad_views' + '=' + 'views';

    if ("" != mobileStatsQueryString) {
      new Image().src = document.location.protocol + '//web.archive.org/web/20180108123823/https://pixel.wp.com/g.gif?v=wpcom-no-pv' + mobileStatsQueryString + '&baba=' + Math.random();
    }

  }
  </script>

  <script>
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
  </script>
  <script>
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
  </script>
  <script>
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
  </script>

</body>
</html>
