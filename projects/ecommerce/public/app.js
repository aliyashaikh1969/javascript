const videoBtn = document.querySelector("#video-btn");
const video = document.querySelector(".video");
const userIcon = document.querySelector(".user");

videoBtn.addEventListener("click", () => {
  videoBtn.classList.toggle("play");
  if (videoBtn.classList.contains("play")) {
    video.play();
  } else {
    video.pause();
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

userIcon.addEventListener("click", () => userIcon.classList.toggle("show"));

let text = userIcon.querySelector("p");
let actionBtn = userIcon.querySelector("a");

let user = JSON.parse(sessionStorage.user || null);

if (user != null) {
  text.innerHTML = `login as ${user.name}`;
  actionBtn.innerHTML = "log out";
  actionBtn.addEventListener("click", () => logout());
} else {
  text.innerHTML = "login here";
  actionBtn.innerHTML = "login";
  actionBtn.addEventListener("click", () => (location.href = "/login"));
}

const logout = () => {
  sessionStorage.clear();
  location.reload();
};

console.log(user);
