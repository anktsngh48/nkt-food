const API = 'https://script.google.com/macros/s/AKfycbzmk7QwPVgkQLqOoclWo4wMSOI2yzKbc-tpVfxn-rB9sb_ZxDeQBVMvfyU72uyQXjih/exec';


fetch(`${API}?action=menu`)
.then(res => res.json())
.then(showMenu);


function showMenu(items) {
const div = document.getElementById('menu');
items.forEach(i => {
const el = document.createElement('div');
el.innerHTML = `
<b>${i[1]}</b> (₹${i[3]})<br>
<input placeholder="Name" id="n${i[0]}">
<input placeholder="Phone" id="p${i[0]}">
<input type="number" placeholder="Qty" id="q${i[0]}">
<button onclick="order(${i[0]}, '${i[1]}')">Order</button>
<button onclick="whatsapp('${i[1]}')">WhatsApp</button>
<hr>
`;
div.appendChild(el);
});
}


function order(id, name) {
fetch(API, {
method: 'POST',
body: JSON.stringify({
foodId: id,
foodName: name,
name: document.getElementById('n'+id).value,
phone: document.getElementById('p'+id).value,
qty: document.getElementById('q'+id).value
})
}).then(() => alert('Order placed'));
}


function whatsapp(food) {
fetch(`${API}?action=whatsapp`)
.then(res => res.json())
.then(d => window.open(`https://wa.me/${d.number}?text=Order for ${food}`));
}
