console.log("checkout page")

// local dev keeps using json-server on :3000 (npm run start:api); any other
// host (e.g. the Vercel deployment) uses the bundled /api serverless functions
const API_BASE = ["localhost", "127.0.0.1"].includes(location.hostname) ? "http://localhost:3000" : "/api";

function getProductImage(product, view = "front") {
    return product?.images?.[view] || product?.images?.front || "images/watches/placeholder.svg"
}

const themeBtn = document.querySelector(".theme-btn");

const checkoutEmpty = document.querySelector("#checkoutEmpty");
const checkoutGrid = document.querySelector("#checkoutGrid");
const checkoutItems = document.querySelector("#checkoutItems");
const checkoutSubtotal = document.querySelector("#checkoutSubtotal");
const checkoutDiscount = document.querySelector("#checkoutDiscount");
const checkoutDiscountText = document.querySelector("#checkoutDiscountText");
const checkoutDelivery = document.querySelector("#checkoutDelivery");
const checkoutTotal = document.querySelector("#checkoutTotal");
const checkoutForm = document.querySelector("#checkoutForm");
const placeOrderBtn = document.querySelector("#placeOrderBtn");

//==============================================
// theme
//==============================================

function applyTheme(isDark) {
    document.body.classList.toggle("dark", isDark)
    themeBtn.textContent = isDark ? "light_mode" : "dark_mode"
}

function toggleTheme() {
    const isDark = !document.body.classList.contains("dark")
    applyTheme(isDark)
    localStorage.setItem("theme", isDark ? "dark" : "light")
}

applyTheme(localStorage.getItem("theme") === "dark")
themeBtn.addEventListener("click", toggleTheme)

//==============================================
// cart summary
//==============================================

let cart = JSON.parse(localStorage.getItem("cart")) || [];
let appliedCoupon = null;
let allProducts = [];

function getCartSubtotal() {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
}

async function loadAllProducts() {
    try {
        const response = await fetch(`${API_BASE}/products`)
        if (!response.ok) throw new Error("failed to fetch products")
        allProducts = await response.json()
    } catch (error) {
        console.log("error", error)
    }
}

async function loadAppliedCoupon() {
    const code = localStorage.getItem("appliedCoupon")
    if (!code) return

    try {
        const response = await fetch(`${API_BASE}/coupons`)
        if (!response.ok) throw new Error("failed to fetch coupons")
        const coupons = await response.json()
        appliedCoupon = coupons.find(c => c.code === code) || null
    } catch (error) {
        console.log("error", error)
    }
}

function renderCheckoutSummary() {
    checkoutItems.innerHTML = cart.map(item => {
        // the stored cart snapshot can point at a stale/renamed image path if the
        // catalog changed since it was added - prefer the live product's image
        const liveProduct = allProducts.find(p => p.id === item.id);
        const displayImage = getProductImage(liveProduct) !== "images/watches/placeholder.svg"
            ? getProductImage(liveProduct)
            : getProductImage(item);
        return `
        <div class="checkout-item">
            <img src="${displayImage}" alt="${item.name}" onerror="this.onerror=null;this.src='images/watches/placeholder.svg'" />
            <div class="checkout-item-info">
                <p class="checkout-item-name">${item.name}</p>
                <p class="checkout-item-qty">Qty: ${item.quantity}</p>
            </div>
            <p class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
        </div>
    `
    }).join("")

    const subtotal = getCartSubtotal()
    const discountRate = appliedCoupon ? appliedCoupon.discount / 100 : 0
    const discountValue = subtotal * discountRate
    const delivery = subtotal > 0 ? 50 : 0
    const total = subtotal - discountValue + delivery

    checkoutSubtotal.textContent = `${subtotal.toFixed(2)} USD`
    checkoutDiscount.textContent = `-${discountValue.toFixed(2)} USD`
    checkoutDiscountText.textContent = appliedCoupon ? `(${appliedCoupon.code})` : ""
    checkoutDelivery.textContent = `${delivery.toFixed(2)} USD`
    checkoutTotal.textContent = `$${total.toFixed(2)} USD`
}

//==============================================
// validation
//==============================================

const validators = {
    custName: (value) => {
        if (!value.trim()) return "Name is required"
        if (!/^[A-Za-z\s'-]{2,}$/.test(value.trim())) return "Enter a valid name (letters only, min 2 characters)"
        return ""
    },
    custEmail: (value) => {
        if (!value.trim()) return "Email is required"
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())) return "Enter a valid email address"
        return ""
    },
    custPhone: (value) => {
        if (!value.trim()) return "Phone number is required"
        const digits = value.replace(/\D/g, "")
        if (digits.length < 7 || digits.length > 15) return "Enter a valid phone number"
        if (!/^[+]?[\d\s()-]+$/.test(value.trim())) return "Phone number contains invalid characters"
        return ""
    },
    custAddress: (value) => value.trim() ? "" : "Street address is required",
    custCity: (value) => value.trim() ? "" : "City is required",
    custState: (value) => value.trim() ? "" : "State is required",
    custZip: (value) => {
        if (!value.trim()) return "ZIP code is required"
        if (!/^[A-Za-z0-9\s-]{3,10}$/.test(value.trim())) return "Enter a valid ZIP code"
        return ""
    },
    custCountry: (value) => value.trim() ? "" : "Country is required",
}

function validateField(id) {
    const input = document.querySelector(`#${id}`)
    const errorEl = document.querySelector(`#${id}Error`)
    const message = validators[id](input.value)

    input.classList.toggle("invalid", !!message)
    errorEl.textContent = message

    return !message
}

Object.keys(validators).forEach(id => {
    const input = document.querySelector(`#${id}`)
    input.addEventListener("blur", () => validateField(id))
    input.addEventListener("input", () => {
        if (input.classList.contains("invalid")) validateField(id)
    })
})

function validateForm() {
    const results = Object.keys(validators).map(id => validateField(id))
    const allValid = results.every(Boolean)

    if (!allValid) {
        const firstInvalid = document.querySelector(".invalid")
        firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" })
        firstInvalid?.focus()
    }

    return allValid
}

//==============================================
// place order
//==============================================

checkoutForm.addEventListener("submit", async (e) => {
    e.preventDefault()

    if (!cart.length) {
        showToast("Your cart is empty", "error")
        return
    }

    if (!validateForm()) {
        showToast("Please fix the errors in the form", "error")
        return
    }

    const subtotal = getCartSubtotal()
    const discountRate = appliedCoupon ? appliedCoupon.discount / 100 : 0
    const discountValue = subtotal * discountRate
    const delivery = subtotal > 0 ? 50 : 0
    const total = subtotal - discountValue + delivery

    const order = {
        items: cart,
        customer: {
            name: document.querySelector("#custName").value.trim(),
            email: document.querySelector("#custEmail").value.trim(),
            phone: document.querySelector("#custPhone").value.trim(),
            address: {
                street: document.querySelector("#custAddress").value.trim(),
                city: document.querySelector("#custCity").value.trim(),
                state: document.querySelector("#custState").value.trim(),
                zip: document.querySelector("#custZip").value.trim(),
                country: document.querySelector("#custCountry").value.trim(),
            },
        },
        couponCode: appliedCoupon ? appliedCoupon.code : null,
        subtotal,
        discount: discountValue,
        delivery,
        total,
        date: new Date().toISOString(),
    }

    placeOrderBtn.disabled = true
    placeOrderBtn.textContent = "Placing order..."

    try {
        const response = await fetch(`${API_BASE}/orders`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(order),
        })

        if (!response.ok) throw new Error("failed to place order")

        const savedOrder = await response.json()

        localStorage.setItem("lastOrder", JSON.stringify(savedOrder))
        localStorage.setItem("cart", JSON.stringify([]))
        localStorage.removeItem("appliedCoupon")

        window.location.href = "order-confirmation.html"

    } catch (error) {
        console.log("error", error)
        showToast("Could not place order. Please try again.", "error")
        placeOrderBtn.disabled = false
        placeOrderBtn.innerHTML = `<i class="fa-solid fa-lock"></i> Place Order`
    }
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

//==============================================
// init
//==============================================

(async function init() {
    if (!cart.length) {
        checkoutEmpty.hidden = false
        checkoutGrid.style.display = "none"
        return
    }
    await Promise.all([loadAppliedCoupon(), loadAllProducts()])
    renderCheckoutSummary()
})()
