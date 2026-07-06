import { seats } from './data.js'

const seatMap = document.querySelector(".seat-map")
const input = document.querySelector(".input")
const submit = document.querySelector("form button")
    

const TotalRow = 10

console.log(submit);

const renderUi = () => {
    for (let i = 1; i < TotalRow; i++) {
        let rowDiv = document.createElement("div");
        rowDiv.classList.add("row");
        let seat = seats.filter(seat => seat.row == i)
        for(let j =0 ; j<seat.length ; j++){
            let div = document.createElement('div');
            div.classList.add("col");
            div.textContent = seat[j].id
            rowDiv.appendChild(div)
        }
        seatMap.appendChild(rowDiv)
    }
}
renderUi()

submit.addEventListener("click",(e)=>{
    e.preventDefault()
    let value = input.value 
    if(!value || value<0) return ;
    input.value = ""
})