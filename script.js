const API = "https://script.google.com/macros/s/AKfycbxLFasUYbd-XvDHPAtgdHcf0lcyuA7TTykrxVW5u1uigyCZ8mJoZWeDuaRxHYcDY7QJ/exec";

let MENU=[], SETTINGS={}, active=false;

const totalEl = document.getElementById("total");
const orderBtn = document.getElementById("orderBtn");
const waBtn = document.getElementById("waBtn");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");

fetch(API+"?action=settings").then(r=>r.json()).then(s=>{
  SETTINGS=s;
  if(s.PageTitle) pageTitle.innerText=s.PageTitle;
});

fetch(API+"?action=menu").then(r=>r.json()).then(d=>{
  MENU=d;
  render();
});

function render(){
  menu.innerHTML='';
  MENU.forEach(i=>{
    const sold=i[4]==="Sold Out";
    menu.innerHTML+=`
    <div class="item">
      <div class="left"><div class="name">${i[1]}</div></div>
      <div class="price">₹${i[3]}</div>
      ${
        sold
        ? `<div class="sold">Sold Out</div>`
        : `<div class="qty">
             <button onclick="chg(${i[0]},-1)">−</button>
             <span id="q${i[0]}">0</span>
             <button onclick="chg(${i[0]},1)">+</button>
           </div>`
      }
    </div>`;
  });
}

function chg(id,d){
  const v=document.getElementById("q"+id);
  v.innerText=Math.max(0,+v.innerText+d);
  update();
}

function update(){
  let total=0;
  let hasQty=false;

  MENU.forEach(i=>{
    const q=document.getElementById("q"+i[0]);
    if(q){
      const qty=+q.innerText;
      if(qty>0){
        total+=qty*i[3];
        hasQty=true;
      }
    }
  });

  totalEl.innerText=total;

  active = hasQty &&
           nameInput.value.trim() &&
           /^\d+$/.test(phoneInput.value);

  orderBtn.classList.toggle("inactive",!active);
  waBtn.classList.toggle("inactive",!active);
}

nameInput.oninput=update;
phoneInput.oninput=update;

function items(){
  return MENU.map(i=>{
    const q=document.getElementById("q"+i[0]);
    return q&&+q.innerText>0
      ? {foodId:i[0],foodName:i[1],qty:q.innerText}
      : null;
  }).filter(Boolean);
}

orderBtn.onclick=()=>{
  if(!active) return;
  fetch(API,{
    method:"POST",
    body:JSON.stringify({
      name:nameInput.value,
      phone:phoneInput.value,
      items:items(),
      total:+totalEl.innerText
    })
  }).then(()=>alert(SETTINGS.OrderConfirmation||"Order placed"));
};

waBtn.onclick=()=>{
  if(!active) return;
  const msg=items().map(i=>`${i.foodName} x ${i.qty}`).join(", ");
  window.open(`https://wa.me/${SETTINGS.WhatsAppNumber}?text=${encodeURIComponent(msg+"\nTotal: ₹"+totalEl.innerText)}`);
};
