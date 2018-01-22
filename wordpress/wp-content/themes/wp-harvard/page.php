<?php get_header(); ?>

  <?php get_sidebar('big'); ?>

  <?php if (have_posts()): while (have_posts()) : the_post(); ?>
    <div class="primary" id="skip">
      <div class="content full-width page">
        <h2><?php the_title(); ?></h2>
        <div class="article-body">
          <?php the_content(); ?>
        </div>
        <!-- /article-body -->
      </div>
      <!--/.content-->
    </div>
  <?php endwhile; endif; ?>

<?php get_footer(); ?>
