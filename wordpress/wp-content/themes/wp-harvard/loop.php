<?php if (have_posts()): while (have_posts()) : the_post(); ?>
  <div id="post-<?php the_ID(); ?>" <?php post_class('story-block clearfix'); ?>>
    <div class="story-photo">
      <a href="<?php the_permalink(); ?>" data-action="img">
        <?php if ( has_post_thumbnail()) { ?>
          <img src="<?php echo the_post_thumbnail_url('medium'); ?>" title="<?php the_title(); ?>" alt="<?php the_title(); ?>" height="60" />
        <?php } else { ?>
          <img src="<?php echo catchFirstImage(); ?>" title="<?php the_title(); ?>" alt="<?php the_title(); ?>" height="60" />
        <?php } ?>
      </a>
    </div>
    <div class="cat-icon gocrimson"></div>
    <div class="story-info">
      <h3><a href="<?php the_permalink(); ?>" data-action="title"><?php the_title(); ?></a></h3>
      <div class="date"><?php the_time('F d'); ?>, <?php the_time('Y'); ?> </div>
      <?php wpeExcerpt('wpeExcerpt40'); ?>
    </div>
  </div>
  <!-- /article-block -->
<?php endwhile; endif; ?>
