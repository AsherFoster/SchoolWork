/**
 * Created by asher on 8/08/16.
 */
var info = document.getElementById('boring');
var infoTrigger = document.getElementById('toggle-boring');
var catcher = document.getElementById('click-catcher');
var triggered = false;
catcher.addEventListener("click", function(){
    info.style.right = '';
    catcher.style.display = '';
    triggered = false;
});
infoTrigger.addEventListener("click", function(){
    if(triggered){
        info.style.right = '';
        catcher.style.display = '';
    }else{
        info.style.right = '0';
        setTimeout(function(){
            catcher.style.display = 'block';
        }, 1)
    }
    triggered = !triggered;
});