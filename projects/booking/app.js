console.log("booking");

const input = document.querySelector(".input");
const submitBtn = document.querySelector("form button");
const rows = document.querySelectorAll(".seats .row")

let rowNumber = 0



const selectingRows =()=>{
    let value = input.value;
    if(value<=5){
        bookingStatus(value,rowNumber)
        rowNumber++
    }else if(value>5){
        let newValue = 5
        bookingStatus(newValue,rowNumber)
        rowNumber++

        let addingValue = value - newValue
        bookingStatus(addingValue,rowNumber)

        rowNumber++
    }
    input.value = ""
}

const bookingStatus = (invalue,numberOfRow)=>{
    console.log(invalue,numberOfRow)


    for(let i = 0 ;i<invalue;i++){
        rows[numberOfRow].children[i].classList.add("booked");
    }

}

submitBtn.addEventListener("click", (e) => {
    e.preventDefault()

    if(rowNumber<10){
        selectingRows()
    }

})
