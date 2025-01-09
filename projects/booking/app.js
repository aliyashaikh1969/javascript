console.log("booking");

const input = document.querySelector(".input");
const submitBtn = document.querySelector("form button");
const rows = document.querySelectorAll(".seats .row")

let rowNumber = 0

const selectingRows=()=>{

    const columns = rows[rowNumber].children
   
    console.log("columns",columns)
    
}
submitBtn.addEventListener("click", (e) => {
    e.preventDefault()
    if (rowNumber < 10) {
        console.log(rowNumber)
        selectingRows()
        rowNumber++

    } else {
        console.log("end")
    }

})
