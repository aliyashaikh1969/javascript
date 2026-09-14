console.log("product details page")

const menuBtn = document.querySelector(".menu-btn");
const mobileMenu = document.querySelector("#mobileMenu");
const menuIcon = menuBtn.querySelector(".material-symbols-outlined");
const themeBtn = document.querySelector(".theme-btn");

const cartBtn = document.querySelector("header .cart-btn");
const cartPage = document.querySelector(".cart-page");
const cartClose = document.querySelector(".cart-close")

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

const productView = document.querySelector("#productView");
const breadcrumbName = document.querySelector("#breadcrumbName");
const relatedList = document.querySelector("#relatedList");

let currentProduct = null;
let selectedColor = "";
let selectedQty = 1;

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

themeBtn.addEventListener("click", () => {
    document.body.classList.toggle("dark")

    if (document.body.classList.contains("dark")) {
        themeBtn.textContent = "light_mode"
    } else {
        themeBtn.textContent = 'dark_mode'
    }
})

// -----------------------------load product from url ---------------------

const productId = new URLSearchParams(window.location.search).get("id");

async function getProduct() {
    try {
        if (!productId) throw new Error("no product id in url");

        const response = await fetch(`http://localhost:3000/products/${productId}`);
        if (!response.ok) throw new Error("failed to fetch product");

        currentProduct = await response.json();

        selectedColor = currentProduct.color || (currentProduct.colors ? currentProduct.colors[0] : "");
        selectedQty = 1;

        renderProduct(currentProduct);
        getRelatedProducts(currentProduct);

    } catch (error) {
        console.log("error", error)
        productView.innerHTML = `<p class="product-not-found">Product not found.</p>`;
    }
}

getProduct()
updateCartCount()

// ---------------------------- render product --------------------------

function renderProduct(item) {

    breadcrumbName.textContent = item.name;
    document.title = `${item.name} · WatchStore`;

    const images = item.images && item.images.length ? item.images : [item.image];
    const discountPercent = item.originalPrice
        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        : 0;

    productView.innerHTML = `
        <div class="product-gallery">
            <div class="main-image">
                ${item.isNew ? `<span class="new-badge">NEW</span>` : ""}
                <img id="mainImage" src="${images[0]}" alt="${item.name}" />
            </div>
            <div class="thumbnail-list" id="thumbnailList">
                ${images.map((img, i) => `
                    <button class="thumbnail ${i === 0 ? "active" : ""}" data-image="${img}">
                        <img src="${img}" alt="${item.name} ${i + 1}" />
                    </button>
                `).join("")}
            </div>
        </div>

        <div class="product-info">
            <span class="p-category">${item.category}</span>
            <h1 class="p-title">${item.name}</h1>

            <div class="p-rating">
                <div class="stars">
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                    <i class="fa-solid fa-star"></i>
                </div>
                <p class="rates">${item.rating} (${item.reviews} reviews)</p>
            </div>

            <div class="p-price">
                <span class="current-price">$${item.price}</span>
                ${item.originalPrice ? `<span class="original-price">$${item.originalPrice}</span>` : ""}
                ${discountPercent > 0 ? `<span class="discount-badge">-${discountPercent}%</span>` : ""}
            </div>

            <p class="p-description">${item.description || ""}</p>

            ${item.keyPoints && item.keyPoints.length ? `
                <ul class="key-points">
                    ${item.keyPoints.map(point => `<li><i class="fa-solid fa-circle-check"></i> ${point}</li>`).join("")}
                </ul>
            ` : ""}

            ${item.colors && item.colors.length ? `
                <div class="option-block">
                    <p class="option-label">Color: <span id="selectedColorText">${selectedColor}</span></p>
                    <div class="color-options" id="pColors">
                        ${item.colors.map(color => `
                            <button
                                class="color-option ${color.toLowerCase().replace(/\s+/g, "-")} ${color === selectedColor ? "active" : ""}"
                                data-color="${color}"
                                aria-label="${color}"
                            ></button>
                        `).join("")}
                    </div>
                </div>
            ` : ""}

            <div class="option-block">
                <p class="option-label">Quantity</p>
                <div class="quantity-selector">
                    <button id="qtyMinus">-</button>
                    <span id="qtyValue">1</span>
                    <button id="qtyPlus">+</button>
                </div>
                <span class="stock-info">${item.stock > 0 ? `${item.stock} in stock` : "Out of stock"}</span>
            </div>

            <div class="p-actions">
                <button class="btn add-to-cart-btn" id="addToCartBtn" ${item.stock > 0 ? "" : "disabled"}>
                    <i class="fa-solid fa-cart-shopping"></i>
                    Add to cart
                </button>
                <button class="wishlist-btn" id="wishlistBtn">
                    <span class="material-symbols-outlined">favorite</span>
                </button>
            </div>

            ${item.specifications ? `
                <div class="specifications">
                    <h3>Specifications</h3>
                    <table>
                        ${Object.entries(item.specifications).map(([key, value]) => `
                            <tr>
                                <td class="spec-key">${formatSpecKey(key)}</td>
                                <td class="spec-value">${value}</td>
                            </tr>
                        `).join("")}
                    </table>
                </div>
            ` : ""}
        </div>
    `;

    wireProductInteractions(item);
}

function formatSpecKey(key) {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, str => str.toUpperCase());
}

function wireProductInteractions(item) {

    const mainImage = document.querySelector("#mainImage");
    document.querySelectorAll(".thumbnail").forEach(thumb => {
        thumb.addEventListener("click", () => {
            mainImage.src = thumb.dataset.image;
            document.querySelectorAll(".thumbnail").forEach(t => t.classList.remove("active"));
            thumb.classList.add("active");
        });
    });

    const colorButtons = document.querySelectorAll("#pColors .color-option");
    const selectedColorText = document.querySelector("#selectedColorText");
    colorButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            selectedColor = btn.dataset.color;
            colorButtons.forEach(b => b.classList.remove("active"));
            btn.classList.add("active");
            if (selectedColorText) selectedColorText.textContent = selectedColor;
        });
    });

    const qtyValue = document.querySelector("#qtyValue");
    document.querySelector("#qtyMinus").addEventListener("click", () => {
        if (selectedQty > 1) {
            selectedQty--;
            qtyValue.textContent = selectedQty;
        }
    });
    document.querySelector("#qtyPlus").addEventListener("click", () => {
        if (selectedQty < item.stock) {
            selectedQty++;
            qtyValue.textContent = selectedQty;
        }
    });

    document.querySelector("#addToCartBtn").addEventListener("click", () => {
        addToCart({ ...item, color: selectedColor, quantity: selectedQty });
        showToast("product added", "success")
    });

    document.querySelector("#wishlistBtn").addEventListener("click", (e) => {
        e.currentTarget.classList.toggle("active");
    });
}

// ---------------------------- related products --------------------------

async function getRelatedProducts(item) {
    try {
        const response = await fetch(`http://localhost:3000/products?category=${item.category}`);
        if (!response.ok) throw new Error("failed to fetch related products");

        let related = await response.json();
        related = related.filter(p => p.id != item.id).slice(0, 4);

        renderRelatedProducts(related);

    } catch (error) {
        console.log("error", error)
    }
}

function renderRelatedProducts(items) {
    relatedList.innerHTML = "";

    items.forEach(item => {
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
        relatedList.appendChild(card)

        card.querySelector(".pro-image").addEventListener("click", (e) => {
            if (e.target.closest(".icons")) return;
            window.location.href = `product-details.html?id=${item.id}`;
        });

        card.querySelector(".pro-title").addEventListener("click", (e) => {
            e.stopPropagation();
            window.location.href = `product-details.html?id=${item.id}`;
        });

        card.querySelector(".cart-card").addEventListener("click", () => {
            addToCart(item);
            showToast("product added", "success")
        });
    });
}

// ------------------------------- cart -----------------------------------

cartBtn.addEventListener("click", () => {
    cartPage.classList.toggle("show")
    document.body.style.overflow = "hidden";
    cartPageUpdate()
})
cartClose.addEventListener("click", () => {
    cartPage.classList.remove("show")
    document.body.style.overflow = "auto";
})

function addToCart(item) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(p => p.id === item.id);

    if (existing) {
        existing.quantity += item.quantity || 1
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

    setTimeout(() => {
        toast.remove();
    }, 3000);
}
