console.log("cart page")

// local dev keeps using json-server on :3000 (npm run start:api); any other
// host (e.g. the Vercel deployment) uses the bundled /api serverless functions
const API_BASE = ["localhost", "127.0.0.1"].includes(location.hostname) ? "http://localhost:3000" : "/api";

function getProductImage(product, view = "front") {
    return product?.images?.[view] || product?.images?.front || "images/watches/placeholder.svg"
}

//==============================================
// DOM references
//==============================================

// -------- navbar / theme / search --------
const menuBtn = document.querySelector(".menu-btn");
const mobileMenu = document.querySelector("#mobileMenu");
const menuIcon = menuBtn.querySelector(".material-symbols-outlined");
const themeBtn = document.querySelector(".theme-btn");
const mobileThemeToggle = document.querySelector("#mobileThemeToggle");
const mobileThemeIcon = document.querySelector("#mobileThemeIcon");
const searchInput = document.querySelector("#SearchInput")
const searchClearBtn = document.querySelector("#searchClearBtn")
const searchSuggestions = document.querySelector("#searchSuggestions")
const navLinks = document.querySelectorAll(".nav-link");
const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
const contactForm = document.querySelector("#contactForm");

// -------- back to top --------
const backToTopBtn = document.querySelector("#backToTopBtn");

// -------- product comparison --------
const compareBar = document.querySelector("#compareBar");
const compareChips = document.querySelector("#compareChips");
const compareViewBtn = document.querySelector("#compareViewBtn");
const compareClearBtn = document.querySelector("#compareClearBtn");
const compareModalOverlay = document.querySelector("#compareModalOverlay");
const compareModalBody = document.querySelector("#compareModalBody");
const compareModalClose = document.querySelector("#compareModalClose");

// -------- products / pagination / category --------
const productList = document.querySelector(".product-list");
const noResultsMessage = document.querySelector("#noResultsMessage");
const fetchErrorMessage = document.querySelector("#fetchErrorMessage");
const retryFetchBtn = document.querySelector("#retryFetchBtn");
const previousBtn = document.querySelector("#previousBtn");
const nextBtn = document.querySelector("#nextBtn");
const pageNumbers = document.querySelector("#pageNumbers");
const categoriesBar = document.querySelector(".category-bar")
const sortWrapper = document.querySelector("#sortWrapper");
const sortTrigger = document.querySelector("#sortTrigger");
const sortValue = document.querySelector("#sortValue");
const sortOptions = document.querySelector("#sortOptions");
const categoriesGrid = document.querySelector("#categoriesGrid");
const statProductCount = document.querySelector("#statProductCount");
const statCategoryCount = document.querySelector("#statCategoryCount");
const statAvgRating = document.querySelector("#statAvgRating");

// -------- cart --------
const cartBtn = document.querySelector("header .cart-btn");
const cartPage = document.querySelector(".cart-page");
const cartClose = document.querySelector(".cart-close")
const cartCount = document.querySelector(".cart-count")
const productDetails = document.querySelector(".product-details table tbody")
const cartItems = document.querySelector(".cart-page .cart-items")
const clearCartBtn = document.querySelector("#clearCartBtn")
const checkoutBtn = document.querySelector(".check-out")

// -------- confirm modal --------
const confirmModalOverlay = document.querySelector("#confirmModalOverlay")
const confirmModalMessage = document.querySelector("#confirmModalMessage")
const confirmModalConfirmBtn = document.querySelector("#confirmModalConfirm")
const confirmModalCancelBtn = document.querySelector("#confirmModalCancel")

// -------- wishlist --------
const whishBtn = document.querySelector("header .whish-btn");
const whishCount = document.querySelector(".whish-count");
const mobileCount = document.querySelector(".mobile-count");
const wishlistPage = document.querySelector(".wishlist-page");
const wishlistClose = document.querySelector(".wishlist-close");
const wishlistGrid = document.querySelector("#wishlistGrid");
const wishlistItems = document.querySelector(".wishlist-page .wishlist-items")

// -------- mobile/tablet filter drawer --------
const mobileFilterBtn = document.querySelector("#mobileFilterBtn");
const filterSidebar = document.querySelector("#filterSidebar");
const filterOverlay = document.querySelector("#filterOverlay");
const filterClose = document.querySelector("#filterClose");

// -------- mobile/tablet bottom toolbar: categories / sort --------
const mobileCategoriesBtn = document.querySelector("#mobileCategoriesBtn");
const mobileSortBtn = document.querySelector("#mobileSortBtn");

// -------- sidebar filters: color / price / apply / clear --------
const colorOptionsBar = document.querySelector(".color-options");
const minPriceRange = document.querySelector("#minPriceRange");
const maxPriceRange = document.querySelector("#maxPriceRange");
const minPriceInput = document.querySelector("#minPrice");
const maxPriceInput = document.querySelector("#maxPrice");
const sliderTrack = document.querySelector(".slider-track");
const priceLabelMin = document.querySelector(".price-label span:first-child");
const priceLabelMax = document.querySelector(".price-label span:last-child");
const applyFiltersBtn = document.querySelector("#applyFilters");
const clearFiltersBtn = document.querySelector("#clearFilters");
const filterCountBadge = document.querySelector("#filterCountBadge");

// -------- order summary / offers / coupon --------
const subTotal = document.querySelector(".s-total");
const discount = document.querySelector(".discount");
const delivery = document.querySelector(".delivery");
const total = document.querySelector(".total");
const availableOffers = document.querySelector(".available-offers .offer-list")
const appliedOfferList = document.querySelector(".applied-offer-list");
const discountText = document.querySelector('.dis-text');
const couponInput = document.querySelector(".discount-form input")
const applyBtn = document.querySelector(".discount-form .btn")

//==============================================
// state
//==============================================

let allProducts = []
let products = []
let currentPage = 1;
const productsPerPage = 8;

const filters = {
    search: "",
    category: "",
    color: "",
    minPrice: "",
    maxPrice: "",
    sortBy: "popular"
}

let offers = [];

//==============================================
// navbar / theme
//==============================================

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

// ------------------------nav links (desktop + mobile) ------------------------------

function handleNavClick(e) {
    navLinks.forEach(l => l.classList.remove("active"))
    mobileNavLinks.forEach(l => l.classList.remove("active"))

    const href = e.currentTarget.getAttribute("href")
    document.querySelectorAll(`.nav-link[href="${href}"], .mobile-nav-link[href="${href}"]`).forEach(l => l.classList.add("active"))

    mobileMenu.classList.remove("active")
    menuIcon.textContent = "menu"
}

navLinks.forEach(link => link.addEventListener("click", handleNavClick))
mobileNavLinks.forEach(link => link.addEventListener("click", handleNavClick))

// ------------------------contact form ------------------------------

contactForm?.addEventListener("submit", (e) => {
    e.preventDefault()
    contactForm.reset()
    showToast("Message sent! We'll get back to you soon.", "success")
})

//==============================================
// products / pagination / category
//==============================================

// -----------------------------skeleton loading -------------

function renderProductSkeletons(count = productsPerPage) {
    noResultsMessage?.classList.remove("show")
    productList.classList.remove("hidden")
    productList.innerHTML = Array.from({ length: count }).map(() => `
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

// -----------------------------fetching products from json file -------------
async function getProduct() {
    fetchErrorMessage.classList.remove("show")
    productList.classList.remove("hidden")
    renderProductSkeletons()

    let fetchedProducts
    try {
        let response = await fetch(`${API_BASE}/products`);
        if (!response.ok) throw new Error("faild to fetch products");
        fetchedProducts = await response.json()
    } catch (error) {
        console.log("error", error)
        noResultsMessage.classList.remove("show")
        productList.classList.add("hidden")
        fetchErrorMessage.classList.add("show")
        return
    }

    allProducts = fetchedProducts
    products = sortProducts(allProducts)

    currentPage = 1;
    createFilterOptions()
    createColorFilterOptions()
    renderCategoriesSection()
    renderAboutStats()
    displayProducts()
    createPagination()
    toggleNoResultsMessage()
    renderCompareBar()

    if (location.hash) {
        document.querySelector(location.hash)?.scrollIntoView({ behavior: "instant", block: "start" })
    }
}

retryFetchBtn?.addEventListener("click", () => getProduct())

// --------------------category of watches ------------------------

function createFilterOptions() {
    let categories = ["All", ...new Set(allProducts.map(product => product.category))]

    categoriesBar.innerHTML = categories.map(category => `
        <button class="category-pill ${category === (filters.category || "All") ? "active" : ""}" data-category="${category}">${category}</button>
    `).join("")

    categoriesBar.querySelectorAll(".category-pill").forEach(pill => {
        pill.addEventListener("click", () => {
            const category = pill.dataset.category

            filters.category = category === "All" ? "" : category

            categoriesBar.querySelectorAll(".category-pill").forEach(p => p.classList.remove("active"))
            pill.classList.add("active")

            closeMobileCategories()
            getFilteredProducts()
        })
    })
}

// --------------------categories showcase section (built from product data)------------------

function renderCategoriesSection() {
    const categories = [...new Set(allProducts.map(product => product.category))]

    categoriesGrid.innerHTML = categories.map(category => {
        const productsInCategory = allProducts.filter(product => product.category === category)
        const preview = productsInCategory.find(product => product.featured) || productsInCategory[0]

        return `
            <button class="category-card" data-category="${category}">
                <div class="category-card-image">
                    <img src="${getProductImage(preview)}" alt="${category}" />
                </div>
                <h3>${category}</h3>
                <p>${productsInCategory.length} watch${productsInCategory.length === 1 ? "" : "es"}</p>
            </button>
        `
    }).join("")

    categoriesGrid.querySelectorAll(".category-card").forEach(card => {
        card.addEventListener("click", () => {
            filters.category = card.dataset.category
            document.querySelector("#shopSection").scrollIntoView({ behavior: "smooth", block: "start" })
            createFilterOptions()
            getFilteredProducts()
        })
    })
}

// --------------------about stats------------------

function renderAboutStats() {
    statProductCount.textContent = allProducts.length
    statCategoryCount.textContent = new Set(allProducts.map(p => p.category)).size
    const avg = allProducts.reduce((sum, p) => sum + p.rating, 0) / (allProducts.length || 1)
    statAvgRating.textContent = avg.toFixed(1)
}

// --------------------color filter------------------

function createColorFilterOptions() {
    let colors = [...new Set(allProducts.map(product => product.color))]

    colorOptionsBar.innerHTML = `
        <button class="color-option ${!filters.color ? "active" : ""}" data-color="" aria-label="All colors"></button>
        ${colors.map(color => `
            <button
                class="color-option ${color.toLowerCase().replace(/\s+/g, "-")} ${filters.color === color ? "active" : ""}"
                data-color="${color}"
                aria-label="${color}"
            ></button>
        `).join("")}
    `

    colorOptionsBar.querySelectorAll(".color-option").forEach(swatch => {
        swatch.addEventListener("click", () => {
            filters.color = swatch.dataset.color

            colorOptionsBar.querySelectorAll(".color-option").forEach(s => s.classList.remove("active"))
            swatch.classList.add("active")
            updateFilterCountBadge()
        })
    })
}

// --------------------filter group collapse / active count------------------

document.querySelectorAll(".filter-group-header").forEach(header => {
    header.addEventListener("click", () => {
        header.closest(".filter-group").classList.toggle("collapsed")
    })
})

function updateFilterCountBadge() {
    const priceIsDefault = (!filters.minPrice || Number(filters.minPrice) <= Number(minPriceRange.min))
        && (!filters.maxPrice || Number(filters.maxPrice) >= Number(minPriceRange.max))

    const activeCount = (filters.color ? 1 : 0) + (priceIsDefault ? 0 : 1)

    filterCountBadge.textContent = activeCount
    filterCountBadge.classList.toggle("show", activeCount > 0)
    clearFiltersBtn.disabled = activeCount === 0
}

// --------------------price range filter------------------

function updatePriceRangeUI() {
    const min = parseInt(minPriceRange.value)
    const max = parseInt(maxPriceRange.value)
    const range = parseInt(minPriceRange.max) - parseInt(minPriceRange.min)

    const leftPct = ((min - minPriceRange.min) / range) * 100
    const rightPct = ((max - minPriceRange.min) / range) * 100

    sliderTrack.style.left = `${leftPct}%`
    sliderTrack.style.width = `${rightPct - leftPct}%`

    priceLabelMin.textContent = `$${min}`
    priceLabelMax.textContent = `$${max}`
    minPriceInput.value = min
    maxPriceInput.value = max

    filters.minPrice = min
    filters.maxPrice = max
    updateFilterCountBadge()
}

minPriceRange.addEventListener("input", () => {
    if (parseInt(minPriceRange.value) > parseInt(maxPriceRange.value)) {
        minPriceRange.value = maxPriceRange.value
    }
    updatePriceRangeUI()
})

maxPriceRange.addEventListener("input", () => {
    if (parseInt(maxPriceRange.value) < parseInt(minPriceRange.value)) {
        maxPriceRange.value = minPriceRange.value
    }
    updatePriceRangeUI()
})

minPriceInput.addEventListener("input", () => {
    let value = Math.min(parseInt(minPriceInput.value) || parseInt(minPriceRange.min), parseInt(maxPriceRange.value))
    minPriceRange.value = value
    updatePriceRangeUI()
})

maxPriceInput.addEventListener("input", () => {
    let value = Math.max(parseInt(maxPriceInput.value) || parseInt(maxPriceRange.max), parseInt(minPriceRange.value))
    maxPriceRange.value = value
    updatePriceRangeUI()
})

updatePriceRangeUI()

// --------------------apply / clear filters------------------

applyFiltersBtn.addEventListener("click", () => {
    getFilteredProducts()

    if (window.innerWidth <= 992) {
        closeFilterSidebar()
    }
})

clearFiltersBtn.addEventListener("click", () => {
    filters.color = ""

    minPriceRange.value = minPriceRange.min
    maxPriceRange.value = maxPriceRange.max
    updatePriceRangeUI()
    filters.minPrice = ""
    filters.maxPrice = ""

    colorOptionsBar.querySelectorAll(".color-option").forEach(s => s.classList.remove("active"))
    colorOptionsBar.querySelector(`.color-option[data-color=""]`).classList.add("active")

    updateFilterCountBadge()
    getFilteredProducts()
})

// ----------filter------------

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

// ---------------- product card helpers -----------------------

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

// ---------------- display products after fetch -----------------------

function displayProducts() {

    productList.innerHTML = "";

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const currentProducts = products.slice(startIndex, endIndex)

    currentProducts.forEach(item => {
        let card = document.createElement("div");
        card.classList.add("product-item")
        card.innerHTML = `  <div class="pro-image ${isWishlisted(item.id) ? "whish-list" : ""}">
           ${item.isNew ? `<span class="new-badge">NEW</span>` : ""}
                                    <img src="${getProductImage(item)}" alt="${item.name}" />
                                    <span class="material-symbols-outlined icons">favorite </span>
                                    <div class="compare-checkbox-wrap">
                                        <label onclick="event.stopPropagation()">
                                            <input type="checkbox" class="compare-checkbox" value="${item.id}" ${isComparing(item.id) ? "checked" : ""} />
                                            Compare
                                        </label>
                                    </div>
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
        productList.appendChild(card)

        updatePaginationButtons()

        card.querySelector(".pro-image").addEventListener("click", (e) => {
            if (e.target.closest(".icons") || e.target.closest(".compare-checkbox-wrap")) return;
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

        card.querySelector(".compare-checkbox").addEventListener("click", (e) => e.stopPropagation());
        card.querySelector(".compare-checkbox").addEventListener("change", () => toggleCompare(item.id));

    });

}

// -----------------------filter ----------------------------

function getFilteredProducts() {
    const filtered = allProducts.filter(product => {
        const matchesSearch = matchesSearchTerm(product, filters.search)
        const matchesCategory = !filters.category || product.category === filters.category
        const matchesColor = !filters.color || product.color === filters.color
        const matchesMinPrice = !filters.minPrice || product.price >= Number(filters.minPrice)
        const matchesMaxPrice = !filters.maxPrice || product.price <= Number(filters.maxPrice)

        return matchesSearch && matchesCategory && matchesColor && matchesMinPrice && matchesMaxPrice
    })

    products = sortProducts(filtered);

    currentPage = 1;

    displayProducts();
    createPagination();
    toggleNoResultsMessage();
}

function toggleNoResultsMessage() {
    if (!noResultsMessage) return
    const isEmpty = products.length === 0
    noResultsMessage.classList.toggle("show", isEmpty)
    productList.classList.toggle("hidden", isEmpty)
}

// --------------------------search Input ------------------------------

function updateSearchClearBtn() {
    searchClearBtn?.classList.toggle("show", searchInput.value.length > 0)
}

function renderSearchSuggestions(query) {
    if (!searchSuggestions) return

    if (!query.trim()) {
        searchSuggestions.classList.remove("show")
        searchSuggestions.innerHTML = ""
        return
    }

    const matches = allProducts.filter(product => matchesSearchTerm(product, query)).slice(0, 5)

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

searchInput.addEventListener("input", () => {
    filters.search = searchInput.value.trim()
    updateSearchClearBtn()
    getFilteredProducts()
    renderSearchSuggestions(filters.search)
})

searchInput.addEventListener("focus", () => {
    if (searchInput.value.trim()) renderSearchSuggestions(searchInput.value)
})

searchInput.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && searchInput.value) {
        searchInput.value = ""
        filters.search = ""
        updateSearchClearBtn()
        getFilteredProducts()
        searchSuggestions?.classList.remove("show")
    }
})

searchClearBtn?.addEventListener("click", () => {
    searchInput.value = ""
    filters.search = ""
    updateSearchClearBtn()
    getFilteredProducts()
    searchSuggestions?.classList.remove("show")
    searchInput.focus()
})

document.addEventListener("click", (e) => {
    if (!e.target.closest(".nav-search")) {
        searchSuggestions?.classList.remove("show")
    }
})

// --------------------------sort by ------------------------------

function sortProducts(list) {
    const sorted = [...list]

    switch (filters.sortBy) {
        case "price-low":
            sorted.sort((a, b) => a.price - b.price)
            break
        case "price-high":
            sorted.sort((a, b) => b.price - a.price)
            break
        case "rating":
            sorted.sort((a, b) => b.rating - a.rating || b.reviews - a.reviews)
            break
        case "newest":
            sorted.sort((a, b) => b.isNew - a.isNew || b.id - a.id)
            break
        default:
            sorted.sort((a, b) => b.featured - a.featured || b.reviews - a.reviews)
    }

    return sorted
}

function updateToolbarActiveStates() {
    mobileSortBtn.classList.toggle("active", sortWrapper.classList.contains("open"))
    mobileCategoriesBtn.classList.toggle("active", categoriesBar.classList.contains("mobile-open"))
}

function toggleSortDropdown() {
    sortWrapper.classList.toggle("open")
    updateToolbarActiveStates()
}

function closeSortDropdown() {
    sortWrapper.classList.remove("open")
    updateToolbarActiveStates()
}

function toggleMobileCategories() {
    categoriesBar.classList.toggle("mobile-open")
    updateToolbarActiveStates()
}

function closeMobileCategories() {
    categoriesBar.classList.remove("mobile-open")
    updateToolbarActiveStates()
}

sortTrigger.addEventListener("click", toggleSortDropdown)
mobileSortBtn.addEventListener("click", toggleSortDropdown)
mobileCategoriesBtn.addEventListener("click", toggleMobileCategories)

sortOptions.querySelectorAll("li").forEach(option => {
    option.addEventListener("click", () => {
        filters.sortBy = option.dataset.sort
        sortValue.textContent = option.textContent
        sortOptions.querySelectorAll("li").forEach(o => o.classList.remove("active"))
        option.classList.add("active")
        closeSortDropdown()
        getFilteredProducts()
    })
})

document.addEventListener("click", (e) => {
    if (!e.target.closest(".sort-wrapper")) closeSortDropdown()
    if (!e.target.closest(".category-bar") && !e.target.closest("#mobileCategoriesBtn")) closeMobileCategories()
})

document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
        closeSortDropdown()
        closeMobileCategories()
    }
})

// --------------------------mobile filter sidebar ------------------------------

function openFilterSidebar() {
    filterSidebar.classList.add("active")
    filterOverlay.classList.add("active")
}

function closeFilterSidebar() {
    filterSidebar.classList.remove("active")
    filterOverlay.classList.remove("active")
}

mobileFilterBtn?.addEventListener("click", openFilterSidebar)
filterClose?.addEventListener("click", closeFilterSidebar)
filterOverlay?.addEventListener("click", closeFilterSidebar)

// -----------------------------pagination -------------

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

            document.querySelector("#shopSection").scrollIntoView({
                behavior: "smooth",
                block: "start"
            });
        })
        pageNumbers.appendChild(button)
    }
}

previousBtn.addEventListener("click", () => {
    if (currentPage > 1) {
        currentPage--
        displayProducts()
        createPagination()
        document.querySelector("#shopSection").scrollIntoView({
            behavior: "smooth",
            block: "start"
        });
    }
})

nextBtn.addEventListener("click", () => {
    let totalPages = Math.ceil(products.length / productsPerPage)
    if (currentPage < totalPages) {
        currentPage++
        displayProducts()
        createPagination()
        document.querySelector("#shopSection").scrollIntoView({
            behavior: "smooth",
            block: "start"
        })
    }
})

function updatePaginationButtons() {
    const totalPages = Math.ceil(products.length / productsPerPage);
    previousBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages
}

//==============================================
// cart
//==============================================

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

    let price = []
    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    clearCartBtn.disabled = cart.length === 0

    if (!cart.length) {
        cartItems.classList.remove("show")
    } else {
        cartItems.classList.add("show")

        cart.forEach(item => {
            // cart entries are localStorage snapshots taken when the item was added,
            // so an older snapshot can be missing fields (like keyPoints) or point at
            // a stale/renamed image path if the catalog changed since - patch the
            // display-only fields in from the live product when available, while
            // keeping the stored price/quantity as the source of truth for the cart
            const liveProduct = allProducts.find(p => p.id === item.id);
            const displayImage = getProductImage(liveProduct) !== "images/watches/placeholder.svg"
                ? getProductImage(liveProduct)
                : getProductImage(item);
            const keyPoints = item.keyPoints || liveProduct?.keyPoints || [];
            let tr = document.createElement("tr");
            tr.innerHTML = `
              <td>
                <div class="product">
                  <img src="${displayImage}" class="pImage" alt="" onerror="this.onerror=null;this.src='images/watches/placeholder.svg'" />

                  <div class="img-det">
                    <p>${item.name}</p>
                    <span>${keyPoints.join(", ")}</span>
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


//==============================================
// wishlist
//==============================================

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

    wishlist.forEach(storedItem => {
        // wishlist entries are localStorage snapshots taken whenever the item was
        // added, so if the product catalog/images have changed since, that snapshot
        // can point at stale/broken image paths - always prefer the live product
        // data when it's still available, and only fall back to the snapshot for
        // products that have since been removed from the catalog
        const item = allProducts.find(p => p.id === storedItem.id) || storedItem;
        let card = document.createElement("div");
        card.classList.add("product-item")
        card.innerHTML = `  <div class="pro-image whish-list">
                                    ${item.isNew ? `<span class="new-badge">NEW</span>` : ""}
                                    <img src="${getProductImage(item)}" alt="${item.name}" onerror="this.onerror=null;this.src='images/watches/placeholder.svg'" />
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
        wishlistGrid.appendChild(card)

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
            toggleWishlist(item);
            renderWishlistPage();
            showToast("Removed from wishlist", "error");
        });
    });
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

//==============================================
// order summary / offers / coupon
//==============================================

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
        const response = await fetch(`${API_BASE}/coupons`)
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

//==============================================
// product comparison
//==============================================

function getCompareList() {
    return JSON.parse(localStorage.getItem("compareList")) || []
}

function isComparing(id) {
    return getCompareList().includes(id)
}

function toggleCompare(id) {
    let list = getCompareList()

    if (list.includes(id)) {
        list = list.filter(cid => cid !== id)
    } else {
        if (list.length >= 3) {
            showToast("You can compare up to 3 watches", "error")
            return
        }
        list.push(id)
    }

    localStorage.setItem("compareList", JSON.stringify(list))
    renderCompareBar()
    document.querySelectorAll(`.compare-checkbox[value="${id}"]`).forEach(cb => cb.checked = list.includes(id))
}

function renderCompareBar() {
    if (!compareBar) return
    const list = getCompareList()
    const items = list.map(id => allProducts.find(p => p.id === id)).filter(Boolean)

    compareBar.classList.toggle("show", items.length > 0)
    compareChips.innerHTML = items.map(item => `
        <div class="compare-chip" data-id="${item.id}">
            ${item.name}
            <span class="remove-chip" data-id="${item.id}">&times;</span>
        </div>
    `).join("")

    compareChips.querySelectorAll(".remove-chip").forEach(el => {
        el.addEventListener("click", () => toggleCompare(el.dataset.id))
    })

    compareViewBtn.disabled = items.length < 2
}

function renderCompareModal() {
    const list = getCompareList()
    const items = list.map(id => allProducts.find(p => p.id === id)).filter(Boolean)

    if (items.length < 2) {
        showToast("Select at least 2 watches to compare", "error")
        return
    }

    const specKeys = [...new Set(items.flatMap(item => Object.keys(item.specifications || {})))]

    compareModalBody.innerHTML = `
        <div style="overflow-x:auto">
        <table class="compare-table">
            <tr>
                <th></th>
                ${items.map(item => `
                    <td class="compare-product-col">
                        <img src="${getProductImage(item)}" alt="${item.name}" />
                        <div>${item.name}</div>
                        <button type="button" class="compare-remove-btn" data-id="${item.id}">Remove</button>
                    </td>
                `).join("")}
            </tr>
            <tr>
                <th>Price</th>
                ${items.map(item => `<td>$${item.price}</td>`).join("")}
            </tr>
            <tr>
                <th>Category</th>
                ${items.map(item => `<td>${item.category}</td>`).join("")}
            </tr>
            <tr>
                <th>Rating</th>
                ${items.map(item => `<td>${item.rating} (${item.reviews})</td>`).join("")}
            </tr>
            ${specKeys.map(key => `
                <tr>
                    <th>${formatSpecKey(key)}</th>
                    ${items.map(item => `<td>${item.specifications?.[key] ?? "-"}</td>`).join("")}
                </tr>
            `).join("")}
            <tr>
                <th></th>
                ${items.map(item => `
                    <td>
                        <button type="button" class="btn compare-add-to-cart" data-id="${item.id}" ${item.stock <= 0 ? "disabled" : ""}>
                            ${item.stock <= 0 ? "Out of stock" : "Add to cart"}
                        </button>
                    </td>
                `).join("")}
            </tr>
        </table>
        </div>
    `

    compareModalBody.querySelectorAll(".compare-remove-btn").forEach(btn => {
        btn.addEventListener("click", () => {
            toggleCompare(btn.dataset.id)
            renderCompareModal()
        })
    })

    compareModalBody.querySelectorAll(".compare-add-to-cart").forEach(btn => {
        btn.addEventListener("click", () => {
            const item = allProducts.find(p => p.id === btn.dataset.id)
            if (item && addToCart(item)) showToast("Product added to cart", "success")
        })
    })

    compareModalOverlay.classList.add("show")
}

function formatSpecKey(key) {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/^./, str => str.toUpperCase())
}

compareViewBtn?.addEventListener("click", renderCompareModal)

compareClearBtn?.addEventListener("click", () => {
    localStorage.setItem("compareList", JSON.stringify([]))
    renderCompareBar()
    document.querySelectorAll(".compare-checkbox").forEach(cb => cb.checked = false)
})

compareModalClose?.addEventListener("click", () => {
    compareModalOverlay.classList.remove("show")
})

compareModalOverlay?.addEventListener("click", (e) => {
    if (e.target === compareModalOverlay) compareModalOverlay.classList.remove("show")
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


//==============================================
// init
//==============================================

getProduct()
updateCartCount()
updateWishlistCount()
getCoupons()
