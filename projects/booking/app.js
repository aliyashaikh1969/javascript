import { seats } from './data.js'

const seatMap = document.querySelector(".seat-map")
const input = document.querySelector(".input")
const submit = document.querySelector("form button")


const TotalRow = 10
let currentRow = 1
let selectedSeat = [];
let skippSeats = [];


const bookingSeat = (count) => {

    let seatBook = count;

    while (seatBook > 0 && currentRow <= TotalRow) {
        seatBook = bookingSeatRow(seatBook)
        currentRow++
    }

    while(seatBook>0&&skippSeats.length>0){
        

        // console.log(skippSeats,skippSeats.length);


        let seat = skippSeats.shift();
        seat.booked = true;
        selectedSeat.push(seat);
        seatBook--
    }

    renderUi()
}


const bookingSeatRow = (seatBook) => {

    const rowsSeat = seats.filter(seat => seat.row === currentRow);
    let bookingCount = Math.min(seatBook , rowsSeat.length)


    for(let i =0 ; i<bookingCount ; i++){
        rowsSeat[i].booked = true;
        selectedSeat.push(rowsSeat[i])
    }

    for(let i =bookingCount ; i<rowsSeat.length ; i++){
        skippSeats.push(rowsSeat[i]);
    }    

    return seatBook -= bookingCount

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

    bookingSeat(count)
    input.value = ""

})
