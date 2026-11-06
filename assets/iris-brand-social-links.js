(function () {
  if (window.IRISBrandLinks) return;
  window.IRISBrandLinks = {
    render: function (root, links, name) {
      var container = root.querySelector('[data-brand-links]');
      if (!container) return;
      var visible = false;
      ['instagram', 'website', 'tiktok'].forEach(function (kind) {
        var link = container.querySelector('[data-brand-link="' + kind + '"]');
        link.hidden = true;
        link.removeAttribute('href');
        try {
          if (!links || typeof links[kind] !== 'string') return;
          var url = new URL(links[kind]);
          if (url.protocol !== 'https:' || url.username || url.password || url.port) return;
          if (kind !== 'website' && [kind + '.com', 'www.' + kind + '.com'].indexOf(url.hostname) === -1) return;
          link.href = url.href;
          link.setAttribute('aria-label', (name || 'Artist') + ' - ' + link.textContent);
          link.hidden = false;
          visible = true;
        } catch (_) {}
      });
      container.hidden = !visible;
    }
  };
  document.dispatchEvent(new Event('iris:brand-links-ready'));
})();
