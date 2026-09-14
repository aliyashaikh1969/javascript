// console.log("objects")
// let array = [1,2,3,4];
// let str = "string"
// let obj = {
//     name : "pract",
//     color:"red",
//     size:"32px",
//     type:"object"
// }

// let con ={
//     age:"30"
// }
// con.__proto__=obj
// Object.setPrototypeOf(con,obj)
// console.log(obj)

// console.log(con)

// console.log(obj)
// console.log(array)
// console.log(str)


// Object.prototype.commonFunction = function (){
//     // console.log(this)
//     return "common in array ,string , object"
// }
// Array.prototype.functionOnlyInArray = function (){
//     console.log(this)
//     return "function only accessable in array"
// }
// String.prototype.functionOnlyInString = function (){
//     // console.log(this)
//     return "function only accessable in string"
// }


// console.log(obj.commonFunction())
// console.log(array.commonFunction())
// console.log(str.commonFunction())
// console.log("hello".commonFunction())


// console.log(array.functionOnlyInArray())
// console.log(str.functionOnlyInString())
// console.log("hi".functionOnlyInString())


// let carObj ={
//     make :"bob",
//     model:"tata",
//     year:2025,
//     color:"black"
// }

// console.log(carObj)
// console.log(carObj.model,carObj["model"])

// carObj.year = 2035
// console.log(carObj)

// carObj.type="car"
// console.log(carObj)

// delete carObj.color

// console.log(carObj)

// let {model , year} = carObj
// console.log(model,year)

let user ={
    name:"bon",
    age:"23",
    address:{
        street:"shiva",
        city:"pune",
        zipcode:320089
    }
}
console.log(user.address.zipcode)