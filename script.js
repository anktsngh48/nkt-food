const API = "https://script.google.com/macros/s/AKfycbxLFasUYbd-XvDHPAtgdHcf0lcyuA7TTykrxVW5u1uigyCZ8mJoZWeDuaRxHYcDY7QJ/exec";

let MENU = [];
let SETTINGS = {};
let active = false;
let orderPlaced = false;

const menuDiv = document.getElementById("menu");
const totalEl = document.getElementById("total");
const pinInput = document.getElementById("adminPin");
const orderBtn = document.getElementById("orderBtn");
const waBtn = document.getElementById("waBtn");
const nameInput = document.getElementById("name");
const phoneInput = document.getElementById("phone");

/* SETTINGS */
fetch(API+"?action=settings").then(r=>r.json()).then(s=>{
  SETTINGS=s;
  if(s.PageTitle) pageTitle.innerText=s.PageTitle;
});

/* MENU */
fetch(API+"?action=menu").then(r=>r.json()).then(d=>{
  MENU=d;
  render();
  update();
});

function render(){
  menuDiv.innerHTML='';
  MENU.forEach(i=>{
    const sold=i[4]==="Sold Out";
    menuDiv.innerHTML+=`
      <div class="item">
        <div class="left"><div class="name">${i[1]}</div></div>
        <div class="price">₹${Number(i[3])}</div>
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
  if(orderPlaced) return;
  const v=document.getElementById("q"+id);
  v.innerText=Math.max(0,Number(v.innerText)+d);
  update();
}

function update(){
  if(orderPlaced) return;

  let total=0, has=false;
  MENU.forEach(i=>{
    const q=document.getElementById("q"+i[0]);
    if(q){
      const qty=Number(q.innerText);
      if(qty>0){
        total+=qty*Number(i[3]);
        has=true;
      }
    }
  });

  totalEl.innerText=total;

  active =
    has &&
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
    return q&&Number(q.innerText)>0
      ? {foodId:i[0],foodName:i[1],qty:Number(q.innerText)}
      : null;
  }).filter(Boolean);
}

/* PLACE ORDER */
orderBtn.onclick=()=>{
  if(!active||orderPlaced) return;

  fetch(API,{
    method:"POST",
    body:JSON.stringify({
      name:nameInput.value.trim(),
      phone:phoneInput.value.trim(),
      items:items(),
      total:Number(totalEl.innerText)
    })
  }).then(()=>{
    orderPlaced=true;
    orderBtn.innerText="Order Placed";
    orderBtn.classList.add("inactive");
    waBtn.classList.add("inactive");
    document.querySelectorAll(".qty button").forEach(b=>b.disabled=true);
    nameInput.disabled=true;
    phoneInput.disabled=true;
  });
};

/* WHATSAPP */
waBtn.onclick=()=>{
  if(!active||orderPlaced) return;
  const msg=items().map(i=>`${i.foodName} x ${i.qty}`).join(", ");
  window.open(
    `https://wa.me/${SETTINGS.WhatsAppNumber}?text=${encodeURIComponent(msg+"\nTotal: ₹"+totalEl.innerText)}`,
    "_blank"
  );
};

/* 🔐 ADMIN TOTAL TAP */
totalEl.onclick=()=>{
  pinInput.value="";
  pinInput.focus();
};

pinInput.onchange=()=>{
  if(pinInput.value===String(SETTINGS.AdminPassword)){
    window.location.href="https://anktsngh48.github.io/nkt-edit-sheet";
  }
  pinInput.value="";
};
