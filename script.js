const API = "https://script.google.com/macros/s/AKfycbwtFI3cxa3w1kqDihF_4eCMdqZKFiy7jJS4HBwpFKS3G67Y_m0jI2ZweCX7zbrOqTKL/exec";

let MENU = [];
let SETTINGS = {};

const menuDiv = document.getElementById("menu");
const orderBtn = document.getElementById("orderBtn");
const waBtn = document.getElementById("waBtn");

// SETTINGS
fetch(API + "?action=settings")
  .then(r => r.json())
  .then(s => {
    SETTINGS = s;
    if (s.PageTitle) {
      pageTitle.innerText = s.PageTitle;
    }
  });

// MENU
fetch(API + "?action=menu")
  .then(r => r.json())
  .then(data => {
    MENU = data;
    renderMenu();
  })
  .catch(() => {
    menuDiv.innerHTML = "<p style='text-align:center;color:red'>Failed to load menu</p>";
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

        ${soldOut ? `<div class="sold">Sold Out</div>` : `
          <div class="qty">
            <button onclick="changeQty(${id},-1)">−</button>
            <span id="qty-${id}">0</span>
            <button onclick="changeQty(${id},1)">+</button>
          </div>
        `}
      </div>
    `;
  });
}

function changeQty(id, delta) {
  const span = document.getElementById("qty-" + id);
  let value = parseInt(span.innerText, 10);
  value = Math.max(0, value + delta);
  span.innerText = value;
  updateButtons();
}

function updateButtons() {
  const hasItems = MENU.some(i => {
    const el = document.getElementById("qty-" + i[0]);
    return el && parseInt(el.innerText, 10) > 0;
  });

  orderBtn.classList.toggle("inactive", !hasItems);
  waBtn.classList.toggle("inactive", !hasItems);
}

function getSelectedItems() {
  return MENU.map(i => {
    const q = document.getElementById("qty-" + i[0]);
    return q && parseInt(q.innerText, 10) > 0
      ? { foodId: i[0], foodName: i[1], qty: q.innerText }
      : null;
  }).filter(Boolean);
}

function validateCustomer() {
  const nameVal = name.value.trim();
  const phoneVal = phone.value.trim();

  if (!nameVal || !phoneVal) {
    alert("Please enter your name and phone number");
    return false;
  }

  if (!/^\d+$/.test(phoneVal)) {
    alert("Phone number must contain only digits");
    return false;
  }

  if (getSelectedItems().length === 0) {
    alert("Please select at least one item");
    return false;
  }

  return true;
}

// PLACE ORDER
orderBtn.onclick = () => {
  if (!validateCustomer()) return;

  fetch(API, {
    method: "POST",
    body: JSON.stringify({
      name: name.value,
      phone: phone.value,
      items: getSelectedItems()
    })
  }).then(() => {
    alert(SETTINGS.OrderConfirmation || "Order placed successfully");
    location.reload();
  });
};

// WHATSAPP
waBtn.onclick = () => {
  if (!validateCustomer()) return;

  const msg = getSelectedItems()
    .map(i => `${i.foodName} x ${i.qty}`)
    .join(", ");

  window.open(
    `https://wa.me/${SETTINGS.WhatsAppNumber}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
};
