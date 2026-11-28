(() => {
// Measure the stationary wrapper so movement never feeds back into the pointer offset.
const heroMagnet = document.querySelector('.hero__magnet');
if (heroMagnet) {
  const magneticButton = heroMagnet.querySelector('.hero__button');
  const magneticMedia = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const resetMagneticButton = () => {
    magneticButton.style.removeProperty('--magnet-x');
    magneticButton.style.removeProperty('--magnet-y');
  };
  const handleMagneticMove = (event) => {
    if (!magneticMedia.matches || event.pointerType !== 'mouse' || magneticButton.disabled) return;
    const bounds = heroMagnet.getBoundingClientRect();
    const x = Math.max(-14, Math.min(14, (event.clientX - bounds.left - bounds.width / 2) * .22));
    const y = Math.max(-10, Math.min(10, (event.clientY - bounds.top - bounds.height / 2) * .22));
    magneticButton.style.setProperty('--magnet-x', `${x}px`);
    magneticButton.style.setProperty('--magnet-y', `${y}px`);
  };
  heroMagnet.addEventListener('pointermove', handleMagneticMove);
  heroMagnet.addEventListener('pointerleave', resetMagneticButton);
  heroMagnet.addEventListener('pointercancel', resetMagneticButton);
  magneticButton.addEventListener('click', resetMagneticButton);
  magneticButton.addEventListener('blur', resetMagneticButton);
  magneticMedia.addEventListener('change', resetMagneticButton);
  window.addEventListener('blur', resetMagneticButton);
}

const heroVisual = document.querySelector('.hero__visual');
if (heroVisual) {
  const heroImage = heroVisual.querySelector('.hero__image');
  const tiltMedia = window.matchMedia('(hover: hover) and (pointer: fine) and (prefers-reduced-motion: no-preference)');
  const resetHeroTilt = () => {
    heroImage.style.removeProperty('--hero-tilt-x');
    heroImage.style.removeProperty('--hero-tilt-y');
  };
  const handleHeroTilt = (event) => {
    if (!tiltMedia.matches || event.pointerType !== 'mouse') return;
    const bounds = heroVisual.getBoundingClientRect();
    const horizontal = Math.max(-1, Math.min(1, (event.clientX - bounds.left) / bounds.width * 2 - 1));
    const vertical = Math.max(-1, Math.min(1, (event.clientY - bounds.top) / bounds.height * 2 - 1));
    heroImage.style.setProperty('--hero-tilt-x', `${-vertical * 6}deg`);
    heroImage.style.setProperty('--hero-tilt-y', `${horizontal * 6}deg`);
  };
  heroVisual.addEventListener('pointermove', handleHeroTilt);
  heroVisual.addEventListener('pointerleave', resetHeroTilt);
  heroVisual.addEventListener('pointercancel', resetHeroTilt);
  tiltMedia.addEventListener('change', resetHeroTilt);
  window.addEventListener('blur', resetHeroTilt);
}

const featuredPhoto = document.querySelector('.featured__photo');
if (featuredPhoto) {
  const parallaxImage = featuredPhoto.querySelector('img');
  const parallaxMedia = window.matchMedia('(prefers-reduced-motion: no-preference)');
  let parallaxFrame = 0;
  const updateFeaturedParallax = () => {
    parallaxFrame = 0;
    if (!parallaxMedia.matches) {
      parallaxImage.style.removeProperty('--featured-parallax');
      return;
    }
    const bounds = featuredPhoto.getBoundingClientRect();
    const distanceFromCenter = window.innerHeight / 2 - bounds.top - bounds.height / 2;
    const offset = Math.max(-36, Math.min(36, distanceFromCenter * .12));
    parallaxImage.style.setProperty('--featured-parallax', `${offset.toFixed(2)}px`);
  };
  const handleFeaturedParallax = () => {
    if (parallaxFrame) return;
    parallaxFrame = window.requestAnimationFrame(updateFeaturedParallax);
  };
  window.addEventListener('scroll', handleFeaturedParallax, { passive: true });
  window.addEventListener('resize', handleFeaturedParallax);
  parallaxMedia.addEventListener('change', handleFeaturedParallax);
  updateFeaturedParallax();
}

// Progressive enhancement: content stays visible without JS or IntersectionObserver.
const revealMedia = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !revealMedia.matches) {
  const revealElements = [...document.querySelectorAll([
    '.hero__content > *', '.hero__visual',
    '.partners__title', '.partners__item',
    '.properties__title', '.properties__item',
    '.featured__title', '.featured__description', '.featured__card', '.featured__photo',
    '.reviews__eyebrow', '.reviews__title', '.reviews__slider',
    '.subscribe__title', '.subscribe__description', '.subscribe__form',
    '.footer__copyright', '.privacy__title', '.privacy__text > *',
  ].join(','))];
  const revealAnimations = new Map();
  const revealDelays = new WeakMap();
  const revealOpacities = new WeakMap();
  const revealGroups = new Map();
  let previousRevealScroll = window.scrollY;
  let isRevealScrollingDown = true;
  const handleRevealDirection = () => {
    const position = window.scrollY;
    if (position !== previousRevealScroll) isRevealScrollingDown = position > previousRevealScroll;
    previousRevealScroll = position;
  };
  window.addEventListener('scroll', handleRevealDirection, { passive: true });
  const revealElement = (element, immediate = false) => {
    if (!element.classList.contains('scroll-reveal--pending')) return;
    element.classList.remove('scroll-reveal--pending');
    if (immediate || revealMedia.matches) return;
    // Individual translate preserves existing transforms (e.g. the Figma card offset).
    const animation = element.animate([
      { opacity: 0, translate: '0 48px' },
      { opacity: revealOpacities.get(element), translate: '0 0' },
    ], { duration: 800, delay: revealDelays.get(element) || 0, easing: 'cubic-bezier(.2,.7,.2,1)', fill: 'backwards' });
    revealAnimations.set(element, animation);
    const cleanupAnimation = () => {
      if (revealAnimations.get(element) === animation) revealAnimations.delete(element);
    };
    animation.finished.then(cleanupAnimation).catch(cleanupAnimation);
  };
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        revealElement(entry.target, !isRevealScrollingDown);
        return;
      }
      // Re-arm only below the viewport, never as a block leaves through the top.
      if (entry.boundingClientRect.top >= window.innerHeight && !entry.target.contains(document.activeElement)) {
        revealAnimations.get(entry.target)?.cancel();
        entry.target.classList.add('scroll-reveal--pending');
      }
    });
  }, { threshold: 0, rootMargin: '0px' });
  revealElements.forEach((element) => {
    const groupIndex = revealGroups.get(element.parentElement) || 0;
    revealGroups.set(element.parentElement, groupIndex + 1);
    revealDelays.set(element, Math.min(groupIndex % 6, 3) * 90);
    revealOpacities.set(element, getComputedStyle(element).opacity);
    element.classList.add('scroll-reveal--pending');
    revealObserver.observe(element);
  });
  const handleRevealFocus = (event) => {
    const pending = event.target.closest('.scroll-reveal--pending');
    if (pending) revealElement(pending, true);
    // Keyboard navigation must not wait for an in-progress entrance animation.
    revealAnimations.forEach((animation, element) => {
      if (element.contains(event.target)) animation.finish();
    });
  };
  const handleRevealMotionChange = () => {
    if (!revealMedia.matches) return;
    revealElements.forEach((element) => revealElement(element, true));
    revealAnimations.forEach((animation) => animation.finish());
    revealObserver.disconnect();
  };
  document.addEventListener('focusin', handleRevealFocus);
  revealMedia.addEventListener('change', handleRevealMotionChange);
}

// Touch feedback complements hover without intercepting clicks or page scrolling.
let touchPressedControl = null;
let touchPressedPointer = null;
let touchReleaseTimer = 0;
const clearTouchFeedback = () => {
  window.clearTimeout(touchReleaseTimer);
  touchPressedControl?.classList.remove('is-touch-pressed');
  touchPressedControl?.style.removeProperty('--touch-magnet-x');
  touchPressedControl?.style.removeProperty('--touch-magnet-y');
  touchPressedControl = null;
  touchPressedPointer = null;
};
const updateTouchMagnet = (event) => {
  if (!touchPressedControl?.matches('.hero__button')) return;
  const bounds = touchPressedControl.closest('.hero__magnet').getBoundingClientRect();
  const x = Math.max(-14, Math.min(14, (event.clientX - bounds.left - bounds.width / 2) * .22));
  const y = Math.max(-10, Math.min(10, (event.clientY - bounds.top - bounds.height / 2) * .22));
  touchPressedControl.style.setProperty('--touch-magnet-x', `${x}px`);
  touchPressedControl.style.setProperty('--touch-magnet-y', `${y - 3}px`);
};
const handleTouchPress = (event) => {
  if (event.pointerType !== 'touch' && event.pointerType !== 'pen') return;
  const control = event.target.closest('button, .request-form__options label');
  if (!control || control.matches(':disabled')) return;
  clearTouchFeedback();
  touchPressedControl = control;
  touchPressedPointer = event.pointerId;
  control.classList.add('is-touch-pressed');
  updateTouchMagnet(event);
};
const handleTouchMove = (event) => {
  if (event.pointerId !== touchPressedPointer) return;
  const bounds = touchPressedControl.getBoundingClientRect();
  if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) {
    clearTouchFeedback();
    return;
  }
  updateTouchMagnet(event);
};
const handleTouchRelease = (event) => {
  if (event.pointerId !== touchPressedPointer) return;
  touchReleaseTimer = window.setTimeout(clearTouchFeedback, 320);
};
const handleTouchCancel = (event) => {
  if (event.pointerId === touchPressedPointer) clearTouchFeedback();
};
document.addEventListener('pointerdown', handleTouchPress, { passive: true });
document.addEventListener('pointermove', handleTouchMove, { passive: true });
document.addEventListener('pointerup', handleTouchRelease, { passive: true });
document.addEventListener('pointercancel', handleTouchCancel, { passive: true });
window.addEventListener('blur', clearTouchFeedback);
})();
