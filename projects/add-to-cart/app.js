
console.log("cart page")


const menuBtn = document.querySelector(".menu-btn");
const mobileMenu = document.querySelector("#mobileMenu");
const menuIcon = menuBtn.querySelector(".material-symbols-outlined");
const productList = document.querySelector(".product-list");
const previousBtn = document.querySelector("#previousBtn");
const nextBtn = document.querySelector("#nextBtn");
const pageNumbers = document.querySelector("#pageNumbers");
const searchInput = document.querySelector("#SearchInput")
const themeBtn = document.querySelector(".theme-btn");
const themeIcon = document.querySelector(".theme-icon")

const cartBtn = document.querySelector("header .cart-btn");
const cartPage = document.querySelector(".cart-page");
const cartClose = document.querySelector(".cart-close")

const mobileFilterBtn = document.querySelector("#mobileFilterBtn");
const filterSidebar = document.querySelector("#filterSidebar");
const filterOverlay = document.querySelector("#filterOverlay");
const filterClose = document.querySelector("#filterClose");

const cartCount = document.querySelector(".cart-count")

const productDetails = document.querySelector(".product-details table tbody")
const cartItems = document.querySelector(".cart-page .cart-items")
const subTotal = document.querySelector(".s-total");
const discount = document.querySelector(".discount");
const delivery = document.querySelector(".delivery");
const total = document.querySelector(".total");
const availableOffers = document.querySelector(".available-offers .offer-list")
const appliedOfferList = document.querySelector(".applied-offer-list");
const discountText = document.querySelector('.dis-text');
const couponInput = document.querySelector(".discount-form input")
const applyBtn = document.querySelector(".discount-form .btn")




let allProducts =[]
let products = []
let currentPage = 1;
const productsPerPage = 8;


const filters ={
    search:"",
    category:"",
    color:"",
    minPrice:"",
    maxPrice:""
}

// -------------------------------menu bar --------------------------
menuBtn.addEventListener("click", () => {

    mobileMenu.classList.toggle("active");

    if (mobileMenu.classList.contains("active")) {
        menuIcon.textContent = "close";
    } else {
        menuIcon.textContent = "menu";
    }

});


// ------------------------theme button ------------------------------


themeBtn.addEventListener("click",()=>{

   document.body.classList.toggle("dark")
   
   if(document.body.classList.contains("dark")){
    themeIcon.textContent = "light_mode"
   }else{
    themeIcon.textContent = 'dark_mode'
   }
    
})

// -----------------------------fetching products from json file -------------
async function getProduct() {
    try {
        let response = await fetch("http://localhost:3000/products");
        if(!response.ok) throw new Error("faild to fetch products");

        allProducts = await response.json()

        products = [...allProducts]

        currentPage =1;
        displayProducts()
        createPagination()

    } catch (error) {
        console.log("error", error)
    }
}

getProduct()






updateCartCount()





// --------------------category of watches ------------------------


// ---------------- display products after fetch -----------------------

function displayProducts() {

    let categories =["All", ...new Set(products.map(item=>item.category))]
    console.log(categories)
    productList.innerHTML = "";

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = products.slice(startIndex, endIndex)

    currentProducts.forEach(item => {
        let card = document.createElement("div");
        card.classList.add("product-item")
        card.innerHTML = `  <div class="pro-image">
           ${item.isNew ? `<span class="new-badge">NEW</span>` : ""}                       
                                    <img src="${item.image}" alt="${item.name}" />
                                    <span class="material-symbols-outlined icons">favorite </span>
                                </div>
                                <div class="cart-card pro-details">
                                    <span class="category">${item.category}</span>
                                    <p class="pro-title">${item.name}</p>
                                    <div class="pro-rating">
                                        <div class="stars">
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                            <i class="fa-solid fa-star"></i>
                                        </div>
                                            <p class="rates">${item.rating} (${item.reviews})</p>
                                    </div>
                                    <div class="price-container ">
                                    <p class="price">$${item.price}</p>
                                    <span class="original-price">$${item.originalPrice}</span>
                                    </div> 
                                    <button class="btn">
                                    <i class="fa-solid fa-cart-shopping"></i>
                                    Add to cart
                                    </button>
                                </div>`
        productList.appendChild(card)

        updatePaginationButtons() 

        card.querySelector(".cart-card").addEventListener("click", () => {
            addToCart(item);
            showToast("product added", "success")
        });

    });

}



// -----------------------filter ----------------------------

async function getFilteredProducts() {
    try {
        const params = new URLSearchParams();

        if (filters.search) {
            params.append("name_like", filters.search);
        }

        if (filters.category) {
            params.append("category", filters.category);
        }

        if (filters.color) {
            params.append("color", filters.color);
        }

        if (filters.minPrice) {
            params.append("price:gte", filters.minPrice);
        }

        if (filters.maxPrice) {
            params.append("price:lte", filters.maxPrice);
        }

        const url = `http://localhost:3000/products?${params.toString()}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Failed to fetch products");
        }


        console.log(url)
        products = await response.json();

        currentPage = 1;

        displayProducts();
        createPagination();

    } catch (error) {
        console.error("Error fetching products:", error);
    }
}

// --------------------------search Input ------------------------------

console.log(searchInput)

searchInput.addEventListener("input",()=>{
    filters.search = searchInput.value.trim()

    getFilteredProducts()
})

// ------------------------pagination creation--------------------------
function createPagination() {

    pageNumbers.innerHTML = ""

    const totalPages = Math.ceil(products.length / productsPerPage)

    for (let i = 1; i <= totalPages; i++) {
        const button = document.createElement("button");
        button.classList.add("page-number")
        button.textContent = i

        if (i === currentPage) {
            button.classList.add("active")
        }

        button.addEventListener("click", () => {
            currentPage = i
            displayProducts()
            createPagination()

            document.querySelector(".product-container").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        })
        pageNumbers.appendChild(button)
    }
}


// -------------------pagination previous button event ------------------

previousBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--
        displayProducts()
        createPagination()
        document.querySelector(".product-container").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
})


// ------------------pagination next button event-----------------------

nextBtn.addEventListener("click",()=>{
    console.log("next")
    let totalPages=Math.ceil(products.length / productsPerPage)
    if(currentPage<totalPages){
        currentPage++
        displayProducts()
        createPagination()
        document.querySelector(".product-container").scrollIntoView({
            behavior:"smooth",
            block:"start"
        })
    }
})


// -----------------------disable previous and next button---------------

function updatePaginationButtons (){
    const totalPages = Math.ceil(products.length/productsPerPage);
    previousBtn.disabled = currentPage===1;
    nextBtn.disabled = currentPage ===totalPages

}






cartBtn.addEventListener("click", () => {
    cartPage.classList.toggle("show")
    document.body.style.overflow = "hidden";
    cartPageUpdate()
})
cartClose.addEventListener("click", () => {
    cartPage.classList.remove("show")
    document.body.style.overflow = "auto";
})

// ---------------------mobile/tablet filter drawer----------------------

function openFilterSidebar() {
    filterSidebar.classList.add("active");
    filterOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
}

function closeFilterSidebar() {
    filterSidebar.classList.remove("active");
    filterOverlay.classList.remove("active");
    document.body.style.overflow = "auto";
}

mobileFilterBtn.addEventListener("click", openFilterSidebar);
filterClose.addEventListener("click", closeFilterSidebar);
filterOverlay.addEventListener("click", closeFilterSidebar);

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

    if (!cart.length) {
        cartItems.classList.remove("show")
    } else {
        cartItems.classList.add("show")


        cart.forEach(item => {
            let tr = document.createElement("tr");
            tr.innerHTML = ` 
              <td>
                <div class="product">
                  <img src="${item.image}" class="pImage" alt="" />

                  <div class="img-det">
                    <p>${item.name}</p>
                    <span>${item.keyPoints.join(",")}</span>
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
            `

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
    let cart = JSON.parse(localStorage.getItem("cart"));
    let product = cart.find(p => item.id == p.id)
    if (product) {
        if (product.quantity > 1) {
            product.quantity--;
        } else {
            cart = cart.filter(cart => product.id != cart.id);
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
    discount.textContent = `-${diScountValue.toFixed(2)} USD`;
    delivery.innerHTML = `${deliveryCharges} USD`;
    total.innerHTML = `${totalValue} USD`
}

function getAppliedDiscount() {
    let applied = offers.find(o => o.applied);
    return applied ? applied.discount / 100 : 0;
}

function renderOfferList() {
    availableOffers.innerHTML = ""
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

            availableOffers.appendChild(div);
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
