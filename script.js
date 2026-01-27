// ===== CONFIG =====
m.innerHTML = '';


MENU.forEach(i => {
const sold = i[4] === 'Sold Out';


m.innerHTML += `
<div class="item">
<div class="name">${i[1]}</div>
<div class="price">₹${i[3]}</div>


<div class="qty">
<button onclick="changeQty(${i[0]}, -1)" ${sold ? 'disabled' : ''}>−</button>
<span id="q${i[0]}">0</span>
<button onclick="changeQty(${i[0]}, 1)" ${sold ? 'disabled' : ''}>+</button>
</div>


${sold ? '<div class="sold">Sold Out</div>' : ''}
</div>
`;
});
}


// ===== CHANGE QTY =====
function changeQty(id, delta) {
const el = document.getElementById('q' + id);
el.innerText = Math.max(0, +el.innerText + delta);
validateSubmit();
}


// ===== ENABLE / DISABLE SUBMIT =====
function validateSubmit() {
const anySelected = MENU.some(i => +document.getElementById('q' + i[0]).innerText > 0);
document.getElementById('submitBtn').disabled = !anySelected;
}


// ===== GET SELECTED ITEMS =====
function getSelectedItems() {
return MENU
.filter(i => +document.getElementById('q' + i[0]).innerText > 0)
.map(i => ({
foodId: i[0],
foodName: i[1],
qty: +document.getElementById('q' + i[0]).innerText
}));
}


// ===== SUBMIT ORDER (WEBSITE) =====
function submitOrder() {
fetch(API, {
method: 'POST',
body: JSON.stringify({
name: document.getElementById('name').value,
phone: document.getElementById('phone').value,
items: getSelectedItems()
})
}).then(() => alert(SETTINGS.OrderConfirmation || 'Order placed'));
}


// ===== WHATSAPP ORDER =====
function orderWhatsApp() {
const msg = getSelectedItems()
.map(i => `${i.foodName} x ${i.qty}`)
.join(', ');


window.open(`https://wa.me/${SETTINGS.WhatsAppNumber}?text=${encodeURIComponent(msg)}`);
}
