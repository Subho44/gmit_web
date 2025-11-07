(function () {
  'use strict';

  /* ========== CART STATE (localStorage) ========== */
  var CART_KEY = 'shopkart_cart_items';
  var cart = loadCart();

  function loadCart() {
    try { var d = JSON.parse(localStorage.getItem(CART_KEY) || '[]'); return Array.isArray(d)? d:[]; }
    catch(e){ return []; }
  }
  function saveCart(){ localStorage.setItem(CART_KEY, JSON.stringify(cart)); }
  function cartCount(){ return cart.reduce(function(s,it){return s+it.qty;},0); }
  function fmt(n){ return Number(n).toLocaleString(); }
  function subtotal(){ return cart.reduce(function(s,it){return s+it.price*it.qty;},0); }

  /* ========== BADGE / TOAST ========== */
  function updateBadges(){
    var m=document.getElementById('cart-count'), d=document.getElementById('cart-count-desktop');
    var c=String(cartCount()); if(m) m.textContent=c; if(d) d.textContent=c;
  }
  function showToast(msg){
    var root=document.getElementById('toast-root'); if(!root) return;
    var el=document.createElement('div'); el.className='toast-lite bg-dark text-white'; el.textContent=msg;
    root.appendChild(el);
    setTimeout(function(){ el.classList.add('hide'); setTimeout(function(){ el.remove(); },200); },1500);
  }

  /* ========== ADD TO CART ========== */
  function addToCart(item){
    var f=cart.find(function(x){return x.id===item.id;});
    if(f){ f.qty+=1; } else { cart.push({id:item.id, name:item.name, price:Number(item.price), qty:1}); }
    saveCart(); updateBadges(); showToast(item.name+' added to cart');
    $('#cartModal').modal('show'); renderCart();
  }
  function bindAdd(){
    document.querySelectorAll('[data-add-to-cart]').forEach(function(btn){
      btn.addEventListener('click', function(e){
        e.preventDefault();
        addToCart({ id: btn.getAttribute('data-id')||('id-'+Date.now()),
                    name: btn.getAttribute('data-name')||'Item',
                    price: Number(btn.getAttribute('data-price')||'0') });
      });
    });
  }

  /* ========== CART RENDER + QTY/REMOVE ========== */
  function setText(id, val){ var el=document.getElementById(id); if(el) el.textContent=val; }
  function renderCart(){
    var empty=document.getElementById('emptyCart');
    var table=document.getElementById('cartTable');
    var tbody=document.getElementById('cartTableBody');
    if(!tbody) return; tbody.innerHTML='';

    if(cart.length===0){ if(empty) empty.style.display='block'; if(table) table.style.display='none'; }
    else { if(empty) empty.style.display='none'; if(table) table.style.display='block'; }

    cart.forEach(function(it){
      var tr=document.createElement('tr');

      var tdItem=document.createElement('td');
      tdItem.innerHTML='<div class="font-weight-600">'+it.name+'</div><div class="text-muted small">Unit: $'+fmt(it.price)+'</div>';

      var tdQty=document.createElement('td'); tdQty.className='text-center';
      tdQty.innerHTML='<div class="btn-group btn-group-sm" role="group">'
        +'<button class="btn btn-outline-secondary" data-action="dec" data-id="'+it.id+'">–</button>'
        +'<button class="btn btn-light" disabled>'+it.qty+'</button>'
        +'<button class="btn btn-outline-secondary" data-action="inc" data-id="'+it.id+'">+</button>'
        +'</div>';

      var tdPrice=document.createElement('td'); tdPrice.className='text-center'; tdPrice.textContent='$'+fmt(it.price);
      var tdTotal=document.createElement('td'); tdTotal.className='text-center'; tdTotal.textContent='$'+fmt(it.price*it.qty);

      var tdRemove=document.createElement('td'); tdRemove.className='text-center';
      tdRemove.innerHTML='<button class="btn btn-sm btn-outline-danger" data-action="remove" data-id="'+it.id+'"><i class="fas fa-trash"></i></button>';

      tr.appendChild(tdItem); tr.appendChild(tdQty); tr.appendChild(tdPrice); tr.appendChild(tdTotal); tr.appendChild(tdRemove);
      tbody.appendChild(tr);
    });

    var st=subtotal(), tax=Math.round(st*0.10), grand=st+tax;
    setText('subtotal', fmt(st)); setText('tax', fmt(tax)); setText('grandTotal', fmt(grand)); setText('payableNow', fmt(grand));
  }
  function tableClick(e){
    var btn=e.target.closest('button[data-action]'); if(!btn) return;
    var action=btn.getAttribute('data-action'), id=btn.getAttribute('data-id');
    var it=cart.find(function(x){return x.id===id;}); if(!it) return;
    if(action==='inc') it.qty+=1;
    else if(action==='dec') it.qty=Math.max(1, it.qty-1);
    else if(action==='remove') cart=cart.filter(function(x){return x.id!==id;});
    saveCart(); updateBadges(); renderCart();
  }

  /* ========== CHECKOUT ========== */
  function goCheckout(){
    if(cart.length===0){ showToast('Cart is empty.'); return; }
    $('#cartModal').modal('hide'); $('#checkoutModal').modal('show');
  }
  function placeOrder(e){
    e.preventDefault();
    var f=e.target;
    var name=(f.name.value||'').trim(), phone=(f.phone.value||'').trim(),
        address=(f.address.value||'').trim(), payment=(f.payment.value||'').trim();
    if(!name||!phone||!address||!payment){ showToast('Please fill all fields.'); return; }
    var orderId='SK'+Date.now().toString().slice(-6);
    cart=[]; saveCart(); updateBadges(); renderCart();
    $('#checkoutModal').modal('hide');
    setTimeout(function(){ showToast('Order '+orderId+' placed successfully!'); },200);
  }

  /* ========== GEOLOCATION (NEW) ========== */
  // Reverse geocode using OpenStreetMap Nominatim (free). Requires internet.
  function reverseGeocode(lat, lon){
    var url='https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat='+encodeURIComponent(lat)+'&lon='+encodeURIComponent(lon);
    // Identify app politely; some browsers ignore custom UA—this is okay.
    return fetch(url, { headers: { 'Accept-Language': 'en' } })
      .then(function(r){ return r.json(); })
      .catch(function(){ return null; });
  }

  function updateLocationUI(status, addrText, coords){
    var locStatus=document.getElementById('locStatus');
    var locAddress=document.getElementById('locAddress');
    var locCoords=document.getElementById('locCoords');
    var locMapLink=document.getElementById('locMapLink');

    if(locStatus) locStatus.textContent=status || '';
    if(locAddress) locAddress.textContent=addrText || '—';
    if(locCoords) locCoords.textContent=coords || '—';

    if(coords){
      var parts=coords.split(',');
      var lat=parseFloat(parts[0]); var lon=parseFloat(parts[1]);
      if(locMapLink){
        locMapLink.href='https://www.google.com/maps?q='+lat+','+lon;
        locMapLink.classList.remove('d-none');
      }
    } else {
      if(locMapLink){ locMapLink.classList.add('d-none'); }
    }

    // Short label under navbar
    var shortLabel=document.getElementById('locationShort');
    if(shortLabel){
      shortLabel.textContent='Location: '+(addrText ? addrText : 'Unknown');
    }
  }

  function detectLocation(){
    $('#locationModal').modal('show');
    if(!('geolocation' in navigator)){
      updateLocationUI('Geolocation not supported in this browser.', null, null);
      return;
    }
    updateLocationUI('Detecting location… (allow permission)', '—', '—');

    navigator.geolocation.getCurrentPosition(
      function(pos){
        var lat=pos.coords.latitude.toFixed(6);
        var lon=pos.coords.longitude.toFixed(6);
        updateLocationUI('Location received. Resolving address…', null, lat+','+lon);

        reverseGeocode(lat, lon).then(function(data){
          var label=(data && (data.display_name || (data.address && (data.address.city || data.address.town || data.address.village || data.address.state)))) || null;

          // Make a short-friendly label for navbar if long
          var short = null;
          if(data && data.address){
            short = data.address.city || data.address.town || data.address.village || data.address.suburb || data.address.state || null;
          }
          var showAddr = label || 'Coordinates detected';
          updateLocationUI('Done.', short || showAddr, lat+','+lon);
        }).catch(function(){
          updateLocationUI('Address lookup failed. Showing coordinates.', null, lat+','+lon);
        });
      },
      function(err){
        var msg='Failed to detect location.';
        if(err && err.code===1) msg='Permission denied. Please allow location access.';
        if(err && err.code===2) msg='Position unavailable.';
        if(err && err.code===3) msg='Location request timed out.';
        updateLocationUI(msg, null, null);
      },
      { enableHighAccuracy:true, timeout:10000, maximumAge:60000 }
    );
  }

  /* ========== INIT ========== */
  document.addEventListener('DOMContentLoaded', function () {
    // Cart
    bindAdd(); updateBadges(); renderCart();
    var tbody=document.getElementById('cartTableBody'); if(tbody) tbody.addEventListener('click', tableClick);
    var goCheckoutBtn=document.getElementById('goCheckoutBtn'); if(goCheckoutBtn) goCheckoutBtn.addEventListener('click', goCheckout);
    var checkoutForm=document.getElementById('checkoutForm'); if(checkoutForm) checkoutForm.addEventListener('submit', placeOrder);
    var openCartBtn=document.getElementById('open-cart-btn'); if(openCartBtn) openCartBtn.addEventListener('click', renderCart);

    // Geolocation triggers (desktop + mobile)
    var detectBtn=document.getElementById('detectLocationBtn');
    var detectBtnMobile=document.getElementById('detectLocationBtnMobile');
    if(detectBtn) detectBtn.addEventListener('click', detectLocation);
    if(detectBtnMobile) detectBtnMobile.addEventListener('click', detectLocation);
  });

})();