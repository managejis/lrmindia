(function(){"use strict";
var p=new URLSearchParams(window.location.search),active=p.get("active");
Array.prototype.forEach.call(document.querySelectorAll("#list a"),function(a){
  if(active&&a.getAttribute("data-lesson")===active){a.classList.add("active");a.setAttribute("aria-current","page");}});
var q=document.getElementById("q"),empty=document.getElementById("empty");
q.addEventListener("input",function(){var s=q.value.trim().toLowerCase(),n=0;
  Array.prototype.forEach.call(document.querySelectorAll("#list li"),function(li){
    var show=!s||(li.getAttribute("data-search")||"").indexOf(s)!==-1;li.style.display=show?"":"none";if(show){n++;}});
  empty.hidden=n!==0;});
/* Centre the active lesson inside the list only. scrollIntoView() also scrolls the parent page
   (the list lives in an iframe), which threw the phone page down to the index on every click. */
var act=document.querySelector("#list a.active");
function scrollable(el){while(el&&el!==document.body&&el!==document.documentElement){
  var o=getComputedStyle(el).overflowY;if((o==="auto"||o==="scroll")&&el.scrollHeight>el.clientHeight){return el;}el=el.parentElement;}return null;}
if(act){var sc=scrollable(act),r=act.getBoundingClientRect();
  if(sc){var cr=sc.getBoundingClientRect();sc.scrollTop+=r.top-cr.top-(sc.clientHeight-r.height)/2;}
  else{window.scrollTo(0,Math.max(0,r.top+(window.pageYOffset||0)-(window.innerHeight-r.height)/2));}}
/* On phones the index sits below the lesson: remember the tap so the lesson page opens at its content */
Array.prototype.forEach.call(document.querySelectorAll("#list a[data-lesson]"),function(a){
  a.addEventListener("click",function(){var h=a.getAttribute("href");if(h&&h.indexOf("jump=1")===-1){a.setAttribute("href",h.split("#")[0].split("?")[0]+"?jump=1");}});});
})();
