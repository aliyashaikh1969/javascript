console.log("product details page")

function getProductImage(product, view = "front") {
    return product?.images?.[view] || product?.images?.front || "images/watches/placeholder.svg"
}

const menuBtn = document.querySelector(".menu-btn");
const mobileMenu = document.querySelector("#mobileMenu");
const menuIcon = menuBtn.querySelector(".material-symbols-outlined");
const themeBtn = document.querySelector(".theme-btn");
const mobileThemeToggle = document.querySelector("#mobileThemeToggle");
const mobileThemeIcon = document.querySelector("#mobileThemeIcon");
const navLinks = document.querySelectorAll(".nav-link");
const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");

const cartBtn = document.querySelector("header .cart-btn");
const cartPage = document.querySelector(".cart-page");
const cartClose = document.querySelector(".cart-close")
const clearCartBtn = document.querySelector("#clearCartBtn")

const confirmModalOverlay = document.querySelector("#confirmModalOverlay")
const confirmModalMessage = document.querySelector("#confirmModalMessage")
const confirmModalConfirmBtn = document.querySelector("#confirmModalConfirm")
const confirmModalCancelBtn = document.querySelector("#confirmModalCancel")

const cartCount = document.querySelector(".cart-count")

const whishBtn = document.querySelector("header .whish-btn");
const whishCount = document.querySelector(".whish-count");
const mobileCount = document.querySelector(".mobile-count");
const wishlistPage = document.querySelector(".wishlist-page");
const wishlistClose = document.querySelector(".wishlist-close");
const wishlistGrid = document.querySelector("#wishlistGrid");
const wishlistItems = document.querySelector(".wishlist-page .wishlist-items")

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
const checkoutBtn = document.querySelector(".check-out")

const productView = document.querySelector("#productView");
const breadcrumbName = document.querySelector("#breadcrumbName");
const relatedList = document.querySelector("#relatedList");
const recentlyViewedSection = document.querySelector("#recentlyViewedSection");
const recentlyViewedList = document.querySelector("#recentlyViewedList");

const searchInput = document.querySelector("#SearchInput");
const searchSuggestions = document.querySelector("#searchSuggestions");
const backToTopBtn = document.querySelector("#backToTopBtn");

const reviewsSummary = document.querySelector("#reviewsSummary");
const reviewList = document.querySelector("#reviewList");
const reviewForm = document.querySelector("#reviewForm");
const reviewStarInput = document.querySelector("#reviewStarInput");

let currentProduct = null;
let selectedColor = "";
let selectedQty = 1;
let selectedReviewRating = 0;
let allProductsForSearch = [];

// -------------------------------menu bar --------------------------
menuBtn.addEventListener("click", () => {
    mobileMenu.classList.toggle("active");

    if (mobileMenu.classList.contains("active")) {
        menuIcon.textContent = "close";
    } else {
        menuIcon.textContent = "menu";
    }
});

// close the mobile menu if the viewport is resized back to desktop width
window.addEventListener("resize", () => {
    if (window.innerWidth > 768 && mobileMenu.classList.contains("active")) {
        mobileMenu.classList.remove("active");
        menuIcon.textContent = "menu";
    }
});

// ------------------------theme button ------------------------------

function applyTheme(isDark) {
    document.body.classList.toggle("dark", isDark)

    const icon = isDark ? "light_mode" : "dark_mode"
    themeBtn.textContent = icon
    mobileThemeIcon.textContent = icon
}

function toggleTheme() {
    const isDark = !document.body.classList.contains("dark")
    applyTheme(isDark)
    localStorage.setItem("theme", isDark ? "dark" : "light")
}

applyTheme(localStorage.getItem("theme") === "dark")

themeBtn.addEventListener("click", toggleTheme)
mobileThemeToggle.addEventListener("click", toggleTheme)

// ------------------------nav links ------------------------------

function handleNavClick() {
    mobileMenu.classList.remove("active")
    menuIcon.textContent = "menu"
}

navLinks.forEach(link => link.addEventListener("click", handleNavClick))
mobileNavLinks.forEach(link => link.addEventListener("click", handleNavClick))

// -----------------------------load product from url ---------------------

const productId = new URLSearchParams(window.location.search).get("id");

function renderProductSkeleton() {
    productView.innerHTML = `
        <div class="product-skeleton">
            <div class="skeleton skeleton-gallery"></div>
            <div class="skeleton-info">
                <div class="skeleton skeleton-line" style="width: 40%"></div>
                <div class="skeleton skeleton-line" style="width: 80%"></div>
                <div class="skeleton skeleton-line" style="width: 30%"></div>
                <div class="skeleton skeleton-line" style="width: 60%"></div>
                <div class="skeleton skeleton-line" style="width: 90%"></div>
                <div class="skeleton skeleton-line" style="width: 70%"></div>
            </div>
        </div>
    `
}

function renderRelatedSkeletons(count = 4) {
    relatedList.innerHTML = Array.from({ length: count }).map(() => `
        <div class="product-item skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="pro-details">
                <div class="skeleton skeleton-line" style="width: 40%"></div>
                <div class="skeleton skeleton-line" style="width: 85%"></div>
                <div class="skeleton skeleton-line" style="width: 60%"></div>
                <div class="skeleton skeleton-line" style="width: 50%"></div>
            </div>
        </div>
    `).join("")
}

async function getProduct() {
    renderProductSkeleton()
    renderRelatedSkeletons()
    try {
        if (!productId) throw new Error("no product id in url");

        const response = await fetch(`http://localhost:3000/products/${productId}`);
        if (!response.ok) throw new Error("failed to fetch product");

        currentProduct = await response.json();

        selectedColor = currentProduct.color || (currentProduct.colors ? currentProduct.colors[0] : "");
        selectedQty = 1;

        renderProduct(currentProduct);
        getRelatedProducts(currentProduct);
        getReviews(currentProduct.id);
        addToRecentlyViewed(currentProduct.id);
        renderRecentlyViewed();

    } catch (error) {
        console.log("error", error)
        productView.innerHTML = `<p class="product-not-found">Product not found.</p>`;
    }
}

// ---------------------------- recently viewed --------------------------

function addToRecentlyViewed(id) {
    let viewed = JSON.parse(localStorage.getItem("recentlyViewed")) || []
    viewed = viewed.filter(vid => vid !== id)
    viewed.unshift(id)
    viewed = viewed.slice(0, 8)
    localStorage.setItem("recentlyViewed", JSON.stringify(viewed))
}

async function renderRecentlyViewed() {
    const viewed = (JSON.parse(localStorage.getItem("recentlyViewed")) || []).filter(id => id !== currentProduct.id)

    if (!viewed.length) {
        recentlyViewedSection.style.display = "none"
        return
    }

    try {
        const response = await fetch("http://localhost:3000/products");
        if (!response.ok) throw new Error("failed to fetch products");
        const allProducts = await response.json();

        const items = viewed.map(id => allProducts.find(p => p.id === id)).filter(Boolean).slice(0, 4)

        if (!items.length) {
            recentlyViewedSection.style.display = "none"
            return
        }

        recentlyViewedSection.style.display = ""
        renderProductCards(recentlyViewedList, items)

    } catch (error) {
        console.log("error", error)
    }
}

getProduct()
updateCartCount()
updateWishlistCount()

// ---------------------------- render product --------------------------

function renderProduct(item) {

    breadcrumbName.textContent = item.name;
    document.title = `${item.name} · WatchStore`;

    const views = [
        { key: "front", label: "Front" },
        { key: "threeQuarter", label: "3/4" },
        { key: "side", label: "Side" },
        { key: "back", label: "Back" },
    ]
    const images = views.map(v => ({ ...v, src: getProductImage(item, v.key) }))
    const discountPercent = item.originalPrice
        ? Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
        : 0;

    productView.innerHTML = `
        <div class="product-gallery">
            <div class="main-image">
                ${item.isNew ? `<span class="new-badge">NEW</span>` : ""}
                <img id="mainImage" src="${images[0].src}" alt="${item.name} - ${images[0].label} view" />
            </div>
            <div class="thumbnail-list" id="thumbnailList">
                ${images.map((img, i) => `
                    <button class="thumbnail ${i === 0 ? "active" : ""}" data-image="${img.src}">
                        <img src="${img.src}" alt="${item.name} - ${img.label} view" />
                        <span class="thumbnail-label">${img.label}</span>
                    </button>
                `).join("")}
            </div>
        </div>

        <div class="product-info">
            <span class="p-category">${item.category}</span>
            <h1 class="p-title">${item.name}</h1>

            <div class="p-rating">
                <div class="stars">
                    ${renderRatingStars(item.rating)}
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
                <button class="wishlist-btn ${isWishlisted(item.id) ? "active" : ""}" id="wishlistBtn">
                    <span class="material-symbols-outlined">favorite</span>
                </button>
                <button class="share-btn" id="shareBtn" aria-label="Share this product">
                    <span class="material-symbols-outlined">share</span>
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

function renderRatingStars(rating) {
    const rounded = Math.round((rating || 0) * 2) / 2
    let html = ""
    for (let i = 1; i <= 5; i++) {
        if (rounded >= i) html += `<i class="fa-solid fa-star"></i>`
        else if (rounded >= i - 0.5) html += `<i class="fa-solid fa-star-half-stroke"></i>`
        else html += `<i class="fa-regular fa-star"></i>`
    }
    return html
}

function getDiscountBadge(item) {
    if (!item.originalPrice || item.originalPrice <= item.price) return ""
    const percent = Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100)
    return `<span class="discount-badge">-${percent}%</span>`
}

function getLowStockNotice(item) {
    if (typeof item.stock !== "number" || item.stock <= 0 || item.stock > 5) return ""
    return `<span class="low-stock">Only ${item.stock} left</span>`
}

function wireProductInteractions(item) {

    const mainImage = document.querySelector("#mainImage");
    document.querySelectorAll(".thumbnail").forEach(thumb => {
        thumb.addEventListener("click", () => {
            mainImage.src = thumb.dataset.image;
            mainImage.alt = thumb.querySelector("img").alt;
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
        if (addToCart({ ...item, color: selectedColor, quantity: selectedQty })) {
            showToast("Product added to cart", "success")
        }
    });

    document.querySelector("#wishlistBtn").addEventListener("click", (e) => {
        const nowWishlisted = toggleWishlist(item);
        e.currentTarget.classList.toggle("active", nowWishlisted);
        showToast(nowWishlisted ? "Added to wishlist" : "Removed from wishlist", nowWishlisted ? "success" : "error");
    });

    document.querySelector("#shareBtn").addEventListener("click", async () => {
        const shareUrl = window.location.href;

        if (navigator.share) {
            try {
                await navigator.share({ title: item.name, text: `Check out this ${item.name} on WatchStore`, url: shareUrl });
            } catch (error) {
                // user cancelled the share sheet - not an error
            }
            return
        }

        try {
            await navigator.clipboard.writeText(shareUrl);
            showToast("Link copied to clipboard", "success");
        } catch (error) {
            showToast("Could not copy link", "error");
        }
    });
}

// ---------------------------- related / recently viewed cards --------------------------

function renderProductCards(container, items) {
    container.innerHTML = "";

    items.forEach(item => {
        let card = document.createElement("div");
        card.classList.add("product-item")
        card.innerHTML = `  <div class="pro-image ${isWishlisted(item.id) ? "whish-list" : ""}">
                                    ${item.isNew ? `<span class="new-badge">NEW</span>` : ""}
                                    <img src="${getProductImage(item)}" alt="${item.name}" />
                                    <span class="material-symbols-outlined icons">favorite </span>
                                </div>
                                <div class="cart-card pro-details">
                                    <span class="category">${item.category}</span>
                                    <p class="pro-title">${item.name}</p>
                                    <div class="pro-rating">
                                        <div class="stars">
                                            ${renderRatingStars(item.rating)}
                                        </div>
                                            <p class="rates">${item.rating} (${item.reviews})</p>
                                    </div>
                                    <div class="price-container ">
                                    <p class="price">$${item.price}</p>
                                    <span class="original-price">$${item.originalPrice}</span>
                                    ${getDiscountBadge(item)}
                                    </div>
                                    ${getLowStockNotice(item)}
                                    <button class="btn" ${item.stock <= 0 ? "disabled" : ""}>
                                    <i class="fa-solid fa-cart-shopping"></i>
                                    ${item.stock <= 0 ? "Out of stock" : "Add to cart"}
                                    </button>
                                </div>`
        container.appendChild(card)

        card.querySelector(".pro-image").addEventListener("click", (e) => {
            if (e.target.closest(".icons")) return;
            window.location.href = `product-details.html?id=${item.id}`;
        });

        card.querySelector(".pro-title").addEventListener("click", (e) => {
            e.stopPropagation();
            window.location.href = `product-details.html?id=${item.id}`;
        });

        if (item.stock > 0) {
            card.querySelector(".cart-card").addEventListener("click", (e) => {
                if (e.target.closest(".btn")?.disabled) return;
                if (addToCart(item)) showToast("Product added to cart", "success")
            });
        }

        card.querySelector(".pro-image .icons").addEventListener("click", (e) => {
            e.stopPropagation();
            const nowWishlisted = toggleWishlist(item);
            card.querySelector(".pro-image").classList.toggle("whish-list", nowWishlisted);
            showToast(nowWishlisted ? "Added to wishlist" : "Removed from wishlist", nowWishlisted ? "success" : "error");
        });
    });
}

function renderRelatedProducts(items) {
    renderProductCards(relatedList, items)
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

checkoutBtn?.addEventListener("click", () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];
    if (!cart.length) {
        showToast("Your cart is empty", "error")
        return
    }
    window.location.href = "checkout.html"
})

// -------- confirm modal --------

let confirmModalCallback = null;

function showConfirmModal(message, onConfirm) {
    confirmModalMessage.textContent = message
    confirmModalCallback = onConfirm
    confirmModalOverlay.classList.add("show")
}

function hideConfirmModal() {
    confirmModalOverlay.classList.remove("show")
    confirmModalCallback = null
}

confirmModalConfirmBtn.addEventListener("click", () => {
    confirmModalCallback?.()
    hideConfirmModal()
})
confirmModalCancelBtn.addEventListener("click", hideConfirmModal)
confirmModalOverlay.addEventListener("click", (e) => {
    if (e.target === confirmModalOverlay) hideConfirmModal()
})

// -------- clear cart --------

clearCartBtn.addEventListener("click", () => {
    if (clearCartBtn.disabled) return
    showConfirmModal("Remove all items from your cart?", () => {
        localStorage.setItem("cart", JSON.stringify([]))
        offers.forEach(o => o.applied = false)
        renderOfferList()
        renderAppliedOffer(true)
        updateCartCount()
        cartPageUpdate()
        showToast("Cart cleared", "error")
    })
})

function addToCart(item) {

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const existing = cart.find(p => p.id === item.id);
    const requestedQty = item.quantity || 1;
    const stock = typeof item.stock === "number" ? item.stock : Infinity;
    const alreadyInCart = existing ? existing.quantity : 0;

    if (alreadyInCart + requestedQty > stock) {
        if (alreadyInCart >= stock) {
            showToast("No more stock available", "error")
        } else {
            showToast(`Only ${stock - alreadyInCart} more in stock`, "error")
        }
        return false
    }

    if (existing) {
        existing.quantity += requestedQty
    } else {
        cart.push({ ...item, quantity: requestedQty })
    }

    localStorage.setItem("cart", JSON.stringify(cart))
    updateCartCount()
    cartPageUpdate()
    return true
}

function cartPageUpdate() {
    productDetails.innerHTML = ""

    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let price = []

    clearCartBtn.disabled = cart.length === 0

    if (!cart.length) {
        cartItems.classList.remove("show")
    } else {
        cartItems.classList.add("show")

        cart.forEach(item => {
            let tr = document.createElement("tr");
            tr.innerHTML = `
              <td>
                <div class="product">
                  <img src="${getProductImage(item)}" class="pImage" alt="" />

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
                showToast("Product removed from cart", "error")
            })
            tr.querySelector(".add").addEventListener('click', () => increasedQuantity(item))
            tr.querySelector(".min").addEventListener('click', () => decreasedQuantity(item))
            price.push(item.quantity * item.price)

            productDetails.appendChild(tr)
        })
    }

    displayOrderSummary(price)
    updateCartCount()
    if (offers.length) renderAppliedOffer(true)
}

function increasedQuantity(item) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let product = cart.find(p => item.id == p.id)
    if (product) {
        const stock = typeof product.stock === "number" ? product.stock : Infinity;
        if (product.quantity >= stock) {
            showToast("No more stock available", "error")
            return
        }
        product.quantity += 1
    }
    localStorage.setItem("cart", JSON.stringify(cart))
    cartPageUpdate()
}

function decreasedQuantity(item) {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
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
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
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

// ------------------------------- wishlist ---------------------------------

function getWishlist() {
    return JSON.parse(localStorage.getItem("wishlist")) || [];
}

function isWishlisted(id) {
    return getWishlist().some(p => p.id === id)
}

function toggleWishlist(item) {
    let wishlist = getWishlist();
    const exists = wishlist.some(p => p.id === item.id)

    if (exists) {
        wishlist = wishlist.filter(p => p.id !== item.id)
    } else {
        wishlist.push(item)
    }

    localStorage.setItem("wishlist", JSON.stringify(wishlist));
    updateWishlistCount()
    return !exists
}

function updateWishlistCount() {
    const count = getWishlist().length
    whishCount.textContent = count;
    mobileCount.textContent = count;
}

function renderWishlistPage() {
    const wishlist = getWishlist();

    wishlistGrid.innerHTML = "";

    if (!wishlist.length) {
        wishlistItems.classList.remove("show");
        return;
    }

    wishlistItems.classList.add("show");
    renderProductCards(wishlistGrid, wishlist)
}

whishBtn.addEventListener("click", () => {
    wishlistPage.classList.toggle("show")
    document.body.style.overflow = "hidden";
    renderWishlistPage()
})

wishlistClose.addEventListener("click", () => {
    wishlistPage.classList.remove("show")
    document.body.style.overflow = "auto";
})

// --------------------------------offers / coupons--------------------------

let offers = [];

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

function getCartSubtotal() {
    const currentCart = JSON.parse(localStorage.getItem("cart")) || []
    return currentCart.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

async function getCoupons() {
    try {
        const response = await fetch("http://localhost:3000/coupons")
        if (!response.ok) throw new Error("failed to fetch coupons")
        const coupons = await response.json()
        offers = coupons.map(c => ({ ...c, applied: false }))
        renderOfferList()
    } catch (error) { console.log("error", error) }
}

function renderOfferList() {
    availableOffers.innerHTML = ""
    const subtotal = getCartSubtotal()
    offers.forEach((offer) => {
        if (!offer.applied) {
            const eligible = subtotal >= offer.minOrder
            let div = document.createElement("div");
            div.classList.add("offer-item")
            if (!eligible) div.classList.add("disabled")
            div.innerHTML = `<div>
                             <span>${offer.code} - <span class="green">${offer.discount}% OFF</span></span>
                            <p class="offer-condition">Min. order $${offer.minOrder}</p>
                        </div>
                        <button class="btn" ${eligible ? "" : "disabled"}>Apply</button>`;
            if (eligible) {
                div.querySelector(".btn").addEventListener("click", () => applyOffer(offer.id));
            }
            availableOffers.appendChild(div)
        }
    })
}

function renderAppliedOffer(silent = false) {
    appliedOfferList.innerHTML = "";

    const applied = offers.find(o => o.applied);

    if (applied) {
        const savedAmount = (getCartSubtotal() * applied.discount / 100).toFixed(2)

        let div = document.createElement("div");
        div.classList.add("applied-offer");

        div.innerHTML = `
              <div class="offer-text">
                <i class="fa-solid fa-circle-check check-icon"></i>
                <p>
                  ${applied.code} applied <span class="green">(You saved $${savedAmount})</span>
                </p>
              </div>
              <button class="remove">Remove</button>`;

        div.querySelector(".remove").addEventListener("click", () => {
            removeOffer(applied.id)
            showToast("coupon removed", "error")
        })

        appliedOfferList.appendChild(div)
        discountText.innerHTML = `${applied.discount}%`
        if (!silent) showToast("coupon applied", "success")
        localStorage.setItem("appliedCoupon", applied.code)

    } else {
        discount.innerHTML = ""
        localStorage.removeItem("appliedCoupon")
    }
}

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
        showToast("Enter a coupon code", "error");
        return;
    }

    let offer = offers.find(o => o.code == code);

    if (!offer) {
        showToast("Invalid coupon ", "error");
        return;
    }

    if (getCartSubtotal() < offer.minOrder) {
        showToast(`Minimum order of $${offer.minOrder} required for ${offer.code}`, "error")
        return
    }

    applyOffer(offer.id)
    couponInput.value = ""
})

getCoupons()

//==============================================
// product reviews
//==============================================

let currentReviews = [];

function renderStars(rating) {
    return Array.from({ length: 5 }).map((_, i) =>
        `<i class="fa-solid fa-star" style="opacity:${i < Math.round(rating) ? 1 : 0.25}"></i>`
    ).join("")
}

async function getReviews(productId) {
    try {
        const response = await fetch(`http://localhost:3000/reviews`);
        if (!response.ok) throw new Error("failed to fetch reviews");

        const allReviews = await response.json();
        currentReviews = allReviews.filter(review => review.productId === productId);
        renderReviews();

    } catch (error) {
        console.log("error", error)
    }
}

function renderReviews() {
    if (!currentReviews.length) {
        reviewsSummary.innerHTML = ""
        reviewList.innerHTML = `<p class="no-reviews">No reviews yet. Be the first to share your thoughts!</p>`
        return
    }

    const average = currentReviews.reduce((sum, r) => sum + r.rating, 0) / currentReviews.length

    reviewsSummary.innerHTML = `
        <div class="reviews-summary">
            <span class="reviews-average">${average.toFixed(1)}</span>
            <div>
                <div class="stars">${renderStars(average)}</div>
                <p class="reviews-count">Based on ${currentReviews.length} review${currentReviews.length === 1 ? "" : "s"}</p>
            </div>
        </div>
    `

    reviewList.innerHTML = currentReviews.map(review => `
        <div class="review-item">
            <div class="review-header">
                <span class="review-name">${review.name}</span>
                <span class="review-date">${new Date(review.date).toLocaleDateString()}</span>
            </div>
            <div class="stars">${renderStars(review.rating)}</div>
            <p class="review-comment">${review.comment}</p>
        </div>
    `).join("")
}

reviewStarInput?.querySelectorAll(".star").forEach(star => {
    star.addEventListener("click", () => {
        selectedReviewRating = Number(star.dataset.value)
        reviewStarInput.querySelectorAll(".star").forEach(s => {
            s.classList.toggle("filled", Number(s.dataset.value) <= selectedReviewRating)
        })
    })
})

reviewForm?.addEventListener("submit", async (e) => {
    e.preventDefault()

    const name = document.querySelector("#reviewName").value.trim()
    const comment = document.querySelector("#reviewComment").value.trim()

    if (!name || !comment) {
        showToast("Please fill in all fields", "error")
        return
    }

    if (!selectedReviewRating) {
        showToast("Please select a rating", "error")
        return
    }

    try {
        const response = await fetch("http://localhost:3000/reviews", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                productId: currentProduct.id,
                name,
                rating: selectedReviewRating,
                comment,
                date: new Date().toISOString(),
            }),
        })

        if (!response.ok) throw new Error("failed to submit review")

        const newReview = await response.json()
        currentReviews.unshift(newReview)
        renderReviews()

        reviewForm.reset()
        selectedReviewRating = 0
        reviewStarInput.querySelectorAll(".star").forEach(s => s.classList.remove("filled"))

        showToast("Review submitted", "success")

    } catch (error) {
        console.log("error", error)
        showToast("Failed to submit review", "error")
    }
})

//==============================================
// search suggestions
//==============================================

async function ensureAllProductsForSearch() {
    if (allProductsForSearch.length) return allProductsForSearch
    try {
        const response = await fetch("http://localhost:3000/products");
        if (!response.ok) throw new Error("failed to fetch products");
        allProductsForSearch = await response.json();
    } catch (error) {
        console.log("error", error)
    }
    return allProductsForSearch
}

function matchesSearchTerm(product, term) {
    const query = term.trim().toLowerCase()
    if (!query) return true

    const haystack = [
        product.name,
        product.brand,
        product.category,
        product.color,
        ...(product.colors || []),
        ...(product.keyPoints || []),
        product.description,
    ].filter(Boolean).join(" ").toLowerCase()

    return haystack.includes(query)
}

async function renderSearchSuggestions(query) {
    if (!searchSuggestions) return

    if (!query.trim()) {
        searchSuggestions.classList.remove("show")
        searchSuggestions.innerHTML = ""
        return
    }

    const products = await ensureAllProductsForSearch()
    const matches = products.filter(product => matchesSearchTerm(product, query)).slice(0, 5)

    if (!matches.length) {
        searchSuggestions.innerHTML = `<div class="search-suggestion-empty">No watches found</div>`
    } else {
        searchSuggestions.innerHTML = matches.map(product => `
            <div class="search-suggestion-item" data-id="${product.id}">
                <img src="${getProductImage(product)}" alt="${product.name}" />
                <div class="suggestion-info">
                    <p class="suggestion-name">${product.name}</p>
                    <p class="suggestion-price">$${product.price}</p>
                </div>
            </div>
        `).join("")

        searchSuggestions.querySelectorAll(".search-suggestion-item").forEach(el => {
            el.addEventListener("click", () => {
                window.location.href = `product-details.html?id=${el.dataset.id}`
            })
        })
    }

    searchSuggestions.classList.add("show")
}

searchInput?.addEventListener("input", () => {
    renderSearchSuggestions(searchInput.value)
})

searchInput?.addEventListener("focus", () => {
    if (searchInput.value.trim()) renderSearchSuggestions(searchInput.value)
})

searchInput?.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchInput.value) {
        searchInput.value = ""
        searchSuggestions?.classList.remove("show")
    }
})

document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-search")) {
        searchSuggestions?.classList.remove("show")
    }
})

//==============================================
// back to top
//==============================================

window.addEventListener("scroll", () => {
    backToTopBtn?.classList.toggle("show", window.scrollY > 400)
})

backToTopBtn?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
})

//==============================================
// toast
//==============================================

const TOAST_ICONS = {
    success: "check_circle",
    error: "cancel",
    warning: "warning",
    info: "info",
}
const MAX_TOASTS = 3

function dismissToast(toast) {
    if (toast.classList.contains("toast-hide")) return
    toast.classList.add("toast-hide")
    toast.addEventListener("animationend", () => toast.remove(), { once: true })
}

function showToast(message, type = "success", duration = 3500) {
    const container = document.getElementById("toast-container");

    const existing = [...container.children].find(t => t.dataset.message === message && t.dataset.type === type)
    if (existing) {
        const progress = existing.querySelector(".toast-progress")
        progress.style.animation = "none"
        void progress.offsetWidth
        progress.style.animation = ""
        return
    }

    while (container.children.length >= MAX_TOASTS) {
        container.firstElementChild.remove()
    }

    const toast = document.createElement("div");
    toast.classList.add("toast", type);
    toast.dataset.message = message
    toast.dataset.type = type
    toast.setAttribute("role", "status")
    toast.style.setProperty("--toast-duration", `${duration}ms`)
    toast.innerHTML = `
        <span class="material-symbols-outlined toast-icon">${TOAST_ICONS[type] || TOAST_ICONS.success}</span>
        <p class="toast-message"></p>
        <button type="button" class="toast-close" aria-label="Dismiss notification">&times;</button>
        <span class="toast-progress"></span>
    `
    toast.querySelector(".toast-message").textContent = message

    container.appendChild(toast);

    toast.querySelector(".toast-close").addEventListener("click", () => dismissToast(toast))
    toast.querySelector(".toast-progress").addEventListener("animationend", () => dismissToast(toast))
}
