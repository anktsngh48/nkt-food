const API = "https://script.google.com/macros/s/AKfycbwtFI3cxa3w1kqDihF_4eCMdqZKFiy7jJS4HBwpFKS3G67Y_m0jI2ZweCX7zbrOqTKL/exec";

let MENU = [];
let SETTINGS = {};

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
    menu.innerHTML = "<p style='text-align:center;color:red'>Failed to load menu</p>";
  });

function renderMenu() {
  menu.innerHTML = "";

  MENU.forEach(item => {
    const id = item[0];
    const name = item[1];
    const price = item[3];
    const soldOut = item[4] === "Sold Out";

    menu.innerHTML += `
      <div class="item">
        <div class="left">
          <div class="name">${name}</div>
          <div class="price">₹${price}</div>
          ${soldOut ? `<div class="sold">Sold Out</div>` : ""}
        </div>

        ${soldOut ? "" : `
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
  let val = parseInt(span.innerText);
  val = Math.max(0, val + delta);
  span.innerText = val;
  updateButtons();
}

function updateButtons() {
  const hasItems = MENU.some(i => {
    const el = document.getElementById("qty-" + i[0]);
    return el && parseInt(el.innerText) > 0;
  });

  orderBtn.disabled = !hasItems;
  waBtn.disabled = !hasItems;
}

function getSelectedItems() {
  return MENU.map(i => {
    const q = document.getElementById("qty-" + i[0]);
    return q && parseInt(q.innerText) > 0
      ? { foodId: i[0], foodName: i[1], qty: q.innerText }
      : null;
  }).filter(Boolean);
}

function validateCustomer() {
  if (!name.value.trim() || !phone.value.trim()) {
    alert("Please enter your name and phone number");
    return false;
  }

  if (!/^\d+$/.test(phone.value)) {
    alert("Phone number must contain only digits");
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

  const items = getSelectedItems();
  const msg = items.map(i => `${i.foodName} x ${i.qty}`).join(", ");
  window.open(
    `https://wa.me/${SETTINGS.WhatsAppNumber}?text=${encodeURIComponent(msg)}`,
    "_blank"
  );
};
