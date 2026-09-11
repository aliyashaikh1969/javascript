
const srValue = document.querySelector(".srvalue")
const ssValue = document.querySelector(".ssetvalue")

console.log(srValue,ssValue)
async function fetchData(city) {

    const api_key = "7d5e74e7b112e34001dc87b79a2fc7c3";
    const url = `https://api.openweathermap.org/data/2.5/weather?&appid=${api_key}`;
// const dataEnd = `https://api.openweathermap.org/data/2.5/onecall?appid=${api_key}&exclude=minutely&units=metric&`
    try {
        let response = await fetch(`${url}&q=${city}`)
        let data =await response.json()
        console.log(data)

        // let result = await fetch(`${url}&lat=${data.coord.lat}&lon=${data.coord.lon}}`)
        // const apiKey = "a5bb4718b30b6f58f58697997567fffa"
        // const urlOne = `https://api.openweathermap.org/data/2.5/onecall?lat=${data.coord.lat}&lon=${data.coord.lon}&exclude=current,minutely,hourly,alerts&appid=${api_key}&units=metric`; // using metric units (Celsius)
        // const result= await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${data.coord.lat}&lon=${data.coord.lon}&appid=${api_key}`);
        // const result = await fetch(urlOne)

        // let resultData=await result.json()
        // console.log(resultData)

        const option1 ={
            hour:"numeric",
            minute:"numeric",
            hour12:true
        }

        srValue.innerHTML = getLongFormateDateTime(resultData.sys.sunset,
            data.timezone_offset,
            option1
        )

        const sunriseTimestamp = data.sys.sunrise;
        const sunriseDate = new Date(sunriseTimestamp * 1000); // Multiply by 1000 to convert from seconds to milliseconds
        srValue.innerHTML = sunriseDate; // You can change the format if needed


        
    } catch (error) {
        console.log("error",error)
    }
}

fetchData("london")



function formatUnixTime(dtValue ,offSet ,options={}){
    const date = new Date((dtValue+offSet)*1000);
    return date.toLocaleTimeString([],{timeZone : 'UTC',...options})
}


function getLongFormateDateTime(dtValue,offSet,options){
    return formatUnixTime(dtValue,offSet,options);
}

let value =1741501687
let sValue = 1741542850
let set = new Date(value * 1000)
const option1 ={
    hour:"numeric",
    minute:"numeric",
    hour12:true
}
console.log(set.toLocaleTimeString('utc'))
console.log(set.toUTCString())
console.log(new Date(sValue * 1000).toLocaleTimeString())