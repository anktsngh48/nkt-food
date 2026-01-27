const API = 'https://script.google.com/macros/s/AKfycbzmk7QwPVgkQLqOoclWo4wMSOI2yzKbc-tpVfxn-rB9sb_ZxDeQBVMvfyU72uyQXjih/exec';
let MENU = [];
window.whatsappNumber = s.WhatsAppNumber;
});


fetch(`${API}?action=menu`).then(r=>r.json()).then(d=>{
MENU = d;
render();
});


function render() {
const m = document.getElementById('menu');
m.innerHTML = '';
MENU.forEach(i => {
const sold = i[4] === 'Sold Out';
m.innerHTML += `
<div class="item">
<label>
<input type="checkbox" ${sold?'disabled':''} onchange="toggleQty(${i[0]})"> ${i[1]} (₹${i[3]})
</label>
${sold ? '<div class="sold">Sold Out</div>' : ''}
<div class="qty" id="q${i[0]}" style="display:none">
<button onclick="chg(${i[0]},-1)">-</button>
<span id="v${i[0]}">1</span>
<button onclick="chg(${i[0]},1)">+</button>
</div>
</div>`;
});
}


function toggleQty(id) {
const q = document.getElementById('q'+id);
q.style.display = q.style.display === 'none' ? 'flex' : 'none';
}


function chg(id, d) {
const v = document.getElementById('v'+id);
let n = Math.max(1, parseInt(v.innerText) + d);
v.innerText = n;
}


function submitOrder() {
const items = [];
MENU.forEach(i => {
const q = document.getElementById('q'+i[0]);
if (q && q.style.display === 'flex') {
items.push({ foodId:i[0], foodName:i[1], qty:document.getElementById('v'+i[0]).innerText });
}
});
fetch(API,{method:'POST',body:JSON.stringify({
name:document.getElementById('name').value,
phone:document.getElementById('phone').value,
items
})}).then(()=>alert('Order placed'));
}


function orderWhatsApp() {
window.open(`https://wa.me/${window.whatsappNumber}`);
}
