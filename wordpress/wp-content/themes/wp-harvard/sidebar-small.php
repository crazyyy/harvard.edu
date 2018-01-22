<div class="sub">
  <div class="sidebar-block">
    <h3 class="header popular">Popular</h3>
    <div class="story-list">

      <?php  $popularpost = new WP_Query( array( 'posts_per_page' => 6, 'meta_key' => 'wpb_post_views_count', 'orderby' => 'meta_value_num', 'order' => 'DESC'  ) ); while ( $popularpost->have_posts() ) : $popularpost->the_post(); ?>

        <div class="story-block clearfix ">
          <div class="story-photo">
            <a rel="nofollow" class="feature-img" href="<?php the_permalink(); ?>" title="<?php the_title(); ?>" data-category="story_popular" data-action="img">
              <?php if ( has_post_thumbnail()) { ?>
                <img src="<?php echo the_post_thumbnail_url('medium'); ?>" title="<?php the_title(); ?>" alt="<?php the_title(); ?>" />
              <?php } else { ?>
                <img src="<?php echo catchFirstImage(); ?>" title="<?php the_title(); ?>" alt="<?php the_title(); ?>" />
              <?php } ?>
            </a><!-- /post thumbnail -->
          </div>
          <!--/.story-photo-->
          <div class="cat-icon science">View all posts in <?php the_category(', '); ?></div>
          <div class="story-info">
            <h3><a href="<?php the_permalink(); ?>" data-category="story_popular" data-action="title"> <?php the_title(); ?></a></h3>
            <div class="date">
              <span class="byline"><?php $caption = get_post(get_post_thumbnail_id())->post_excerpt; echo $caption; ?> <span class="divider">|</span> </span><?php the_time('F d'); ?>, <?php the_time('Y'); ?> |
              <span class="label"><?php the_tags( '', ', ', ''); ?></span>
            </div>
            <?php wpeExcerpt('wpeExcerpt20'); ?>
          </div>
          <!--/.story-info-->
        </div>
        <!--/.story-block-->

       <?php endwhile; ?>

    </div>
    <!--/.story-list-->
  </div>
  <!--/.sidebar-block-->
  <div class="sidebar-block">
    <h3 class="header events">Upcoming Events</h3>
    <div class="story-list no-thumb">

        <!-- loop start -->
        <div class="story-block">
          <div class="story-info">
            <h3><a href="https://web.archive.org/web/20180106030031/https://americanrepertorytheater.org/events/show/bedlams-sense-sensibility" data-category="story_events" data-action="title">Sense &amp; Sensibility</a></h3>
            <div class="date">January 6, 2018</div>
          </div>
          <!--/.story-info-->
        </div>
        <!--/.story-block-->
        <!-- loop end -->

      <div class="story-more"><a href="#" data-category="sidebar_events" data-action="btn_more">More »</a>
        <a name="filters"></a>
      </div>
      <!--/.story-more-->
    </div>
    <!--/.story-list-->
  </div>
  <!--/.sidebar-block-->
</div>
<!--/.sub-->
