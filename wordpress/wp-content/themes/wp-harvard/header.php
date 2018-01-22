<!doctype html>
<html <?php language_attributes(); ?> class="no-js">
<head>
  <meta charset="<?php bloginfo( 'charset' ); ?>">
  <meta http-equiv="x-ua-compatible" content="ie=edge">
  <meta name="viewport" content="width=device-width, initial-scale=1.0,maximum-scale=1,minimum-scale=1">

  <title><?php wp_title( '' ); ?><?php if ( wp_title( '', false ) ) { echo ' :'; } ?> <?php bloginfo( 'name' ); ?></title>

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
            <?php wpeHeadNav();?>
          </div>
        </div>
      </div>
      <!--/#topbar-->
    </div>
    <!--/.sticky-->
    <div id="sticky-filter" style="display: none;">
      <ul class="filter-options">
        <li><a href="#/sort_by/latest/" class="filter latest">Latest</a></li>
        <li><a href="#/sort_by/gz_editor_pick/" class="filter editorpick">Editor's Pick</a></li>
        <li><a href="#/sort_by/gz_video/" class="filter video">Audio/Video</a></li>
        <li><a href="#/sort_by/gz_photo/" class="filter photo">Photography</a></li>
        <li><a href="#/sort_by/popular/" class="filter popular">Popular</a></li>
      </ul>
    </div>

    <div class="wrap" id="inner-wrap">
      <div id="logo">
        <h1><a href="/" data-category="gazette_home" data-action="logo"><?php wp_title( '' ); ?></a></h1>
        <div class="date"><?php echo date('l'); ?>, <?php echo date('F'); ?> <?php echo date('d'); ?>, <?php echo date('Y'); ?></div>
      </div>
      <!--/#logo-->
