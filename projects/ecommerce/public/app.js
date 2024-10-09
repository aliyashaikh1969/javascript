const videoBtn = document.querySelector("#video-btn");
const video = document.querySelector('.video');

videoBtn.addEventListener("click", () => {
    videoBtn.classList.toggle("play")
    if(videoBtn.classList.contains("play")){
        video.play()
    }else{
        video.pause()
    }
});

var swiper = new Swiper(".mySwiper", {
  slidesPerView: 1,
  spaceBetween: 10,
  navigation: {
    nextEl: ".swiper-button-next",
    prevEl: ".swiper-button-prev",
  },
  breakpoints: {
    0: {
      slidesPerView: 1,
    },
    768: {
      slidesPerView: 3,
    },
    1020: {
      slidesPerView: 4,
    },
  },
});
