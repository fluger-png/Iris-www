(function () {
  if (window.irisFooterGuardLoaded) return;
  window.irisFooterGuardLoaded = true;

  var footer = document.querySelector('footer.footer');
  if (!footer) return;

  var root = document.documentElement;
  var mobile = window.matchMedia('(max-width: 749px)');
  var viewport = window.visualViewport;
  var frame = 0;
  var diagnostics = new URLSearchParams(window.location.search).get('iris_footer_debug') === '1';
  var panel;

  if (diagnostics) {
    panel = document.createElement('output');
    panel.id = 'iris-footer-diagnostics';
    panel.style.cssText = 'position:fixed;top:8px;left:8px;right:8px;z-index:2147483647;padding:10px;background:#202020;color:#fff;border:1px solid #c9a84c;font:12px/1.5 monospace;white-space:pre-wrap;pointer-events:none;';
    document.body.appendChild(panel);
  }

  function update() {
    frame = 0;
    var bounds = footer.getBoundingClientRect();
    var visibleTop = viewport ? viewport.offsetTop : 0;
    var visibleBottom = visibleTop + (viewport ? viewport.height : window.innerHeight);

    // Only the collapsed promotion is hidden; the signup dialog stays usable.
    root.classList.toggle('iris-footer-in-view', mobile.matches && bounds.top < visibleBottom + 80 && bounds.bottom > visibleTop - 80);

    if (panel) {
      var round = Math.round;
      var active = document.activeElement;
      panel.textContent = [
        'IRIS footer v1 | ' + window.location.pathname,
        'inner: ' + window.innerHeight + ' | client: ' + root.clientHeight,
        'visual: ' + round(viewport ? viewport.height : window.innerHeight) + ' | offset: ' + round(visibleTop),
        'scroll: ' + round(window.scrollY) + ' | pageTop: ' + round(viewport ? viewport.pageTop : window.scrollY),
        'document: ' + root.scrollHeight + ' | footer: ' + round(bounds.bottom + window.scrollY),
        'DOM tail: ' + round(root.scrollHeight - bounds.bottom - window.scrollY) + ' | footer screen: ' + round(bounds.bottom),
        'focus: ' + (active ? active.tagName.toLowerCase() + (active.type ? ':' + active.type : '') : 'none')
      ].join('\n');
    }
  }

  function schedule() {
    if (!frame) frame = window.requestAnimationFrame(update);
  }

  if ('IntersectionObserver' in window) {
    new IntersectionObserver(schedule, { rootMargin: '80px' }).observe(footer);
  }
  if ('ResizeObserver' in window) {
    new ResizeObserver(schedule).observe(footer);
  }
  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  window.addEventListener('pageshow', schedule);
  document.addEventListener('focusin', schedule);
  document.addEventListener('focusout', schedule);
  if (viewport) {
    viewport.addEventListener('resize', schedule, { passive: true });
    viewport.addEventListener('scroll', schedule, { passive: true });
  }
  update();
})();
