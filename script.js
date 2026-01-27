const API = "https://script.google.com/macros/s/AKfycbwtFI3cxa3w1kqDihF_4eCMdqZKFiy7jJS4HBwpFKS3G67Y_m0jI2ZweCX7zbrOqTKL/exec";

let MENU = [];
let SETTINGS = {};
let isActive = false;

const menuDiv = document.getElementById("menu");
const orderBtn = document.getElementById("orderBtn");
const waBtn = document.getElementById("waBtn");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");

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
  })
  .catch(() => {
    menuDiv.innerHTML =
      "<p style='text-align:center;color:red'>Failed to load menu</p>";
  });

function renderMenu() {
  menuDiv.innerHTML = "";

  MENU.forEach(item => {
    const id = item[0];
    const name = item[1];
    const price = item[3];
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
                 <button onclick="changeQty(${id},-1)">−</button>
                 <span id="qty-${id}">0</span>
                 <button onclick="changeQty(${id},1)">+</button>
               </div>`
        }
      </div>
    `;
  });
}

function changeQty(id, delta) {
  const span = document.getElementById("qty-" + id);
  let val = parseInt(span.innerText, 10);
  val = Math.max(0, val + delta);
  span.innerText = val;
  updateButtons();
}

function updateButtons() {
  const hasItems = MENU.some(i => {
    const el = document.getElementById("qty-" + i[0]);
    return el && parseInt(el.innerText, 10) > 0;
  });

  const nameOk = nameInput.value.trim().length > 0;
  const phoneOk = /^\d+$/.test(phoneInput.value.trim());

  isActive = hasItems && nameOk && phoneOk;

  orderBtn.classList.toggle("inactive", !isActive);
  waBtn.classList.toggle("inactive", !isActive);
}

function getSelectedItems() {
  return MENU.map(i => {
    const q = document.getElementById("qty-" + i[0]);
    return q && parseInt(q.innerText, 10) > 0
      ? { foodId: i[0], foodName: i[1], qty: q.innerText }
      : null;
  }).filter(Boolean);
}

// React to input changes
nameInput.addEventListener("input", updateButtons);
phoneInput.addEventListener("input", updateButtons);

// Place order
orderBtn.onclick = () => {
  if (!isActive) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      name: nameInput.value,
      phone: phoneInput.value,
      items: getSelectedItems()
    })
  }).then(() => {
    alert(SETTINGS.OrderConfirmation || "Order placed successfully");
    location.reload();
  });
};

// WhatsApp order
waBtn.onclick = () => {
  if (!isActive) return;

  const msg = getSelectedItems()
    .map(i => `${i.foodName} x ${i.qty}`)
    .join(", ");

  window.open(
    `https://wa.me/${SETTINGS.WhatsAppNumber}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
};
