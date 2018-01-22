<?php get_header(); ?>
  <?php get_sidebar('big'); ?>
  <div class="primary" id="skip">

    <div id="category-top">
      <h2><?php echo sprintf( __( '%s Search Results for ', 'wpeasy' ), $wp_query->found_posts ); echo get_search_query(); ?></h2>

      <div class="gocrimson-content story-list">
        <?php get_template_part('loop'); ?>
      </div>
      <!-- /.gocrimson-content -->

    </div>
    <!--/#category-top-->

    <?php get_template_part('pagination'); ?>
  </div>
<?php get_footer(); ?>
