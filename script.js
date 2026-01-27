const API = 'https://script.google.com/macros/s/AKfycbx4Fz1hHfvZVu8FSJdIXjZFfDIi8ilpyNL1g3xpC6k_x8kMWvfGnuw9hqigsPFtkmHf/exec';
let MENU=[], SETTINGS={};


fetch(`${API}?action=settings`).then(r=>r.json()).then(s=>{
SETTINGS=s;
title.innerText=s.PageTitle;
topImg.src=s.TopImage||'';
bottomImg.src=s.BottomImage||'';
});


fetch(`${API}?action=menu`).then(r=>r.json()).then(d=>{MENU=d;render();});


function render(){
menu.innerHTML='';
MENU.forEach(i=>{
const sold=i[4]==='Sold Out';
menu.innerHTML+=`
<div class="item">
<label><input type="checkbox" ${sold?'disabled':''} onchange="toggle(${i[0]})"> ${i[1]} (₹${i[3]})</label>
${sold?'<div class="sold">Sold Out</div>':''}
<div class="qty" id="q${i[0]}" style="display:none">
<button onclick="chg(${i[0]},-1)">-</button>
<span id="v${i[0]}">1</span>
<button onclick="chg(${i[0]},1)">+</button>
</div>
</div>`;
});
}


function toggle(id){
const q=document.getElementById('q'+id);
q.style.display=q.style.display==='none'?'flex':'none';
checkSubmit();
}


function chg(id,d){
const v=document.getElementById('v'+id);
v.innerText=Math.max(1,+v.innerText+d);
}


function checkSubmit(){
submitBtn.disabled=!MENU.some(i=>document.getElementById('q'+i[0])?.style.display==='flex');
}


function getItems(){
return MENU.filter(i=>document.getElementById('q'+i[0])?.style.display==='flex')
.map(i=>({foodId:i[0],foodName:i[1],qty:document.getElementById('v'+i[0]).innerText}));
}


function submitOrder(){
fetch(API,{method:'POST',body:JSON.stringify({
name:name.value,phone:phone.value,items:getItems()
})}).then(()=>alert(SETTINGS.OrderConfirmation));
}


function orderWhatsApp(){
const msg=getItems().map(i=>`${i.foodName} x ${i.qty}`).join(', ');
window.open(`https://wa.me/${SETTINGS.WhatsAppNumber}?text=${encodeURIComponent(msg)}`);
}
