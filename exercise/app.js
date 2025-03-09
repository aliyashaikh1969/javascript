
const alphabeticalOrder = (str) =>
    str.split("").sort().join("")

// console.log(alphabeticalOrder("javascrpt"));

const countsVowels =(str, vowels = ["a","e","i","o","u"])=>
    str.split("").filter((s)=> vowels.indexOf(s)>-1).length;
    

// console.log(countsVowels("javascrpit"))


let array = [20,60,54,65,90]

let newEle = 30; 
let posi= 2; 

for(let i = array.length -1 ; i>=0 ;i--){
    if(i>= posi){
        array[i + 1] = array[i]
        if(i==posi){
            array[i]= newEle
        }
    }
}

array.splice(3,0,10)
// console.log(array)

for (let i = 5; i < array.length-1; i++) {//removing(65) item from array 
    array[i] = array[i+1]
}
array.length = array.length-1
    // console.log(array)

array.splice(1,1)
// console.log(array)


const duplicate =(array)=>{
    let result = []
    let dupli =[]
    for(let i = 0;i<=array.length-1; i++){
       if(result.includes(array[i])){
        dupli.push(array[i])
       }else{
        result.push(array[i])
       }
    }
    console.log(result)
    console.log(dupli)
    // return result
}

// duplicate([1,2,4,4,2,3,3])`

const primeNumber = (num)=>
// console.log(num%2)    // num/2== 0
    num%2 !== 0


// console.log(primeNumber(1))


const sumOfEvenNumber = (array) =>{
    let result = array.filter(num=>num%2==0).reduce((a,b)=> a+b)

     return result
}

// console.log(sumOfEvenNumber([2,4,3,4,5,6,2]))


const factorailOfNumber =(num)=>{
    let result = 1
    for(let i =1 ; i<=num ;i++){
        result *=i
    }
    return result
}

// console.log(factorailOfNumber(7))


const missingNumber =(array)=>{
    // let seen = array.sort()
    let sort = array.sort()[array.length-1]
    let number = []
    for(let i=1 ; i<=sort ; i++){
        if(!array.includes(i)){
            number.push(i)
        }
    }
    console.log(number)
}
 

// console.log(missingNumber([1,3,5,2,8]))
// missingNumber([3,0,1])

// let url = "https://randomuser.me/api/"
function apiPractice (){
    let test =fetch(url).then(res=>res.json()).then(result=>console.log(result))
    return test
}
// apiPractice()

async function pract() {
    let response = await fetch(url)
    let result = await response.json()
    return result
}
// let test = pract()
// test.then(data=>console.log(data))
// console.log(test)



const largeString =(str)=>{
    let arr = str.split(" ")
    let sorting = arr.sort((a,b)=>b.length-a.length); //using sort function
    let reducing = arr.reduce((accum ,current)=>(accum.length > current.length ? accum : current),"") //using reduce function
    console.log(reducing)
    return sorting[0]
}


// console.log(largeString("hello I am writing A javascript language"))

// console.log(largeString("hello i am writing a"))



const generateHash =(str)=>{
 let result = str.split(" ").map(item => item.charAt(0).toUpperCase()+ item.slice(1).toLowerCase()).join("")

return `#${result}`
}

// console.log(generateHash("making a hash tag"));

const countChar =(str,char)=>
    str.split("").filter(item=> item.toUpperCase()==char.toUpperCase()).length;

// console.log(countChar("javascraipt" , "v"))



const checkTriangleType =(a,b,c)=>{
 if(a == b && a == c){
    return "equilateral"
 }else if(a == b  || b == c || a == c){
    return "isosceles"
 }else {
    return "scalene"
 }
}

// console.log(checkTriangleType(3,3,3))  //equilateral
// console.log(checkTriangleType(4,4,2))  //isosceles
// console.log(checkTriangleType(3,4,5))  //scalene


const sortAscendingOrder=(array)=>{
let arr = array
for(let i=0;i<arr.length;i++){
    for(let j=0;j<arr.length; j++){
        if(arr[j]>arr[j+1]){
            let tem = arr[j]
            arr[j]=arr[j+1]
            arr[j+1]=tem
        }
    }
}
return arr

}


// console.log(sortAscendingOrder([1,10,2,4]))
// console.log(sortAscendingOrder([10,22,3,4,1]))



const isPalindrome=(str)=>{
    str = str.toLowerCase().replace(/\W/g,"") //regular expression (/\W/g) to remove all non-word characters from the string
    let revstr = str.split("").reverse().join("")

    // console.log(revstr)
    return str==revstr 
}





// console.log(isPalindrome("A man, a plan, a canal, panama"))
// console.log(isPalindrome("rsiar"))
// console.log(isPalindrome("hello"))

