console.log("cart page")

const cartBtn = document.querySelector(".cart-btn");
const cartPage = document.querySelector(".cart-page");
const cartClose = document.querySelector(".cart-close")

const productList = document.querySelector(".product-list");
const cartCount = document.querySelector(".cart-count")

console.log(cartCount)
updateCartCount()


cartBtn.addEventListener("click", () => {
    cartPage.classList.add("show")
})
cartClose.addEventListener("click", () => {
    cartPage.classList.remove("show")
})

async function getProduct() {
    try {
        let response = await fetch("http://localhost:3000/posts");
        let data = await response.json();

        addProducts(data)
    } catch(error) {
        console.log("error", error)
    }
}

function addProducts(data) {
    if (data) {
        productList.innerHTML = ""
        data.forEach(item => {

            let card = document.createElement("div")
            card.classList.add("product-item")
            card.innerHTML = ` <img src="${item.image}" alt="" />
                                <div class="cart-card">
                                    <span class="cart-btn">
                                        <i class="fa-solid fa-cart-shopping icons"></i>
                                    </span>
                                </div>`
            productList.appendChild(card)
            card.querySelector(".cart-card").addEventListener("click", () => {
                addToCart(item);
            });
        });
    }
}

getProduct()

function addToCart(item) {

    console.log(item)
    let cart =JSON.parse(localStorage.getItem("cart")) ||[];
    
    const existing = cart.find(p => p.id === item.id);
    
    if(existing){
        existing.quantity += 1
    }else{
        cart.push({...item})   
    }
    
    localStorage.setItem("cart" ,JSON.stringify(cart))
    updateCartCount()
    
   
    alert("product added successfully");
}



function updateCartCount(){

   let cart = JSON.parse(localStorage.getItem("cart")) || []
   let count = cart.reduce((sum,item)=>sum+item.quantity,0);
   cartCount.textContent = count
   console.log(count)

}