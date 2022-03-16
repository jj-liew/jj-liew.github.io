$(function() {
    $(window).scroll(function () {
       if ($(this).scrollTop() > 500) {
          $('body').addClass('changeColor')
       } else {
          $('body').removeClass('changeColor')
       }
       if ($(this).scrollTop() > 1300) {
        $('body').addClass('changeColor2')
     } else {
        $('body').removeClass('changeColor2')
     }
    });
 });