function addTransform(event){var x=event.clientX,y=event.clientY,wrapperWidth=wrapper.offsetWidth,wrapperHeight=wrapper.offsetWidth,wrapperX=x-(w-wrapperWidth)/2,wrapperPx=2*(wrapperX/wrapperWidth*100-50),wrapperY=y-(h-wrapperHeight)/2,wrapperPy=2*(wrapperY/wrapperHeight*100-50);wrapper.style.transform="rotateY("+wrapperPx/10+"deg) rotateX("+wrapperPy/-10+"deg)",document.getElementById("exposure").style.transform="translate("+wrapperPx/-7+"px, "+wrapperPy/-7+"px)",document.getElementById("bokeh1").style.transform="translate("+wrapperPx/-1+"px, "+wrapperPy/-2+"px)",document.getElementById("bokeh2").style.transform="translate("+wrapperPx/-2+"px, "+wrapperPy/-3+"px)",document.getElementById("bokeh3").style.transform="translate("+wrapperPx/-3+"px, "+wrapperPy/-4+"px)",document.getElementById("bokeh4").style.transform="translate("+wrapperPx/-4+"px, "+wrapperPy/-5+"px)"}function clearTransform(){document.getElementById("double-exposure-wrapper").style.transform="none",document.getElementById("exposure").style.transform="none",document.getElementById("bokeh1").style.transform="none",document.getElementById("bokeh2").style.transform="none",document.getElementById("bokeh3").style.transform="none",document.getElementById("bokeh4").style.transform="none"}var w=window.innerWidth,h=window.innerHeight,wrapper=document.getElementById("double-exposure-wrapper");
