console.log("cart page")

const cartBtn  = document.querySelector(".cart-btn");
const cartPage = document.querySelector(".cart-page");
const cartClose = document.querySelector(".cart-close")

cartBtn.addEventListener("click",()=>{
    cartPage.classList.add("show")
})
cartClose.addEventListener("click",()=>{
    cartPage.classList.remove("show")
})