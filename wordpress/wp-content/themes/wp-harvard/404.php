<?php get_header(); ?>

  <?php get_sidebar('big'); ?>

  <div class="primary" id="skip">
    <div class="content full-width page">
      <h2><?php _e( 'Page not found', 'wpeasy' ); ?></h2>
      <div class="article-body">
        <h2><a href="<?php echo home_url(); ?>"><?php _e( 'Return home?', 'wpeasy' ); ?></a></h2>
      </div>
      <!-- /article-body -->
    </div>
    <!--/.content-->
  </div>

<?php get_footer(); ?>
