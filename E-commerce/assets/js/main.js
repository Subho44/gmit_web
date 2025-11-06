(function () {
  'use strict';

  // Persist cart count across reloads (optional)
  var CART_KEY = 'shopkart_cart_count';
  var cart = loadCart();

  function loadCart() {
    try {
      var data = JSON.parse(localStorage.getItem(CART_KEY)|| '[]');
      return Array.isArray(data) ? data : [];
    } catch(e) {return []; }
  }

  function saveCart() {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }
   function cartCount() {
    return cart.reduce(function(s,it){return s+it.qty;}, 0);
  }
   function money(n) {
    return Number(n).toLocaleString();
  }
   function subtotalt() {
    return cart.reduce(function(s,it){return s +it.price * it.qty;}, 0);
  }



  function updateBadges() {
    var b1 = document.getElementById('cart-count');
    var b2 = document.getElementById('cart-count-desktop');
    var count = String(cartCount());
    if (b1) b1.textContent = count;
    if (b2) b2.textContent = count;
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

//ADD TO CART
 function addToCart(item) {
  var found = cart.find(function(x){return x.id === item.id});
  if(found) {
    found.qty +=1;
  } else {
    cart.push({id:item.id, name:item.name, price:Number(item.price), qty:1});
  }
   saveCart();
   updateBadges();
   showToast(item.name + 'added to cart');

   $('#cartModal').modal('show');
   renderCart();
 }

 function bindAddToCartButtons() {
  document.querySelectorAll('[data-add-to-cart]').forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.preventDefault();
      addToCart({
        id:btn.getAttribute('data-id') || ('id-' +Date.now()),
        name:btn.getAttribute('data-name') || 'Item',
        price:Number(btn.getAttribute('data-price')|| '0')
      });
    });
  });
 }

 //cart render qty/removet

 function renderCart() {
   var empty = document.getElementById('emptyCart');
   var tableWrap = document.getElementById('cartTable');
   var tbody = document.getElementById('cartTableBody');

   if(!tbody) return ;
   tbody.innerHTML = '';

   if(cart.length === 0) {
    if(empty) empty.style.display = 'block';
    if(tableWrap) tableWrap.style.display = 'none';
   } else {
    if(empty) empty.style.display = 'none';
    if(tableWrap) tableWrap.style.display = 'block';
   }

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
