(() => {
const reviewsSlider = document.querySelector('.reviews__slider');
if (reviewsSlider && typeof Swiper !== 'undefined') {
  const handleReviewsUpdate = (swiper) => {
    swiper.slides.forEach((slide) => {
      slide.inert = !slide.classList.contains('swiper-slide-visible');
      slide.setAttribute('aria-hidden', String(slide.inert));
    });
    (swiper.pagination?.bullets || []).forEach((bullet, index) => {
      bullet.setAttribute('aria-label', `Go to review page ${index + 1}`);
      bullet.setAttribute('aria-current', bullet.classList.contains('swiper-pagination-bullet-active') ? 'true' : 'false');
    });
  };
  const reviewsMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const reviewsSwiper = new Swiper(reviewsSlider, {
    slidesPerView: 1,
    slidesPerGroup: 1,
    spaceBetween: 30,
    grabCursor: true,
    simulateTouch: true,
    watchSlidesProgress: true,
    speed: reviewsMotion.matches ? 0 : 350,
    mousewheel: { forceToAxis: true, releaseOnEdges: true, thresholdDelta: 12, thresholdTime: 400 },
    pagination: {
      el: reviewsSlider.querySelector('.reviews__pagination'),
      clickable: true,
      bulletElement: 'button',
      renderBullet: (index, className) => `<button type="button" class="${className}" aria-label="Go to review page ${index + 1}"></button>`,
    },
    a11y: { enabled: true, containerRoleDescriptionMessage: 'carousel', itemRoleDescriptionMessage: 'review' },
    breakpoints: { 800: { slidesPerView: 2, slidesPerGroup: 2 } },
    on: { init: handleReviewsUpdate, slideChangeTransitionEnd: handleReviewsUpdate, paginationUpdate: handleReviewsUpdate, resize: handleReviewsUpdate },
  });
  const handleReviewsMotionChange = () => {
    reviewsSwiper.params.speed = reviewsMotion.matches ? 0 : 350;
    if (reviewsMotion.matches && reviewsSwiper.animating) reviewsSwiper.slideTo(reviewsSwiper.activeIndex, 0);
  };
  reviewsMotion.addEventListener('change', handleReviewsMotionChange);
}
})();
