const API = "https://script.google.com/macros/s/AKfycbwtFI3cxa3w1kqDihF_4eCMdqZKFiy7jJS4HBwpFKS3G67Y_m0jI2ZweCX7zbrOqTKL/exec";

let MENU = [];
let SETTINGS = {};

// Load settings
fetch(API + "?action=settings")
  .then(r => r.json())
  .then(s => {
    SETTINGS = s;
    if (s.PageTitle) {
      document.getElementById("pageTitle").innerText = s.PageTitle;
    }
  });

// Load menu
fetch(API + "?action=menu")
  .then(r => r.json())
  .then(data => {
    MENU = data;
    renderMenu();
  });

function renderMenu() {
  const menuDiv = document.getElementById("menu");
  menuDiv.innerHTML = "";

  MENU.forEach(item => {
    const id = item[0];
    const name = item[1];
    const price = item[3];
    const soldOut = item[4] === "Sold Out";

    menuDiv.innerHTML += `
      <div class="item">
        <div class="name">${name}</div>
        <div class="price">₹${price}</div>

        ${soldOut ? `<div class="sold">Sold Out</div>` : `
          <div class="qty">
            <button onclick="changeQty(${id}, -1)">−</button>
            <span id="qty-${id}">0</span>
            <button onclick="changeQty(${id}, 1)">+</button>
          </div>
        `}
      </div>
    `;
  });
}

function changeQty(id, delta) {
  const span = document.getElementById("qty-" + id);
  let value = parseInt(span.innerText);
  value = Math.max(0, value + delta);
  span.innerText = value;
  updateButtons();
}

function updateButtons() {
  const hasItems = MENU.some(i => {
    const el = document.getElementById("qty-" + i[0]);
    return el && parseInt(el.innerText) > 0;
  });

  document.getElementById("orderBtn").disabled = !hasItems;
  document.getElementById("waBtn").disabled = !hasItems;
}

function getSelectedItems() {
  return MENU
    .map(i => {
      const qtyEl = document.getElementById("qty-" + i[0]);
      return qtyEl && parseInt(qtyEl.innerText) > 0
        ? { foodId: i[0], foodName: i[1], qty: qtyEl.innerText }
        : null;
    })
    .filter(Boolean);
}

// Place Order
document.getElementById("orderBtn").onclick = () => {
  const items = getSelectedItems();
  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      name: name.value,
      phone: phone.value,
      items
    })
  }).then(() => {
    alert(SETTINGS.OrderConfirmation || "Order placed successfully");
    location.reload();
  });
};

// WhatsApp Order
document.getElementById("waBtn").onclick = () => {
  const items = getSelectedItems();
  const msg = items.map(i => `${i.foodName} x ${i.qty}`).join(", ");
  const text = `Order:%0A${msg}`;
  window.open(`https://wa.me/${SETTINGS.WhatsAppNumber}?text=${text}`, "_blank");
};
