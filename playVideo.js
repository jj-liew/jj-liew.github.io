window.onload = () => {
    const video = document.getElementById("#video");
    
    const button = document.getElementById("#playIcon");
    
}

function playPause() { 
    if (video.paused) 
        video.play(); 
    else 
        video.pause(); 
  }