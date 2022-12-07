history.scrollRestoration = "manual";

window.onload = () => {
    const navs = document.querySelectorAll('.nav a');
    const menus = document.querySelectorAll('#menu a');
    const buttons = document.querySelectorAll(".buttons");
    const homeButton = document.querySelector(".about");
    const tran = document.querySelector('.transition');
    window.scrollTo(0, 0);
  
    setTimeout(() => {
      tran.classList.remove('is-active');
    }, 400);
  
    for (let i = 0; i < navs.length; i++) {
      const nav = navs[i];
  
      nav.addEventListener('click', e => {
        e.preventDefault();
        let target = e.target.href;
  
        tran.classList.add('is-active');
  
        setTimeout(() => {
          window.location.href = target;
        }, 400);
      })
    }
    for (let i = 0; i < menus.length; i++) {
        const menu = menus[i];
    
        menu.addEventListener('click', f => {
          f.preventDefault();
          let target = f.target.href;
    
          tran.classList.add('is-active');
    
          setTimeout(() => {
            window.location.href = target;
          }, 400);
        })
      }

    for (let i = 0; i < buttons.length; i++) {
      const button = buttons[i];
  
      button.addEventListener('click', g => {
        g.preventDefault();
        let target = g.target.href;
  
        tran.classList.add('is-active');
  
        setTimeout(() => {
          window.location.href = target;
        }, 400);
      })
    }

    if (homeButton != null) {
      homeButton.addEventListener('click', h => {
        h.preventDefault();
        let target = h.target.href;

        tran.classList.add('is-active');

        setTimeout(() => {
          window.location.href = target;
        }, 400);
      })
    }
  }