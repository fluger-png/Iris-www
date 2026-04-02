(function () {
  var STORAGE_KEY = 'iris_referral_code';
  var NOTE_PREFIX = 'Referral: ';

  function sanitizeReferral(value) {
    if (!value) return '';
    var trimmed = String(value).trim();
    return /^[a-zA-Z0-9_-]{1,64}$/.test(trimmed) ? trimmed : '';
  }

  function getStoredReferral() {
    try {
      return sanitizeReferral(window.localStorage.getItem(STORAGE_KEY));
    } catch (e) {
      return '';
    }
  }

  function setStoredReferral(value) {
    try {
      window.localStorage.setItem(STORAGE_KEY, value);
    } catch (e) {}
  }

  function normalizeNote(note, referral) {
    var text = typeof note === 'string' ? note : '';
    var lines = text
      .split('\n')
      .map(function (line) {
        return line.trim();
      })
      .filter(function (line) {
        return line && line.toLowerCase().indexOf('referral:') !== 0;
      });

    lines.push(NOTE_PREFIX + referral);
    return lines.join('\n');
  }

  function syncReferralNote(referral) {
    fetch('/cart.js', {
      method: 'GET',
      headers: { Accept: 'application/json' },
      credentials: 'same-origin',
    })
      .then(function (response) {
        if (!response.ok) throw new Error('cart_fetch_failed');
        return response.json();
      })
      .then(function (cart) {
        var currentNote = cart && typeof cart.note === 'string' ? cart.note : '';
        var nextNote = normalizeNote(currentNote, referral);
        if (currentNote === nextNote) return null;

        return fetch('/cart/update.js', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          credentials: 'same-origin',
          body: JSON.stringify({ note: nextNote }),
        });
      })
      .catch(function () {});
  }

  var params = new URLSearchParams(window.location.search);
  var incomingReferral = sanitizeReferral(params.get('ref'));
  if (incomingReferral) {
    setStoredReferral(incomingReferral);
  }

  var referral = incomingReferral || getStoredReferral();
  if (!referral) return;

  syncReferralNote(referral);
})();
