import { seats } from './data.js'

const TotalRow = 10
const STORAGE_KEY = "seatBookingState"

// ---------------------------------------------------------------------
// Pure logic (no DOM). Exported so app.test.js can exercise each function
// independently, without needing a browser.
// ---------------------------------------------------------------------

// Must stay sorted by ascending maxRow — getTier() relies on the first
// tier whose maxRow the seat's row satisfies.
export const PRICE_TIERS = [
    { maxRow: 3, type: "Premium", price: 20 },
    { maxRow: 7, type: "Standard", price: 12 },
    { maxRow: 10, type: "Economy", price: 8 },
]

export const getTier = (row) => PRICE_TIERS.find(tier => row <= tier.maxRow)
export const getSeatPrice = (row) => getTier(row).price
export const getSeatType = (row) => getTier(row).type
export const getTotal = (seatList) => seatList.reduce((sum, seat) => sum + getSeatPrice(seat.row), 0)

export const getPriceBreakdown = (seatList) => {
    const breakdown = {}
    seatList.forEach(seat => {
        const type = getSeatType(seat.row)
        const price = getSeatPrice(seat.row)
        if (!breakdown[type]) breakdown[type] = { count: 0, price }
        breakdown[type].count++
    })
    return breakdown
}

export const getAvailableCount = (seatList) =>
    seatList.filter(seat => !seat.booked && !seat.selected).length

export const getBookedCount = (seatList) =>
    seatList.filter(seat => seat.booked).length

const findAvailableSeatsInRow = (seatList, row) =>
    seatList.filter(seat => seat.row === row && !seat.booked && !seat.selected)

// Row-by-row seat picker: fills each row from the front before moving to the
// next one (so a group gets adjacent seats), and remembers any leftover free
// seats in partially-filled rows. If scanning every row still isn't enough
// (seats are scattered thin across many partially-booked rows), it falls
// back to those leftovers to make up the rest.
export const assignSeats = (seatList, totalRows, count) => {
    const assigned = []
    const leftover = []
    let remaining = count

    for (let row = 1; row <= totalRows && remaining > 0; row++) {
        const rowSeats = findAvailableSeatsInRow(seatList, row)
        const takeCount = Math.min(remaining, rowSeats.length)

        assigned.push(...rowSeats.slice(0, takeCount))
        leftover.push(...rowSeats.slice(takeCount))
        remaining -= takeCount
    }

    while (remaining > 0 && leftover.length > 0) {
        assigned.push(leftover.shift())
        remaining--
    }

    return assigned
}

// Returns a new selection array with the seat added (and marks it selected),
// or the same array unchanged if the seat is already selected.
export const addSeatToSelection = (selection, seat) => {
    seat.selected = true
    if (selection.some(s => s.id === seat.id)) return selection
    return [...selection, seat]
}

export const removeSeatFromSelection = (selection, seat) => {
    seat.selected = false
    return selection.filter(s => s.id !== seat.id)
}

// Frees a booked seat and strips it out of any booking-history record it
// belonged to, dropping records that end up with no seats left.
export const cancelSeatEverywhere = (seatList, history, seatId) => {
    const seat = seatList.find(s => s.id === seatId)
    if (seat) seat.booked = false

    return history
        .map(record => ({ ...record, seatIds: record.seatIds.filter(id => id !== seatId) }))
        .filter(record => record.seatIds.length > 0)
}

// Frees every seat in a booking and removes that booking's history record.
export const cancelBookingById = (seatList, history, bookingId) => {
    const record = history.find(r => r.id === bookingId)
    if (!record) return history

    record.seatIds.forEach(seatId => {
        const seat = seatList.find(s => s.id === seatId)
        if (seat) seat.booked = false
    })

    return history.filter(r => r.id !== bookingId)
}

export const formatBookingId = (counter) => `BK${String(counter).padStart(4, "0")}`

// Accepts raw text (straight from an <input>) and returns a valid positive
// integer, or null if it fails validation (empty, decimal, zero, negative).
export const parsePositiveInteger = (rawValue) => {
    const trimmedValue = String(rawValue).trim()
    const parsedValue = Number(trimmedValue)
    if (trimmedValue === "" || !Number.isInteger(parsedValue) || parsedValue <= 0) return null
    return parsedValue
}

export const saveState = (seatList, bookingHistory, bookingCounter) => {
    const state = {
        bookedSeatIds: seatList.filter(seat => seat.booked).map(seat => seat.id),
        bookingHistory,
        bookingCounter,
    }
    try {
        // localStorage can throw in private-browsing modes or when storage
        // is disabled — that shouldn't crash the app, just skip persisting.
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch (err) {
        console.error("Failed to save booking state", err)
    }
}

// Applies any saved booked-seat flags onto seatList in place, and returns
// the restored history/counter (empty state if nothing is stored or the
// stored value is corrupted).
export const loadState = (seatList) => {
    const emptyState = { bookingHistory: [], bookingCounter: 0 }

    let rawValue
    try {
        rawValue = localStorage.getItem(STORAGE_KEY)
    } catch (err) {
        return emptyState
    }
    if (!rawValue) return emptyState

    try {
        const state = JSON.parse(rawValue)

        if (Array.isArray(state.bookedSeatIds)) {
            state.bookedSeatIds.forEach(id => {
                const seat = seatList.find(s => s.id === id)
                if (seat) seat.booked = true
            })
        }

        return {
            bookingHistory: Array.isArray(state.bookingHistory) ? state.bookingHistory : [],
            bookingCounter: typeof state.bookingCounter === "number" ? state.bookingCounter : 0,
        }
    } catch (err) {
        console.error("Failed to load saved booking state", err)
        return emptyState
    }
}

// ---------------------------------------------------------------------
// DOM / UI wiring. Everything below touches the document, so it's kept out
// of the exports above and only runs in a browser (the guard at the bottom
// skips this when app.js is imported from a Node test).
// ---------------------------------------------------------------------

const initApp = () => {
    const seatMap = document.querySelector(".seat-map")
    const previewSummary = document.querySelector(".preview-summary")
    const previewSeats = document.querySelector(".preview-seats")
    const availableCountText = document.querySelector(".available-count")
    const receipt = document.querySelector(".receipt")
    const toastContainer = document.querySelector(".toast-container")
    const seatCountInput = document.querySelector(".input")
    const bookSeatsButton = document.querySelector("form button")
    const confirmButton = document.querySelector(".confirm")
    const clearButton = document.querySelector(".clear")
    const resetButton = document.querySelector(".reset")
    const passengerNameInput = document.querySelector(".passenger-name")
    const searchInput = document.querySelector(".search-input")
    const searchButton = document.querySelector(".search-btn")
    const bookingHistoryList = document.querySelector(".booking-history-list")

    let selectedSeats = []
    let bookingHistory = []
    let bookingCounter = 0

    const showToast = (message, type = "success") => {
        const toast = document.createElement("div")
        toast.classList.add("toast", type)
        toast.textContent = message
        toastContainer.appendChild(toast)

        requestAnimationFrame(() => toast.classList.add("show"))

        setTimeout(() => {
            toast.classList.remove("show")
            toast.addEventListener("transitionend", () => toast.remove(), { once: true })
        }, 3000)
    }

    const renderSeatMap = () => {
        seatMap.innerHTML = ""
        for (let row = 1; row <= TotalRow; row++) {
            const rowDiv = document.createElement("div")
            rowDiv.classList.add("row")

            const rowSeats = seats.filter(seat => seat.row === row)
            rowSeats.forEach(seat => {
                const seatDiv = document.createElement("div")
                seatDiv.classList.add("col")
                seatDiv.textContent = seat.id
                seatDiv.dataset.seatId = seat.id

                if (seat.booked) {
                    seatDiv.classList.add("booked")
                    seatDiv.title = `Seat ${seat.id} — Booked (click to cancel)`
                } else if (seat.selected) {
                    seatDiv.classList.add("selected")
                    seatDiv.title = `Seat ${seat.id} — Selected`
                } else {
                    seatDiv.title = `Seat ${seat.id} — ${getSeatType(seat.row)} — $${getSeatPrice(seat.row)}`
                }

                seatDiv.addEventListener("click", () => handleSeatClick(seat))
                rowDiv.appendChild(seatDiv)
            })

            seatMap.appendChild(rowDiv)
        }

        availableCountText.textContent = `${getAvailableCount(seats)} available · ${getBookedCount(seats)} booked`
    }

    const renderPreview = () => {
        previewSeats.innerHTML = ""

        if (selectedSeats.length === 0) {
            previewSummary.innerHTML = `<p class="preview-empty">No seats selected</p>`
            return
        }

        const seatIds = selectedSeats.map(seat => seat.id).join(", ")
        const total = getTotal(selectedSeats)
        const breakdown = getPriceBreakdown(selectedSeats)
        const breakdownLines = Object.entries(breakdown)
            .map(([type, info]) => `<p class="preview-line"><span>${type} &times; ${info.count}</span><strong>$${info.count * info.price}</strong></p>`)
            .join("")

        previewSummary.innerHTML = `
            <p class="preview-line"><span>Seats selected</span><strong>${selectedSeats.length}</strong></p>
            <p class="preview-line"><span>Seat IDs</span><strong>${seatIds}</strong></p>
            ${breakdownLines}
            <p class="preview-line total"><span>Total amount</span><strong>$${total}</strong></p>
        `

        for (let row = 1; row <= TotalRow; row++) {
            const rowSeats = selectedSeats.filter(seat => seat.row === row)
            if (rowSeats.length === 0) continue

            const rowDiv = document.createElement("div")
            rowDiv.classList.add("row")
            rowSeats.forEach(seat => {
                const seatDiv = document.createElement("div")
                seatDiv.classList.add("col", "selected")
                seatDiv.textContent = seat.id
                seatDiv.title = "Click to remove"
                seatDiv.addEventListener("click", () => handleSeatClick(seat))
                rowDiv.appendChild(seatDiv)
            })
            previewSeats.appendChild(rowDiv)
        }
    }

    const renderBookingHistory = () => {
        bookingHistoryList.innerHTML = ""

        if (bookingHistory.length === 0) {
            bookingHistoryList.innerHTML = `<p class="history-empty">No bookings yet</p>`
            return
        }

        bookingHistory.forEach(record => {
            const item = document.createElement("div")
            item.classList.add("history-item")
            const bookedAt = new Date(record.timestamp).toLocaleString()

            item.innerHTML = `
                <div class="history-main">
                    <strong>${record.id}</strong>
                    <span>Seats: ${record.seatIds.join(", ")}</span>
                    <span>$${record.total}</span>
                </div>
                <div class="history-meta">
                    <span>${record.passenger || "Guest"}</span>
                    <span>${bookedAt}</span>
                </div>
            `

            const cancelButton = document.createElement("button")
            cancelButton.classList.add("history-cancel")
            cancelButton.textContent = "Cancel Booking"
            cancelButton.addEventListener("click", () => handleCancelBooking(record.id))
            item.appendChild(cancelButton)

            bookingHistoryList.appendChild(item)
        })
    }

    // Selection changes (pick/unpick/clear) only affect the map and preview.
    const refreshView = () => {
        renderSeatMap()
        renderPreview()
    }

    // Anything that changes booked seats or booking history also needs to
    // persist and update the history panel.
    const persistAndRefresh = () => {
        saveState(seats, bookingHistory, bookingCounter)
        renderSeatMap()
        renderPreview()
        renderBookingHistory()
    }

    const handleSeatClick = (seat) => {
        if (seat.booked) {
            cancelSeat(seat)
            return
        }

        selectedSeats = seat.selected
            ? removeSeatFromSelection(selectedSeats, seat)
            : addSeatToSelection(selectedSeats, seat)

        refreshView()
    }

    const bookSeatsByCount = (count) => {
        const seatsToAssign = assignSeats(seats, TotalRow, count)
        seatsToAssign.forEach(seat => {
            selectedSeats = addSeatToSelection(selectedSeats, seat)
        })
        refreshView()
    }

    const cancelSeat = (seat) => {
        bookingHistory = cancelSeatEverywhere(seats, bookingHistory, seat.id)
        persistAndRefresh()
        showToast(`Seat ${seat.id} cancelled.`, "success")
    }

    const handleCancelBooking = (bookingId) => {
        const historyCountBefore = bookingHistory.length
        bookingHistory = cancelBookingById(seats, bookingHistory, bookingId)
        if (bookingHistory.length === historyCountBefore) return

        persistAndRefresh()
        showToast(`Booking ${bookingId} cancelled.`, "success")
    }

    const clearSelection = () => {
        selectedSeats.forEach(seat => {
            seat.selected = false
        })
        selectedSeats = []
        refreshView()
    }

    const resetEverything = () => {
        seats.forEach(seat => {
            seat.booked = false
            seat.selected = false
        })
        selectedSeats = []
        bookingHistory = []
        seatCountInput.value = ""
        passengerNameInput.value = ""
        receipt.hidden = true
        receipt.innerHTML = ""
        persistAndRefresh()
    }

    const downloadTicketPDF = (record) => {
        if (!window.jspdf) {
            showToast("PDF library failed to load. Check your connection.", "error")
            return
        }
        const { jsPDF } = window.jspdf
        const doc = new jsPDF()

        doc.setFontSize(20)
        doc.text("Booking Ticket", 20, 25)
        doc.setFontSize(12)
        doc.text(`Booking ID: ${record.id}`, 20, 40)
        doc.text(`Passenger: ${record.passenger || "Guest"}`, 20, 50)
        doc.text(`Seats: ${record.seatIds.join(", ")}`, 20, 60)
        doc.text(`Total paid: $${record.total}`, 20, 70)
        doc.text(`Date: ${new Date(record.timestamp).toLocaleString()}`, 20, 80)

        doc.save(`ticket-${record.id}.pdf`)
    }

    const confirmBooking = () => {
        const pendingSeats = seats.filter(seat => seat.selected)
        if (pendingSeats.length === 0) {
            showToast("You haven't selected any seats yet. Book seats first, then confirm.", "error")
            return
        }

        const passengerName = passengerNameInput.value.trim()
        if (!passengerName) {
            showToast("Please enter the passenger name before confirming.", "error")
            return
        }

        pendingSeats.forEach(seat => {
            seat.booked = true
            seat.selected = false
        })

        const seatIds = pendingSeats.map(seat => seat.id).join(", ")
        const total = getTotal(pendingSeats)
        bookingCounter++
        const bookingId = formatBookingId(bookingCounter)

        const record = {
            id: bookingId,
            seatIds: pendingSeats.map(seat => seat.id),
            total,
            passenger: passengerName,
            timestamp: new Date().toISOString(),
        }
        bookingHistory.unshift(record)

        showToast(`Booking confirmed! ${pendingSeats.length} seat${pendingSeats.length === 1 ? "" : "s"} booked — $${total}`, "success")

        receipt.hidden = false
        receipt.innerHTML = `
            <p class="receipt-title">Booking Confirmed</p>
            <p class="preview-line"><span>Booking ID</span><strong>${bookingId}</strong></p>
            <p class="preview-line"><span>Passenger</span><strong>${passengerName}</strong></p>
            <p class="preview-line"><span>Seat${pendingSeats.length === 1 ? "" : "s"}</span><strong>${seatIds}</strong></p>
            <p class="preview-line total"><span>Total paid</span><strong>$${total}</strong></p>
        `
        const downloadButton = document.createElement("button")
        downloadButton.classList.add("download-ticket")
        downloadButton.textContent = "Download Ticket (PDF)"
        downloadButton.addEventListener("click", () => downloadTicketPDF(record))
        receipt.appendChild(downloadButton)

        selectedSeats = []
        passengerNameInput.value = ""
        persistAndRefresh()
    }

    const findSeat = () => {
        const seatId = parsePositiveInteger(searchInput.value)
        if (seatId === null) {
            showToast("Enter a valid seat number to search.", "error")
            return
        }

        const seat = seats.find(s => s.id === seatId)
        if (!seat) {
            showToast(`Seat ${seatId} does not exist.`, "error")
            return
        }

        const seatElement = seatMap.querySelector(`[data-seat-id="${seatId}"]`)
        if (seatElement) {
            seatElement.scrollIntoView({ behavior: "smooth", block: "center" })
            seatElement.classList.add("highlight")
            setTimeout(() => seatElement.classList.remove("highlight"), 1500)
        }

        const status = seat.booked ? "booked" : seat.selected ? "selected" : "available"
        showToast(`Seat ${seatId} is ${status} — ${getSeatType(seat.row)} ($${getSeatPrice(seat.row)})`, "success")
    }

    const restored = loadState(seats)
    bookingHistory = restored.bookingHistory
    bookingCounter = restored.bookingCounter

    renderSeatMap()
    renderPreview()
    renderBookingHistory()

    bookSeatsButton.addEventListener("click", (e) => {
        e.preventDefault()
        const count = parsePositiveInteger(seatCountInput.value)

        if (count === null) {
            showToast("Please enter a valid whole number of seats (greater than 0).", "error")
            seatCountInput.value = ""
            return
        }

        const availableSeats = getAvailableCount(seats)
        if (count > availableSeats) {
            showToast(`Sorry, only ${availableSeats} seat${availableSeats === 1 ? "" : "s"} left. Please enter a lower number.`, "error")
            seatCountInput.value = ""
            return
        }

        bookSeatsByCount(count)
        seatCountInput.value = ""
    })

    confirmButton.addEventListener("click", (e) => {
        e.preventDefault()
        confirmBooking()
    })

    clearButton.addEventListener("click", (e) => {
        e.preventDefault()
        clearSelection()
        showToast("Selection cleared.", "success")
    })

    resetButton.addEventListener("click", (e) => {
        e.preventDefault()
        resetEverything()
        showToast("All seats have been reset.", "success")
    })

    searchButton.addEventListener("click", (e) => {
        e.preventDefault()
        findSeat()
    })

    searchInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault()
            findSeat()
        }
    })
}

if (typeof document !== "undefined") {
    initApp()
}
