console.log("order confirmation page")

function getProductImage(product, view = "front") {
    return product?.images?.[view] || product?.images?.front || "images/watches/placeholder.svg"
}

const themeBtn = document.querySelector(".theme-btn");
const confirmationContent = document.querySelector("#confirmationContent");

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
// render order
//==============================================

function formatAddress(address) {
    return [address.street, address.city, address.state, address.zip, address.country]
        .filter(Boolean)
        .join(", ")
}

function renderOrder(order) {
    const orderDate = new Date(order.date).toLocaleDateString(undefined, {
        year: "numeric", month: "long", day: "numeric",
    })

    confirmationContent.innerHTML = `
        <div class="confirmation-box">
            <span class="material-symbols-outlined confirmation-icon">check_circle</span>
            <h1>Order Confirmed!</h1>
            <p class="confirmation-subtext">Thank you, ${order.customer.name}. Your order has been placed successfully.</p>

            <div class="confirmation-meta">
                <div>
                    <span class="meta-label">Order ID</span>
                    <span class="meta-value">#${order.id}</span>
                </div>
                <div>
                    <span class="meta-label">Order Date</span>
                    <span class="meta-value">${orderDate}</span>
                </div>
            </div>

            <div class="confirmation-section">
                <h2>Items</h2>
                <div class="checkout-items">
                    ${order.items.map(item => `
                        <div class="checkout-item">
                            <img src="${getProductImage(item)}" alt="${item.name}" />
                            <div class="checkout-item-info">
                                <p class="checkout-item-name">${item.name}</p>
                                <p class="checkout-item-qty">Qty: ${item.quantity}</p>
                            </div>
                            <p class="checkout-item-price">$${(item.price * item.quantity).toFixed(2)}</p>
                        </div>
                    `).join("")}
                </div>

                <div class="prize-details">
                    <div class="p-item">
                        <p>Sub Total</p>
                        <span>${order.subtotal.toFixed(2)} USD</span>
                    </div>
                    <div class="p-item">
                        <p>Discount ${order.couponCode ? `(${order.couponCode})` : ""}</p>
                        <span class="green">-${order.discount.toFixed(2)} USD</span>
                    </div>
                    <div class="p-item">
                        <p>Delivery</p>
                        <span>${order.delivery.toFixed(2)} USD</span>
                    </div>
                </div>
                <div class="p-total">
                    <p>Total Paid</p>
                    <span>$${order.total.toFixed(2)} USD</span>
                </div>
            </div>

            <div class="confirmation-section">
                <h2>Shipping To</h2>
                <p class="confirmation-address">
                    ${order.customer.name}<br />
                    ${formatAddress(order.customer.address)}<br />
                    ${order.customer.email} &middot; ${order.customer.phone}
                </p>
            </div>

            <a href="index.html#shopSection" class="btn continue-shopping-btn">Continue Shopping</a>
        </div>
    `
}

//==============================================
// init
//==============================================

const lastOrder = JSON.parse(localStorage.getItem("lastOrder"))

if (lastOrder) {
    renderOrder(lastOrder)
} else {
    confirmationContent.innerHTML = `
        <div class="confirmation-box">
            <span class="material-symbols-outlined confirmation-icon">receipt_long</span>
            <h1>No order found</h1>
            <p class="confirmation-subtext">We couldn't find a recent order to show.</p>
            <a href="index.html#shopSection" class="btn continue-shopping-btn">Continue Shopping</a>
        </div>
    `
}
