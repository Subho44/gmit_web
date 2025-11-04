(function () {
  'use strict';

  // Persist cart count across reloads (optional)
  var CART_KEY = 'shopkart_cart_count';
  var cartCount = parseInt(localStorage.getItem(CART_KEY) || '0', 10);

  function updateBadges() {
    var b1 = document.getElementById('cart-count');
    var b2 = document.getElementById('cart-count-desktop');
    if (b1) b1.textContent = cartCount;
    if (b2) b2.textContent = cartCount;
  }

  function showToast(message) {
    // Pure JS toast (no Bootstrap dependency)
    var root = document.getElementById('toast-root');
    var toast = document.createElement('div');
    toast.className = 'toast-lite bg-dark text-white';
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    root.appendChild(toast);
    setTimeout(function () {
      toast.classList.add('hide');
      setTimeout(function () {
        toast.remove();
      }, 200);
    }, 1600);
  }

  function handleAdd(btn) {
    var name = btn.getAttribute('data-name') || 'Item';
    // Increment count
    cartCount += 1;
    localStorage.setItem(CART_KEY, String(cartCount));
    updateBadges();

    // Brief visual feedback on button
    var original = btn.textContent;
    btn.disabled = true;
    btn.textContent = 'Added ✓';
    setTimeout(function () {
      btn.disabled = false;
      btn.textContent = original;
    }, 900);

    // Toast
    showToast(name + ' added to cart');
  }

  function bindButtons() {
    document.querySelectorAll('[data-add-to-cart]').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        handleAdd(btn);
      });
    });
  }

  // Smooth scroll for in-page nav links
  function bindSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
      a.addEventListener('click', function (e) {
        var id = a.getAttribute('href');
        if (!id || id === '#') return;
        var target = document.querySelector(id);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    });
  }

  // Init
  document.addEventListener('DOMContentLoaded', function () {
    updateBadges();
    bindButtons();
    bindSmoothScroll();
  });
})();
