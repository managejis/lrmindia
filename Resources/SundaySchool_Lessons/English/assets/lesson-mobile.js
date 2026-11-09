/* lesson-mobile.js - companion to lesson-mobile.css (works with the existing lessons.js tabs) */
(function(){"use strict";
var body=document.body,tabs=document.querySelector(".lesson-tabs");
if(!tabs){return;}
var mq=window.matchMedia("(max-width:767.98px)");
if(/[?&]tabs=tiles/.test(window.location.search)){body.classList.add("tabs-tiles");}else{body.classList.add("tabs-bar");}

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
