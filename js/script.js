// Compatibility for previously cached HTML. Current pages load feature files directly.
(() => {
  const entry = document.currentScript;
  if (!entry || [...document.scripts].some((script) => script.src.includes('/js/navigation.js'))) return;
  ['properties', 'navigation', 'reviews', 'forms', 'effects'].forEach((feature) => {
    const script = document.createElement('script');
    script.src = new URL(`${feature}.js?v=release-1`, entry.src).href;
    script.async = false;
    document.head.append(script);
  });
})();
