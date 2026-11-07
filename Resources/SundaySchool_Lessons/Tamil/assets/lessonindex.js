(function(){"use strict";
var p=new URLSearchParams(window.location.search),active=p.get("active");
Array.prototype.forEach.call(document.querySelectorAll("#list a"),function(a){
  if(active&&a.getAttribute("data-lesson")===active){a.classList.add("active");a.setAttribute("aria-current","page");}});
var q=document.getElementById("q"),empty=document.getElementById("empty");
q.addEventListener("input",function(){var s=q.value.trim().toLowerCase(),n=0;
  Array.prototype.forEach.call(document.querySelectorAll("#list li"),function(li){
    var show=!s||(li.getAttribute("data-search")||"").indexOf(s)!==-1;li.style.display=show?"":"none";if(show){n++;}});
  empty.hidden=n!==0;});
var act=document.querySelector("#list a.active");
if(act&&act.scrollIntoView){act.scrollIntoView({block:"center"});}
})();
