/* lessons.js - tabs + collapsible lesson index for the English Sunday School lessons */
(function(){"use strict";
var body=document.body;
function $(s,r){return (r||document).querySelector(s);}
function $$(s,r){return Array.prototype.slice.call((r||document).querySelectorAll(s));}
function ready(f){if(document.readyState!=="loading"){f();}else{document.addEventListener("DOMContentLoaded",f);}}

function initTabs(){
  var tabs=$$("[data-tab]"),panels=$$("[data-panel]");
  if(!tabs.length){return;}
  function show(name,push){
    var found=false;
    tabs.forEach(function(t){var on=t.getAttribute("data-tab")===name;if(on){found=true;}});
    if(!found){name=tabs[0].getAttribute("data-tab");}
    tabs.forEach(function(t){var on=t.getAttribute("data-tab")===name;
      t.classList.toggle("active",on);t.setAttribute("aria-selected",on?"true":"false");t.tabIndex=on?0:-1;});
    panels.forEach(function(p){var on=p.getAttribute("data-panel")===name;p.hidden=!on;
      if(on){$$("iframe[data-src]",p).forEach(function(f){if(!f.getAttribute("src")){f.setAttribute("src",f.getAttribute("data-src"));}});}});
    if(push){try{window.history.replaceState(null,"","#"+name);}catch(e){}}
  }
  tabs.forEach(function(t,i){
    t.addEventListener("click",function(){show(t.getAttribute("data-tab"),true);});
    t.addEventListener("keydown",function(e){
      var k=e.key,n=null;
      if(k==="ArrowRight"){n=tabs[(i+1)%tabs.length];}else if(k==="ArrowLeft"){n=tabs[(i-1+tabs.length)%tabs.length];}
      if(n){e.preventDefault();n.focus();n.click();}});
  });
  show((window.location.hash||"").replace("#",""),false);
  window.addEventListener("hashchange",function(){show((window.location.hash||"").replace("#",""),false);});
}

function initSidebarToggle(){
  var t=$("#indexToggle"),panel=$("[data-index-panel]");
  if(!t||!panel){return;}
  function expanded(){return !body.classList.contains("index-collapsed");}
  function apply(){t.setAttribute("aria-expanded",expanded()?"true":"false");
    t.setAttribute("aria-label",expanded()?"Hide lesson index":"Show lesson index");
    panel.setAttribute("aria-hidden",expanded()?"false":"true");}
  t.addEventListener("click",function(){body.classList.toggle("index-collapsed");apply();});
  apply();
}

function initIndexFrame(){
  var f=$("[data-index-frame]");
  if(!f){return;}
  var cur=body.getAttribute("data-current-lesson")||"";
  f.setAttribute("src","lesson-index.html?active="+encodeURIComponent(cur));
}
function jumpToLesson(){
  var go=/[?&]jump=1/.test(window.location.search);
  if(!go||window.innerWidth>991){return;}
  var el=$("#lesson");if(!el){return;}
  try{if("scrollRestoration" in history){history.scrollRestoration="manual";}}catch(e){}
  function run(){var h=$("#header"),off=(h?h.offsetHeight:70)+10;
    window.scrollTo(0,Math.max(0,el.getBoundingClientRect().top+(window.pageYOffset||0)-off));}
  run();window.addEventListener("load",function(){run();setTimeout(run,300);});
}
ready(function(){initTabs();initSidebarToggle();initIndexFrame();jumpToLesson();});
})();

/* ---- phone navigation: bottom app bar for the lesson tabs (styles live in lessonbook.css) ---- */
(function(){"use strict";
var body=document.body,tabs=document.querySelector(".lesson-tabs");
if(!tabs){return;}
var mq=window.matchMedia("(max-width:767.98px)");
body.classList.add("tabs-bar");
/* short labels for small screens, long labels stay for desktop */
var SHORT={guide:"Guide",tans:"Answer Key",student:"Workbook",crafts:"Crafts",games:"Games"};
Array.prototype.forEach.call(tabs.querySelectorAll("[data-tab]"),function(b){
  if(b.querySelector(".lt-long")){return;}
  var ic=b.querySelector(".bi"),txt=b.textContent.replace(/\s+/g," ").trim();
  var lg=document.createElement("span");lg.className="lt-long";lg.textContent=txt;
  var sh=document.createElement("span");sh.className="lt-short";sh.textContent=SHORT[b.getAttribute("data-tab")]||txt;
  b.innerHTML="";if(ic){b.appendChild(ic);b.appendChild(document.createTextNode(" "));}b.appendChild(lg);b.appendChild(sh);
});

/* the bar must live directly under <body> (an animated ancestor would break position:fixed) */
var home=document.createComment("lesson-tabs");
tabs.parentNode.insertBefore(home,tabs);
function place(){
  var bar=mq.matches&&body.classList.contains("tabs-bar");
  if(bar&&tabs.parentNode!==body){body.appendChild(tabs);tabs.classList.add("is-bar");}
  else if(!bar&&tabs.parentNode===body){home.parentNode.insertBefore(tabs,home.nextSibling);tabs.classList.remove("is-bar");}
}

/* "you are viewing" label above the content */
var cur=document.createElement("div");cur.className="lt-current";cur.setAttribute("aria-live","polite");
var firstPanel=document.querySelector(".lesson-panel");
if(firstPanel){firstPanel.parentNode.insertBefore(cur,firstPanel);}
function label(){
  var b=tabs.querySelector("button.active");if(!b){return;}
  var ic=b.querySelector(".bi"),lg=b.querySelector(".lt-long");
  cur.innerHTML="";
  if(ic){var i=document.createElement("i");i.className=ic.className;i.setAttribute("aria-hidden","true");cur.appendChild(i);}
  cur.appendChild(document.createTextNode(lg?lg.textContent:b.textContent.trim()));
}
function toContent(){
  if(!mq.matches){return;}
  var t=document.querySelector(".lesson-title"),h=document.getElementById("header");
  if(!t){return;}
  var y=t.getBoundingClientRect().top+(window.pageYOffset||0)-((h?h.offsetHeight:60)+8);
  window.scrollTo({top:Math.max(0,y),behavior:"smooth"});
}
Array.prototype.forEach.call(tabs.querySelectorAll("[data-tab]"),function(b){
  b.addEventListener("click",function(){setTimeout(function(){label();toContent();},0);});
});
window.addEventListener("hashchange",function(){setTimeout(label,0);});
if(mq.addEventListener){mq.addEventListener("change",place);}else if(mq.addListener){mq.addListener(place);}
place();setTimeout(label,0);window.addEventListener("load",label);
})();
