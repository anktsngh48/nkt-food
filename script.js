const API = "https://script.google.com/macros/s/AKfycbxLFasUYbd-XvDHPAtgdHcf0lcyuA7TTykrxVW5u1uigyCZ8mJoZWeDuaRxHYcDY7QJ/exec";

let MENU = [];
let SETTINGS = {};
let active = false;
let orderPlaced = false;

const menuDiv = document.getElementById("menu");
const totalEl = document.getElementById("total");
const orderBtn = document.getElementById("orderBtn");
const waBtn = document.getElementById("waBtn");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");

/* ---------- LOAD SETTINGS ---------- */
fetch(API + "?action=settings")
  .then(r => r.json())
  .then(s => {
    SETTINGS = s;
    if (s.PageTitle) {
      document.getElementById("pageTitle").innerText = s.PageTitle;
    }
  });

/* ---------- LOAD MENU ---------- */
fetch(API + "?action=menu")
  .then(r => r.json())
  .then(data => {
    MENU = data;
    renderMenu();
    update();
  });

/* ---------- RENDER MENU ---------- */
function renderMenu() {
  menuDiv.innerHTML = "";

  MENU.forEach(item => {
    const id = item[0];
    const name = item[1];
    const price = Number(item[3]);
    const soldOut = item[4] === "Sold Out";

    menuDiv.innerHTML += `
      <div class="item">
        <div class="left">
          <div class="name">${name}</div>
        </div>

        <div class="price">₹${price}</div>

        ${
          soldOut
            ? `<div class="sold">Sold Out</div>`
            : `<div class="qty">
                 <button onclick="changeQty(${id}, -1)">−</button>
                 <span id="qty-${id}">0</span>
                 <button onclick="changeQty(${id}, 1)">+</button>
               </div>`
        }
      </div>
    `;
  });
}

/* ---------- QTY CHANGE ---------- */
function changeQty(id, delta) {
  if (orderPlaced) return;

  const span = document.getElementById("qty-" + id);
  let val = Number(span.innerText);
  val = Math.max(0, val + delta);
  span.innerText = val;
  update();
}

/* ---------- UPDATE TOTAL & BUTTON STATE ---------- */
function update() {
  if (orderPlaced) return;

  let total = 0;
  let hasItems = false;

  MENU.forEach(item => {
    const price = Number(item[3]);
    const span = document.getElementById("qty-" + item[0]);

    if (span) {
      const qty = Number(span.innerText);
      if (qty > 0) {
        total += qty * price;
        hasItems = true;
      }
    }
  });

  totalEl.innerText = total;

  const nameOk = nameInput.value.trim().length > 0;
  const phoneOk = /^\d+$/.test(phoneInput.value.trim());

  active = hasItems && nameOk && phoneOk;

  orderBtn.classList.toggle("inactive", !active);
  waBtn.classList.toggle("inactive", !active);
}

/* ---------- INPUT LISTENERS ---------- */
nameInput.addEventListener("input", update);
phoneInput.addEventListener("input", update);

/* ---------- SELECTED ITEMS ---------- */
function getSelectedItems() {
  return MENU.map(item => {
    const span = document.getElementById("qty-" + item[0]);
    if (span && Number(span.innerText) > 0) {
      return {
        foodId: item[0],
        foodName: item[1],
        qty: Number(span.innerText)
      };
    }
    return null;
  }).filter(Boolean);
}

/* ---------- PLACE ORDER ---------- */
orderBtn.onclick = () => {
  if (!active || orderPlaced) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
      items: getSelectedItems(),
      total: Number(totalEl.innerText)
    })
  }).then(() => {
    orderPlaced = true;

    // 🔒 Lock UI
    orderBtn.innerText = "Order Placed";
    orderBtn.classList.remove("primary");
    orderBtn.classList.add("inactive");

    waBtn.classList.add("inactive");

    document.querySelectorAll(".qty button").forEach(b => b.disabled = true);
    nameInput.disabled = true;
    phoneInput.disabled = true;
  });
};

/* ---------- WHATSAPP ORDER ---------- */
waBtn.onclick = () => {
  if (!active || orderPlaced) return;

  const items = getSelectedItems()
    .map(i => `${i.foodName} x ${i.qty}`)
    .join(", ");

  const msg = `${items}\nTotal: ₹${totalEl.innerText}`;

  window.open(
    `https://wa.me/${SETTINGS.WhatsAppNumber}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
};
