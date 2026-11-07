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
ready(function(){initTabs();initSidebarToggle();initIndexFrame();});
})();
