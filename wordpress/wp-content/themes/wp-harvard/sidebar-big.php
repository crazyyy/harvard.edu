<?php /* if ( is_active_sidebar('widgetarea1') ) : ?>
  <?php dynamic_sidebar( 'widgetarea1' ); ?>
<?php else : ?>

  <!-- If you want display static widget content - write code here
	RU: Здесь код вывода того, что необходимо для статического контента виджетов -->

<?php endif; */ ?>


  <div class="secondary" id="nav">
    <div id="scrollbar1">
      <div class="scrollbar">
        <div class="track">
          <div class="thumb">
            <div class="end"></div>
          </div>
        </div>
      </div>
      <div class="viewport">
        <div class="overview">
          <div class="menu-main-menu-container">
            <?php wpeSideNav(); ?>

          </div>

          <div class="utility-menu-wrapper">
            <div class="menu-utility-menu-container">
              <?php wpeSideNav2(); ?>
            </div>
          </div>

          <div class="harvard-social">
            Find Harvard on:
            <p>
              <a href="#" title="Facebook">Facebook</a> | <a href="#" title="Twitter">Twitter</a> | <a href="#" title="LinkedIn">LinkedIn</a>
              <br><a href="#" title="Instagram">Instagram</a> | <a href="#" title="YouTube">YouTube</a> | <a href="#" title="iTunes U">iTunes
              U</a>
            </p>
          </div>
          <!--/.harvard-social-->

          <div id="footer">
            <div class="menu-footer-menu-container">
              <?php wpeFootNav(); ?>
            </div>
            <div class="copyright">
              &copy; <?php echo date("Y"); ?> <?php bloginfo('name'); ?>
            </div>
          </div>
          <!--/#footer-->

          <div id="harvard-logo">
            <a href="#"><img src="<?php echo get_template_directory_uri(); ?>/img/harvard-logo-2x.png" width="228"></a>
          </div>
        </div>
      </div>
    </div>
  </div>
  <!--/.secondary-->
