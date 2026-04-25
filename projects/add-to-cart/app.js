console.log("cart page")

const cartBtn = document.querySelector("header .cart-btn");
const cartPage = document.querySelector(".cart-page");
const cartClose = document.querySelector(".cart-close")

const productList = document.querySelector(".product-list");
const cartCount = document.querySelector(".cart-count")

const productDetails = document.querySelector(".product-details table tbody")
const cartItems = document.querySelector(".cart-page .cart-items")
const subTotal = document.querySelector(".s-total");
const discount = document.querySelector(".discount");
const delivery = document.querySelector(".delivery");
const total = document.querySelector(".total");
const availabeOffers = document.querySelector(".available-offers .offer-list")
const appliedOfferList = document.querySelector(".applied-offer-list");
const discountText = document.querySelector('.dis-text');
const couponInput = document.querySelector(".discount-form input")
const applyBtn = document.querySelector(".discount-form .btn")

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
                showToast("product added", "success")
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
        cart.push({ ...item, quantity: item.quantity || 1 })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()
    cartPageUpdate()
}



function cartPageUpdate() {
    productDetails.innerHTML = ""

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let price = []

    if(!cart.length){
        console.log("cart emty")
         cartItems.classList.remove("show")
    }else{
         cartItems.classList.add("show")
    

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

        tr.querySelector(".actions").addEventListener('click', () => {
            deleteItem(item);
            showToast("product removed", "error")
        })
        tr.querySelector(".add").addEventListener('click', () => increasedQuantity(item))
        tr.querySelector(".min").addEventListener('click', () => decreasedQuantity(item))
        price.push(item.quantity * item.price)

        productDetails.appendChild(tr)

    })
}


    displayOrderSummary(price)
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
    updateCartCount()
}

function deleteItem(item) {
    let cart = JSON.parse(localStorage.getItem("cart"));
    cart = cart.filter(cart => item.id != cart.id);

    localStorage.setItem('cart', JSON.stringify(cart));
    cartPageUpdate()
    updateCartCount()
}

function updateCartCount() {
    let cart = JSON.parse(localStorage.getItem("cart")) || []
    let count = cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = count
}

let offers = [
    { id: 1, code: "SAVE10", discount: 10, applied: false },
    { id: 2, code: "SAVE20", discount: 20, applied: false },
    { id: 3, code: "SAVE30", discount: 30, applied: false },
    { id: 4, code: "SAVE50", discount: 50, applied: false }
];


function displayOrderSummary(price) {

    let subTotalValue = price.reduce((sum, item) => sum + item, 0);
    let diScountValue = subTotalValue * getAppliedDiscount()


    let deliveryCharges = subTotalValue > 0 ? 50 : 0;
    let totalValue = subTotalValue - diScountValue + deliveryCharges


    subTotal.innerHTML = `${subTotalValue} USD`;
    discount.innerHTML = `${diScountValue} USD`;
    delivery.innerHTML = `${deliveryCharges} USD`;
    total.innerHTML = `${totalValue} USD`
}

function getAppliedDiscount() {
    let applied = offers.find(o => o.applied);
    return applied ? applied.discount / 100 : 0;
}

function renderOfferList() {
    availabeOffers.innerHTML = ""
    offers.forEach((offer) => {
        if (!offer.applied) {
            let div = document.createElement("div");
            div.classList.add("offer-item");
            div.innerHTML = `<div >
                             <span>SAVE${offer.discount} -</span>
                            <span class="green">${offer.discount}% OFF</span>
                        </div>
                        <button class="btn">Apply</button>`;

            div.querySelector(".btn").addEventListener("click", () => {
                applyOffer(offer.id)

            });

            availabeOffers.appendChild(div);
        }
    })
}

renderOfferList()

function applyOffer(id) {

    offers.forEach(o => o.applied = false);

    const selcted = offers.find(o => o.id == id);
    if (selcted) {
        selcted.applied = true;
    }

    renderOfferList()
    renderAppliedOffer();

    cartPageUpdate()

}

function renderAppliedOffer() {
    appliedOfferList.innerHTML = "";

    const applied = offers.find(o => o.applied);

    if (applied) {
        let div = document.createElement("div");
        div.classList.add("applied-offer");

        div.innerHTML = `
              <div class="offer-text">
                <i class="fa-solid fa-circle-check check-icon"></i>
                <p>
                  SAVE${applied.discount} applied <span class="green">(You saved$${applied.discount})</span>
                </p>
              </div>
              <button class="remove">Remove</button>`;

        div.querySelector(".remove").addEventListener("click", () => {
            removeOffer(applied.id)
            showToast("coupon removed", "error")

        })

        appliedOfferList.appendChild(div)
        discountText.innerHTML = `${applied.discount}%`
        showToast("coupon applied", "success")

    } else {
        discount.innerHTML = ""
    }
}


function removeOffer(id) {
    console.log(id)
    const offer = offers.find(O => O.id == id);


    if (offer) {
        offer.applied = false;
    }
    renderOfferList();
    renderAppliedOffer()

    cartPageUpdate()
    discountText.innerHTML = ""
}


applyBtn.addEventListener("click", () => {
    let code = couponInput.value.trim().toUpperCase()

    if (!code) {
        alert("enter coupon code");
        return;
    }

    let offer = offers.find(o => o.code == code);

    if (!offer) {
        showToast("Invalid coupon ", "error");
        return;
    }

    applyOffer(offer.id)
    couponInput.value = ""
})


function showToast(message, type = "success") {
    const container = document.getElementById("toast-container");

    const toast = document.createElement("div");
    toast.classList.add("toast", type);
    toast.textContent = message;

    container.appendChild(toast);

    // remove after 3s
    setTimeout(() => {
        toast.remove();
    }, 3000);
}
