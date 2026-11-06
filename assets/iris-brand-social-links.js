(function () {
  if (window.IRISBrandLinks) return;
  window.IRISBrandLinks = {
    render: function (root, links, name) {
      var container = root.querySelector('[data-brand-links]');
      if (!container) return;
      var visible = false;
      ['website', 'instagram', 'tiktok', 'x'].forEach(function (kind) {
        var link = container.querySelector('[data-brand-link="' + kind + '"]');
        if (!link) return;
        link.hidden = true;
        link.removeAttribute('href');
        try {
          if (!links || typeof links[kind] !== 'string') return;
          var url = new URL(links[kind]);
          if (url.protocol !== 'https:' || url.username || url.password || url.port) return;
          var domains = kind === 'x' ? ['x.com', 'www.x.com', 'twitter.com', 'www.twitter.com'] : [kind + '.com', 'www.' + kind + '.com'];
          if (kind !== 'website' && domains.indexOf(url.hostname) === -1) return;
          link.href = url.href;
          link.setAttribute('aria-label', (name || 'Artist') + ' - ' + link.getAttribute('data-platform-label'));
          link.hidden = false;
          visible = true;
        } catch (_) {}
      });
      container.hidden = !visible;
    }
  };
  document.dispatchEvent(new Event('iris:brand-links-ready'));
})();
