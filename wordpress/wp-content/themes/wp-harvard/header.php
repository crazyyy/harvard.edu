<!doctype html>
<html <?php language_attributes(); ?> class="no-js">
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1,minimum-scale=1">

  <title><?php wp_title( '' ); ?><?php if ( wp_title( '', false ) ) { echo ' :'; } ?> <?php bloginfo( 'name' ); ?></title>

  <script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/js/wbhack.js" charset="utf-8"></script>
  <script type="text/javascript">
  __wbhack.init('https://web.archive.org/web');
  </script>
  <!-- End Wayback Rewrite JS Include -->

  <script type="text/javascript">
  /* <![CDATA[ */
  if ('function' === typeof WPRemoteLogin) {
    document.cookie = "wordpress_test_cookie=test; path=/";
    if (document.cookie.match(/(;|^)\s*wordpress_test_cookie\=/)) {
      WPRemoteLogin();
    }
  }
  /* ]]> */
  </script>
  <script type="text/javascript">
  /* <![CDATA[ */
  function addLoadEvent(func) {
    var oldonload = window.onload;
    if (typeof window.onload != 'function') {
      window.onload = func;
    } else {
      window.onload = function() {
        oldonload();
        func();
      }
    }
  }
  /* ]]> */
  </script>
  <script type="text/javascript" src="<?php echo get_template_directory_uri(); ?>/js/saved_resource(3).js"></script>

  <link rel="stylesheet" type="text/css" href="<?php echo get_template_directory_uri(); ?>/css/banner-styles.css">
  <link rel="stylesheet" type="text/css" href="<?php echo get_template_directory_uri(); ?>/css/iconochive.css">
  <link rel="stylesheet" href="<?php echo get_template_directory_uri(); ?>/css/css.css" type="text/css" media="all">


  <link rel="stylesheet" id="all-css-0-1" href="<?php echo get_template_directory_uri(); ?>/css/saved_resource.css" type="text/css" media="all">
  <link rel="stylesheet" id="screen-css-1-1" href="<?php echo get_template_directory_uri(); ?>/css/style.css" type="text/css" media="screen">
  <link rel="stylesheet" id="screenprojection-css-2-1" href="<?php echo get_template_directory_uri(); ?>/css/saved_resource(1).css" type="text/css" media="screen, projection">
  <link rel="stylesheet" id="print-css-3-1" href="<?php echo get_template_directory_uri(); ?>/css/print.css" type="text/css" media="print">
  <link rel="stylesheet" id="screenprojection-css-10-1" href="<?php echo get_template_directory_uri(); ?>/css/enhanced.css" type="text/css" media="screen, projection">
  <link rel="stylesheet" id="all-css-11-1" href="<?php echo get_template_directory_uri(); ?>/css/saved_resource(2).css" type="text/css" media="all">


  <!-- icons -->
  <link href="<?php echo get_template_directory_uri(); ?>/favicon.ico" rel="shortcut icon">

  <!-- Add to homescreen for Safari on iOS -->
  <meta name="apple-mobile-web-app-capable" content="yes">
  <meta name="apple-mobile-web-app-status-bar-style" content="black">
  <meta name="apple-mobile-web-app-title" content="Harvard Gazette">
  <meta name="msapplication-TileImage" content="<?php echo get_template_directory_uri(); ?>//appletouch.gif">
  <meta name="msapplication-TileColor" content="#99283c">
  <meta name="application-name" content="Harvard Gazette">
  <meta name="msapplication-window" content="width=device-width;height=device-height">

  <!--[if lt IE 9]>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/html5shiv/3.7.3/html5shiv.min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/selectivizr/1.0.2/selectivizr-min.js"></script>
    <script type="text/javascript" src="https://cdnjs.cloudflare.com/ajax/libs/respond.js/1.4.2/respond.min.js"></script>
  <![endif]-->
  <!-- css + javascript -->
  <?php wp_head(); ?>
</head>

<body class="home blog mp6 customizer-styles-applied highlander-enabled highlander-light" <?php /* body_class(); */ ?> >

  <div id="outer-wrap">
    <p class="move"><a class="skip" href="#skip">Skip to main content</a></p>
    <div class="sticky">
      <div id="topbar">
        <a class="nav-btn" id="nav-open-btn">Menu</a>
        <a class="nav-btn" id="nav-close-btn">Menu</a>
        <a class="nav-btn" id="nav-gz-home" href="/" data-category="gazette_home" data-action="top_bar">Home</a>
        <div class="searchform-wrapper">
          <form role="search" method="get" id="searchform" action="<?php echo home_url(); ?>">
            <label class="hide" for="s">Search for:</label>
            <input type="text" value="" name="s" id="s" placeholder="Search">
            <input type="submit" id="searchsubmit" value="Search" class="postfix button">
          </form>
        </div>
        <div class="menu-wrapper">
          <div class="menu-utility-menu-container">
            <?php /* wpeHeadNav(); */ ?>
            <ul id="menu-utility-menu" class="utility-menu">
              <li id="menu-item-200106" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-200106"><a href="https://web.archive.org/web/20180108123823/http://www.harvard.edu/" onclick="dataLayer.push({'eventCategory': 'nav_utility_right', 'eventAction': 'nav_link', 'eventLabel': 'https://web.archive.org/web/20180108123823/http://www.harvard.edu/','event': 'gaEvent'});">harvard.edu</a></li>
              <li id="menu-item-200115" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-200115"><a href="https://web.archive.org/web/20180108123823/http://www.harvard.edu/media-relations/photos-and-multimedia/photos" onclick="dataLayer.push({'eventCategory': 'nav_utility_right', 'eventAction': 'nav_link', 'eventLabel': 'https://web.archive.org/web/20180108123823/http://www.harvard.edu/media-relations/photos-and-multimedia/photos','event': 'gaEvent'});">Photographic Services</a></li>
              <li id="menu-item-200116" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-200116"><a href="https://web.archive.org/web/20180108123823/http://www.harvard.edu/media-relations/media-resources" onclick="dataLayer.push({'eventCategory': 'nav_utility_right', 'eventAction': 'nav_link', 'eventLabel': 'https://web.archive.org/web/20180108123823/http://www.harvard.edu/media-relations/media-resources','event': 'gaEvent'});">Resources for Journalists</a></li>
              <li id="menu-item-200117" class="menu-item menu-item-type-custom menu-item-object-custom menu-item-200117"><a href="https://web.archive.org/web/20180108123823/http://hpac.harvard.edu/" onclick="dataLayer.push({'eventCategory': 'nav_utility_right', 'eventAction': 'nav_link', 'eventLabel': 'https://web.archive.org/web/20180108123823/http://hpac.harvard.edu/','event': 'gaEvent'});">HPAC</a></li>
            </ul>
          </div>
        </div>
      </div>
      <!--/#topbar-->
    </div>
    <!--/.sticky-->
    <div id="sticky-filter" style="display: none;">
      <ul class="filter-options">
        <li><a href="https://web.archive.org/web/20180108123823/https://news.harvard.edu/gazette/sort_by/latest/" class="filter latest">Latest</a></li>
        <li><a href="https://web.archive.org/web/20180108123823/https://news.harvard.edu/gazette/sort_by/gz_editor_pick/" class="filter editorpick">Editor's Pick</a></li>
        <li><a href="https://web.archive.org/web/20180108123823/https://news.harvard.edu/gazette/sort_by/gz_video/" class="filter video">Audio/Video</a></li>
        <li><a href="https://web.archive.org/web/20180108123823/https://news.harvard.edu/gazette/sort_by/gz_photo/" class="filter photo">Photography</a></li>
        <li><a href="https://web.archive.org/web/20180108123823/https://news.harvard.edu/gazette/sort_by/popular/" class="filter popular">Popular</a></li>
      </ul>
    </div>

    <div class="wrap" id="inner-wrap">
      <div id="logo">
        <h1><a href="/" data-category="gazette_home" data-action="logo">Harvard Gazette</a></h1>
        <div class="date">Monday, January 8, 2018</div>
      </div>
      <!--/#logo-->
