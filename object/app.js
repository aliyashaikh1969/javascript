console.log("objects")

let obj = {
    name : "pract",
    color:"red",
    size:"32px",
    type:"object"
}

let con ={
    age:"30"
}
con.__proto__=obj
console.log(obj)

console.log(con)