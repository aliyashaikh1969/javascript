import { seats } from './data.js'

const seatMap = document.querySelector(".seat-map")
const input = document.querySelector(".input")
const submit = document.querySelector("form button")


const TotalRow = 10
let currentRow = 1
let selectedSeat = [];
let skippSeats = [];
let availableSets = 50



const showPreview=(rowSeats)=>{
console.log(rowSeats)
// for (let i = 0; i <= rowSeats; i++) {
//         const rowDiv = document.createElement("div");
//         rowDiv.classList.add("row");
//         let seat = seats.filter(seat => seat.row === i)
//         seat.forEach(seat => {
//             const div = document.createElement('div');
//             div.classList.add("col");
//             div.textContent = seat.id
//             if (seat.booked) {
//                 div.classList.add("booked")
//             }
//             rowDiv.appendChild(div)
//         })
//         seatMap.appendChild(rowDiv)
//     }
}

const bookingSeat = (count) => {

    let seatToBook = count
    while (seatToBook > 0 && currentRow <= TotalRow) {
        console.log(seatToBook);
        seatToBook = bookingCurrentRow(seatToBook)
        currentRow++
    }

    while(seatToBook>0 && skippSeats.length>0){
        const seat =skippSeats.shift()
        seat.booked=true
        selectedSeat.push(seat);
        seatToBook--
    }

    renderUi()
}

const bookingCurrentRow = (seatToBook) => {

    let rowSeats = seats.filter(seat => seat.row == currentRow)
    let bookingCount = Math.min(seatToBook, rowSeats.length)

    showPreview(rowSeats)
    for (let i = 0; i < bookingCount; i++) {
        rowSeats[i].booked = true

        selectedSeat.push(rowSeats[i])
    }

    for(let i =bookingCount ;i<rowSeats.length ; i++){
        skippSeats.push(rowSeats[i])
    }


    return seatToBook -= bookingCount
}
const renderUi = () => {
    seatMap.innerHTML = ""
    for (let i = 0; i <= TotalRow; i++) {
        const rowDiv = document.createElement("div");
        rowDiv.classList.add("row");
        let seat = seats.filter(seat => seat.row === i)
        seat.forEach(seat => {
            const div = document.createElement('div');
            div.classList.add("col");
            div.textContent = seat.id
            if (seat.booked) {
                div.classList.add("booked")
            }
            rowDiv.appendChild(div)
        })
        seatMap.appendChild(rowDiv)
    }
}
renderUi()

submit.addEventListener("click", (e) => {
    e.preventDefault()
    let count = Number(input.value)
    if (!count || count < 0) return;

    if(count<=availableSets){
        availableSets = availableSets-count
        bookingSeat(count)
    }else{
        alert(`only ${availableSets} is available` )
        console.log("hhh")
    }
    input.value = ""
})
