(function () {
  function findQuantityInput(form) {
    var insideForm = form.querySelector('[name="quantity"]');
    if (insideForm) return insideForm;
    if (form.id) {
      return document.querySelector('[name="quantity"][form="' + form.id + '"]');
    }
    return null;
  }

  function clampQuantity(value, max) {
    var qty = parseInt(value, 10);
    if (!isFinite(qty) || qty < 1) qty = 1;
    if (qty > max) qty = max;
    return qty;
  }

  function init() {
    document.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-iris-randomize-button]');
      if (!btn) return;

      var container = btn.closest('[data-iris-randomize]');
      if (!container) return;

      var errorEl = container.querySelector('.iris-randomize__error');
      var form = container.closest('form[action="/cart/add"]');

      if (!form) {
        if (errorEl) { errorEl.textContent = 'Product form not found.'; errorEl.hidden = false; }
        return;
      }

      if (btn.disabled) return;
      btn.disabled = true;
      if (errorEl) { errorEl.hidden = true; errorEl.textContent = ''; }

      var max = parseInt(container.getAttribute('data-iris-max'), 10);
      if (!isFinite(max) || max < 1) max = 10;

      var qtyInput = findQuantityInput(form);
      var qty = clampQuantity(qtyInput ? qtyInput.value : 1, max);

      var variantInput = form.querySelector('[name="id"]');
      var variantId = variantInput && variantInput.value;
      if (!variantId) {
        if (errorEl) { errorEl.textContent = 'Variant not selected.'; errorEl.hidden = false; }
        btn.disabled = false;
        return;
      }

      function reserveOne() {
        return fetch('/apps/iris/reserve-random', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }
        }).then(function (res) {
          if (!res.ok) throw new Error('reserve_failed');
          return res.json();
        });
      }

      function addOne(data) {
        if (!data || !data.irisId || !data.reservationToken) throw new Error('bad_response');
        return fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify({
            id: variantId,
            quantity: 1,
            properties: {
              IRIS_ID: data.irisId,
              IRIS_RESERVATION_TOKEN: data.reservationToken
            }
          })
        }).then(function (res) {
          if (!res.ok) throw new Error('add_to_cart_failed');
          return res.json();
        });
      }

      var chain = Promise.resolve();
      for (var i = 0; i < qty; i++) {
        chain = chain
          .then(reserveOne)
          .then(addOne);
      }

      chain
        .then(function () {
          window.location.assign('/cart');
        })
        .catch(function () {
          if (errorEl) {
            errorEl.textContent = 'Could not reserve IRIS right now. Please try again.';
            errorEl.hidden = false;
          }
        })
        .finally(function () {
          btn.disabled = false;
        });
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
