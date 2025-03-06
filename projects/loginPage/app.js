console.log("login page")

const container = document.querySelector(".container");
const signUpBtn = document.querySelector(".sign-up-btn")
const signInBtn = document.querySelector(".sign-in-btn")

console.log(signInBtn)

signUpBtn.addEventListener("click",()=>{
    container.classList.add("active")
})

signInBtn.addEventListener("click",()=>{
    container.classList.remove("active")
})

