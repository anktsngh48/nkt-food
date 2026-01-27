// ===== CONFIG =====
const API = 'https://script.google.com/macros/s/AKfycbwtFI3cxa3w1kqDihF_4eCMdqZKFiy7jJS4HBwpFKS3G67Y_m0jI2ZweCX7zbrOqTKL/exec';

let MENU = [];
let SETTINGS = {};

// ===== LOAD SETTINGS =====
fetch(`${API}?action=settings`)
  .then(res => res.json())
  .then(s => {
    SETTINGS = s;
    document.getElementById('title').innerText = s.PageTitle || '';
  })
  .catch(err => console.error('Settings fetch error', err));

// ===== LOAD MENU =====
fetch(`${API}?action=menu`)
  .then(res => res.json())
  .then(data => {
    MENU = data;
    renderMenu();
  })
  .catch(err => console.error('Menu fetch error', err));

// ===== RENDER MENU =====
function renderMenu() {
  const menuDiv = document.getElementById('menu');
  menuDiv.innerHTML = '';

  MENU.forEach(item => {
    const soldOut = item[4] === 'Sold Out';

    menuDiv.innerHTML += `
      <div class="item">
        <div class="name">${item[1]}</div>
        <div class="price">₹${item[3]}</div>

        <div class="qty">
          <button onclick="changeQty(${item[0]}, -1)" ${soldOut ? 'disabled' : ''}>−</button>
          <span id="q${item[0]}">0</span>
          <button onclick="changeQty(${item[0]}, 1)" ${soldOut ? 'disabled' : ''}>+</button>
        </div>

        ${soldOut ? '<div class="sold">Sold Out</div>' : ''}
      </div>
    `;
  });
}

// ===== CHANGE QUANTITY =====
function changeQty(id, delta) {
  const qtyEl = document.getElementById('q' + id);
  qtyEl.innerText = Math.max(0, Number(qtyEl.innerText) + delta);
  validateSubmit();
}

// ===== ENABLE / DISABLE SUBMIT BUTTON =====
function validateSubmit() {
  const hasItem = MENU.some(
    item => Number(document.getElementById('q' + item[0]).innerText) > 0
  );
  document.getElementById('submitBtn').disabled = !hasItem;
}

// ===== GET SELECTED ITEMS =====
function getSelectedItems() {
  return MENU
    .filter(item => Number(document.getElementById('q' + item[0]).innerText) > 0)
    .map(item => ({
      foodId: item[0],
      foodName: item[1],
      qty: Number(document.getElementById('q' + item[0]).innerText)
    }));
}

// ===== SUBMIT ORDER (WEBSITE) =====
function submitOrder() {
  const items = getSelectedItems();
  if (items.length === 0) return;

  fetch(API, {
    method: 'POST',
    body: JSON.stringify({
      name: document.getElementById('name').value,
      phone: document.getElementById('phone').value,
      items: items
    })
  }).then(() => {
    alert(SETTINGS.OrderConfirmation || 'Order placed');
    location.reload();
  });
}

// ===== WHATSAPP ORDER =====
function orderWhatsApp() {
  const items = getSelectedItems();
  if (items.length === 0) return;

  const message = items
    .map(i => `${i.foodName} x ${i.qty}`)
    .join(', ');

  window.open(
    `https://wa.me/${SETTINGS.WhatsAppNumber}?text=${encodeURIComponent(message)}`
  );
}
