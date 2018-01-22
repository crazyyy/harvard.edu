<?php get_header(); ?>

  <?php get_sidebar('big'); ?>

    <?php if (have_posts()): while (have_posts()) : the_post(); ?>
    <div class="primary" id="skip">
      <div id="sticky-filter" class="story-share">
        <div class="title"><?php the_title(); ?></div>
        <div class="share-icons">
          <span class="email_span"><a class="email" target="_blank" href="#" title="Email" data-category="email" data-sociallink="">Email</a></span>
          <span class="twitter_span"><a class="twitter" target="_blank" href="#" title="Twitter" data-category="twitter" data-sociallink="">Twitter</a></span>
          <span class="facebook_span"><a class="facebook" target="_blank" href="#" title="Facebook" data-category="facebook" data-sociallink="">Facebook</a></span>
        </div>
      </div>
      <div class="content full-width-top feature-photo-top">
        <div class="top-wrapper feature-top">

          <div class="article-head">
            <div class="breadcrumb">
              <?php if (function_exists('easy_breadcrumbs')) easy_breadcrumbs(); ?>
            </div>
            <h1 class="headline" itemprop="AlternativeHeadline AlternateName"><?php the_title(); ?></h1>
            <p class="sub-headline large"><?php $caption = get_post(get_post_thumbnail_id())->post_excerpt; echo $caption; ?></p>
            <div class="meta"> <?php the_time('F d'); ?>, <?php the_time('Y'); ?> |
              <span class="label"><?php the_tags( '', ', ', ''); ?></span> </div>
            <!--/.meta-->
          </div>
          <!--/.article-head -->

          <div class="article-feature"><img src="<?php echo the_post_thumbnail_url('medium'); ?>" class="feature-photo" title="<?php the_title(); ?>" alt="<?php the_title(); ?>" /></div>
          <!--/.article-feature -->

          <div class="article-feature-caption tablet">
            <p class="photo-credit"><?php $caption = get_post(get_post_thumbnail_id())->post_excerpt; echo $caption; ?></p>
            <p class="photo-description"><?php $post_content = get_post(get_post_thumbnail_id())->post_content; echo $post_content; ?></p>
            <div class="toggle-more-less" style="display: none;"><a href="#" class="show-more">Show more</a></div>
          </div>
          <!--/.article-feature-caption-->

        </div>
        <!--/.top-wrapper-->
        <div class="main">
          <div class="split-2-1 clearfix">
            <div class="col first">
              <div class="article-byline"> <?php $caption = get_post(get_post_thumbnail_id())->post_excerpt; echo $caption; ?> </div>
            </div>
            <!--/.col-->
            <div class="col last">
              <div class="option-icons article-social-share">
                <span class="email_span"><a class="email" target="_blank" href="#" title="Email" data-category="email" data-sociallink="">Email</a></span>
                <span class="twitter_span"><a class="twitter" target="_blank" href="#" title="Twitter" data-category="twitter" data-sociallink="">Twitter</a></span>
                <span class="facebook_span"><a class="facebook" target="_blank" href="#" title="Facebook" data-category="facebook" data-sociallink="">Facebook</a></span>
              </div>
            </div>
          </div>
          <!--/.split-2-1-->
          <div class="article-body">
            <?php the_content(); ?>
            <?php wpb_set_post_views(get_the_ID()); ?>
            <div id="comments" class="comments-area">
            </div>
            <!-- #comments .comments-area -->
          </div>
          <!-- /article-body -->
        </div>
        <!--/.main-->
        <div class="article-feature-caption hide-on-tablet">
          <p class="photo-credit"> <?php $caption = get_post(get_post_thumbnail_id())->post_excerpt; echo $caption; ?></p>
          <p><?php $post_content = get_post(get_post_thumbnail_id())->post_content; echo $post_content; ?></p>
        </div>
        <!--/.article-feature-caption-->

        <?php get_sidebar('small'); ?>

      </div>
      <!--/.content-->
    </div>
    <?php endwhile; endif; ?>

<?php get_footer(); ?>
