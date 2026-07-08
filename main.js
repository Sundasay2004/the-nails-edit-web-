import { products } from './products.js';

// Cart state management
export function getCart() {
  const cart = localStorage.getItem('nail_edit_cart');
  return cart ? JSON.parse(cart) : [];
}

export function saveCart(cart) {
  localStorage.setItem('nail_edit_cart', JSON.stringify(cart));
  updateCartUI();
}

export function addToCart(productId, size = 'M') {
  const cart = getCart();
  const product = products.find(p => p.id === productId);
  if (!product) return;

  const existingItemIndex = cart.findIndex(item => item.id === productId && item.size === size);

  if (existingItemIndex > -1) {
    cart[existingItemIndex].qty += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      cardClass: product.cardClass,
      qty: 1,
      size: size
    });
  }

  saveCart(cart);
  openCartDrawer();
}

export function removeFromCart(productId, size = 'M') {
  let cart = getCart();
  cart = cart.filter(item => !(item.id === productId && item.size === size));
  saveCart(cart);
}

export function updateQty(productId, newQty, size = 'M') {
  const cart = getCart();
  const item = cart.find(item => item.id === productId && item.size === size);
  if (item) {
    item.qty = Math.max(1, newQty);
    saveCart(cart);
  }
}

// UI Controllers
export function openCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay && drawer) {
    overlay.classList.remove('opacity-0', 'pointer-events-none');
    drawer.classList.remove('translate-x-full');
  }
}

export function closeCartDrawer() {
  const overlay = document.getElementById('cart-drawer-overlay');
  const drawer = document.getElementById('cart-drawer');
  if (overlay && drawer) {
    overlay.classList.add('opacity-0', 'pointer-events-none');
    drawer.classList.add('translate-x-full');
  }
}

function updateCartUI() {
  const cart = getCart();
  
  // Update badge count
  const badges = document.querySelectorAll('.cart-badge');
  const totalQty = cart.reduce((sum, item) => sum + item.qty, 0);
  badges.forEach(badge => {
    badge.textContent = totalQty;
    if (totalQty === 0) {
      badge.classList.add('hidden');
    } else {
      badge.classList.remove('hidden');
    }
  });

  // Render items in drawer
  const itemsContainer = document.getElementById('cart-drawer-items');
  const subtotalEl = document.getElementById('cart-drawer-subtotal');
  
  if (itemsContainer) {
    if (cart.length === 0) {
      itemsContainer.innerHTML = `
        <div class="flex flex-col items-center justify-center h-64 gap-4 text-on-surface-variant">
          <span class="material-symbols-outlined text-6xl">shopping_bag</span>
          <p class="font-headline-md text-xl">Your bag is empty, bestie!</p>
          <a href="shop.html" class="px-6 py-2 border-2 border-on-background bg-electric-orange text-white font-label-caps rounded-xl hover:bg-mellow-yellow hover:text-on-background transition-all">Go Shop</a>
        </div>
      `;
    } else {
      itemsContainer.innerHTML = cart.map(item => `
        <div class="flex gap-4 items-center group border-2 border-on-background p-3 rounded-xl bg-white relative">
          <div class="w-16 h-16 rounded-lg border-2 border-on-background bg-cover bg-center shrink-0" style="background-image: url('${item.image}')"></div>
          <div class="flex-grow">
            <h4 class="font-bold text-sm">${item.name}</h4>
            <p class="text-xs text-on-surface-variant">Size: ${item.size}</p>
            <div class="flex justify-between items-center mt-2">
              <div class="flex items-center border border-on-background rounded-lg bg-paper-white">
                <button class="px-2 py-0.5 font-bold text-xs hover:bg-mellow-yellow rounded-l-lg decrement-btn" data-id="${item.id}" data-size="${item.size}">-</button>
                <span class="px-2 text-xs font-label-caps">${item.qty}</span>
                <button class="px-2 py-0.5 font-bold text-xs hover:bg-mellow-yellow rounded-r-lg increment-btn" data-id="${item.id}" data-size="${item.size}">+</button>
              </div>
              <span class="font-label-caps text-xs">${item.price * item.qty} PKR</span>
            </div>
          </div>
          <button class="absolute -top-2 -right-2 material-symbols-outlined text-xs p-1 border border-on-background bg-bubblegum-pink rounded-full hover:bg-electric-orange remove-btn" data-id="${item.id}" data-size="${item.size}">close</button>
        </div>
      `).join('');

      // Add event listeners for increment, decrement, and remove buttons
      itemsContainer.querySelectorAll('.increment-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const size = btn.getAttribute('data-size');
          const item = cart.find(i => i.id === id && i.size === size);
          if (item) updateQty(id, item.qty + 1, size);
        });
      });

      itemsContainer.querySelectorAll('.decrement-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const size = btn.getAttribute('data-size');
          const item = cart.find(i => i.id === id && i.size === size);
          if (item) updateQty(id, item.qty - 1, size);
        });
      });

      itemsContainer.querySelectorAll('.remove-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const id = btn.getAttribute('data-id');
          const size = btn.getAttribute('data-size');
          removeFromCart(id, size);
        });
      });
    }
  }

  if (subtotalEl) {
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
    subtotalEl.textContent = `${subtotal} PKR`;
  }
}

// Inject Drawer HTML on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  // If drawer element doesn't exist, inject it
  if (!document.getElementById('cart-drawer') && !window.location.pathname.includes('checkout')) {
    const drawerContainer = document.createElement('div');
    drawerContainer.innerHTML = `
      <div id="cart-drawer-overlay" class="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm opacity-0 pointer-events-none transition-opacity duration-300"></div>
      <div id="cart-drawer" class="fixed top-0 right-0 bottom-0 z-[101] w-full max-w-md bg-paper-white border-l-4 border-on-background translate-x-full transition-transform duration-300 flex flex-col shadow-[[-8px_0px_0px_0px_#FFA41B]]">
        <!-- Header -->
        <div class="p-6 border-b-2 border-on-background flex justify-between items-center bg-bubblegum-pink">
          <h3 class="font-headline-md text-headline-md leading-none">Your Bag</h3>
          <button id="close-cart-btn" class="material-symbols-outlined p-2 border-2 border-on-background bg-paper-white rounded-full hover:bg-mellow-yellow transition-all flex items-center justify-center">close</button>
        </div>
        <!-- Items list -->
        <div id="cart-drawer-items" class="flex-grow p-6 overflow-y-auto space-y-6 custom-scrollbar">
          <!-- Dynamic Items -->
        </div>
        <!-- Footer -->
        <div class="p-6 border-t-2 border-on-background bg-mint-green space-y-4">
          <div class="flex justify-between font-label-caps text-label-caps text-on-background">
            <span>Subtotal</span>
            <span id="cart-drawer-subtotal">0 PKR</span>
          </div>
          <div class="flex justify-between font-label-caps text-label-caps text-on-background">
            <span>Shipping</span>
            <span class="text-on-background font-bold">FREE</span>
          </div>
          <a href="checkout.html" class="w-full py-4 bg-electric-orange text-white font-headline-md text-headline-md border-2 border-on-background rounded-xl shadow-[4px_4px_0px_0px_#222222] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all flex items-center justify-center gap-3">
            Checkout
            <span class="material-symbols-outlined">shopping_cart_checkout</span>
          </a>
        </div>
      </div>
    `;
    
    // Custom scrollbar styling
    const scrollStyle = document.createElement('style');
    scrollStyle.innerHTML = `
      .custom-scrollbar::-webkit-scrollbar {
        width: 6px;
      }
      .custom-scrollbar::-webkit-scrollbar-track {
        background: transparent;
      }
      .custom-scrollbar::-webkit-scrollbar-thumb {
        background: #FFA41B;
        border-radius: 10px;
        border: 1px solid #222222;
      }
    `;
    document.head.appendChild(scrollStyle);
    document.body.appendChild(drawerContainer);

    // Event listeners
    document.getElementById('close-cart-btn').addEventListener('click', closeCartDrawer);
    document.getElementById('cart-drawer-overlay').addEventListener('click', closeCartDrawer);
  }

  // Hook shopping bag buttons
  const cartButtons = document.querySelectorAll('.shopping-bag-trigger');
  cartButtons.forEach(btn => {
    btn.addEventListener('click', openCartDrawer);
  });

  updateCartUI();
});
