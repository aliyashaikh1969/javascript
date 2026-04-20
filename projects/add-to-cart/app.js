console.log("cart page")

const cartBtn = document.querySelector("header .cart-btn");
const cartPage = document.querySelector(".cart-page");
const cartClose = document.querySelector(".cart-close")

const productList = document.querySelector(".product-list");
const cartCount = document.querySelector(".cart-count")

const productDetails = document.querySelector(".product-details table tbody")

updateCartCount()

cartBtn.addEventListener("click", () => {
    cartPage.classList.toggle("show")
    cartPageUpdate()
})
cartClose.addEventListener("click", () => {
    cartPage.classList.remove("show")
})


async function getProduct() {
    try {
        let response = await fetch("http://localhost:3000/posts");
        let data = await response.json();

        addProducts(data)
    } catch (error) {
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

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(p => p.id === item.id);

    if (existing) {
        existing.quantity += 1
    } else {
        cart.push({ ...item })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()


    alert("product added successfully");
}





function cartPageUpdate() {
    productDetails.innerHTML = ""

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    cart.forEach(item => {
        let tr = document.createElement("tr");
        tr.innerHTML = ` <tr>
              <td>
                <div class="product">
                  <img src="${item.image}" class="pImage" alt="" />

                  <div class="img-det">
                    <p>${item.name}</p>
                    <span>${item.keyPoints}</span>
                  </div>
                </div>
              </td>

              <td>
                <div class="quen">
                  <button class="add">+</button>
                  <span>${item.quantity}</span>
                  <button class="min">-</button>
                </div>
              </td>
              <td>
                <p class="prize">${item.price * item.quantity}</p>
              </td>

              <td>
                <button class="actions">
                  <i class="fas fa solid fa-trash"></i>
                </button>
              </td>
            </tr>`

        tr.querySelector(".actions").addEventListener('click', () => deleteItem(item))
        tr.querySelector(".add").addEventListener('click', () => increasedQuantity(item))
        tr.querySelector(".min").addEventListener('click', () => decreasedQuantity(item))
        productDetails.appendChild(tr)
    })
    updateCartCount()

}

function increasedQuantity(item) {
    let cart = JSON.parse(localStorage.getItem("cart"));
    let product = cart.find(p => item.id == p.id)
    if (product) {
        product.quantity += 1
    }
    localStorage.setItem("cart", JSON.stringify(cart))
    cartPageUpdate()

}

function decreasedQuantity(item) {
    console.log("decreased")
    let cart = JSON.parse(localStorage.getItem("cart"));
    let product = cart.find(p => item.id == p.id)
    console.log(product)
    if (product) {
        if (product.quantity > 1) {
            product.quantity--;
            console.log(product.quantity)
        } else {
            cart = cart.filter(cart => product.id != cart.id);

            console.log("dele")
        }
    }
    localStorage.setItem("cart", JSON.stringify(cart))

    cartPageUpdate()


}
function deleteItem(item) {
    let cart = JSON.parse(localStorage.getItem("cart"));
    cart = cart.filter(cart => item.id != cart.id);

    localStorage.setItem('cart', JSON.stringify(cart));
    cartPageUpdate()
}



function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || []
    let count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count
}