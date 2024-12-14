console.log("chatbot")

const messageInput = document.querySelector(".message-input");
const chatBody = document.querySelector(".chat-body");
const submitButton = document.querySelector("#submit-btn");
const fileInput = document.querySelector("#file-input");
const fileUploadewrapper = document.querySelector(".file-upload-wrapper");
const fileCancle =document.querySelector("#cancle");


//  const apikey ="AIzaSyDbCaaReBObY8VwbXFMvjrFKWjMniEm4bo";
const API_KEY = `AIzaSyAM9WZLvE1z0_TLsH2zKTl-rLSr8yPw0AQ`;
const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${API_KEY}`


let userData = {
    message: null,
    file: {
        data: null,
        mime_type: null
    }
}

const createMessageElement = (content, ...classes) => {
    let div = document.createElement("div")
    div.classList.add("message", ...classes)
    div.innerHTML = content
    return div;
}

const generatingBotResponse = async (inComingMessageDiv) => {
    // console.log(inComingMessageDiv);
    const messageElement = inComingMessageDiv.querySelector(".message-text")
    // console.log(messageElement)
    const requestOptions = {
        method: "POST",
        headers: {
            "Content-Type": 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: userData.message }, ...(userData.file.data ? [{ inline_data: userData.file }] : [])]
            }]
        })

        // method: 'POST',
        // headers: {
        //   'Content-Type': 'application/json'
        // },
        // body: JSON.stringify({ key: 'value' })
    }
    try {
        const response = await fetch(API_URL, requestOptions);
        const data = await response.json()
        if (!response.ok) throw new Error(data.error.message);
        const responseText = data.candidates[0].content.parts[0].text.replace(/\*\*(.*?)\*\*/g, "$1").trim();
        // console.log(responseText)

        messageElement.innerText = responseText

        // console.log(data)
    } catch (error) {
        console.log(error)
        messageElement.innerText = error.message
        messageElement.style.color = "#ff0000"
    } finally {

        userData.file = {}
        inComingMessageDiv.classList.remove('thinking')
        chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });
    }
}


const handleOutgoingMessage = (e) => {
    e.preventDefault()
    userData.message = messageInput.value.trim()
    messageInput.value = ""
    fileUploadewrapper.classList.remove("file-uploaded")

    let messageContent = `<div class="message-text"></div>
                        ${userData.file.data ? `<img src="data:${userData.file.mime_type};base64,${userData.file.data}" class="attachment"/>` : ""}`

    let outgingMessageDiv = (createMessageElement(messageContent, "user-message"))
    outgingMessageDiv.querySelector(".message-text").textContent = userData.message
    chatBody.appendChild(outgingMessageDiv)
    chatBody.scrollTo({ top: chatBody.scrollHeight, behavior: "smooth" });

    setTimeout(() => {

        // console.log("boot")
        let messageContent = ` <svg
            xmlns="http://www.w3.org/2000/svg"
            class="chat-icon"
            width="50"
            height="50"
            viewBox="0 0 1024 1024"
          >
            <path
              d="M738.3 287.6H285.7c-59 0-106.8 47.8-106.8 106.8v303.1c0 59 47.8 106.8 106.8 106.8h81.5v111.1c0 .7.8 1.1 1.4.7l166.9-110.6 41.8-.8h117.4l43.6-.4c59 0 106.8-47.8 106.8-106.8V394.5c0-59-47.8-106.9-106.8-106.9zM351.7 448.2c0-29.5 23.9-53.5 53.5-53.5s53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5-53.5-23.9-53.5-53.5zm157.9 267.1c-67.8 0-123.8-47.5-132.3-109h264.6c-8.6 61.5-64.5 109-132.3 109zm110-213.7c-29.5 0-53.5-23.9-53.5-53.5s23.9-53.5 53.5-53.5 53.5 23.9 53.5 53.5-23.9 53.5-53.5 53.5zM867.2 644.5V453.1h26.5c19.4 0 35.1 15.7 35.1 35.1v121.1c0 19.4-15.7 35.1-35.1 35.1h-26.5zM95.2 609.4V488.2c0-19.4 15.7-35.1 35.1-35.1h26.5v191.3h-26.5c-19.4 0-35.1-15.7-35.1-35.1zM561.5 149.6c0 23.4-15.6 43.3-36.9 49.7v44.9h-30v-44.9c-21.4-6.5-36.9-26.3-36.9-49.7 0-28.6 23.3-51.9 51.9-51.9s51.9 23.3 51.9 51.9z"
            ></path>
          </svg>
          <div class="message-text">
           <div class="bot-thinking">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
           </div>
          </div>`
        let inComingMessageDiv = (createMessageElement(messageContent, "bot-message", "thinking"))
        chatBody.appendChild(inComingMessageDiv)
        generatingBotResponse(inComingMessageDiv)
        // inComingMessageDiv.querySelector(".message-text").innerHTML =candidates[0].content.part[0].text
    }, 600);
}

messageInput.addEventListener("keydown", (e) => {
    let message = e.target.value.trim();
    if (e.key == "Enter" && message) {
        handleOutgoingMessage(e)
    }
})


submitButton.addEventListener("click", (e) => handleOutgoingMessage(e))

fileInput.addEventListener("change", (e) => {
    let file = e.target.files[0]
    if (!file) return;

    let reader = new FileReader()

    reader.onload = (e) => {
        fileUploadewrapper.querySelector("img").src = e.target.result
        fileUploadewrapper.classList.add("file-uploaded");
        const base64String = e.target.result.split(",")[1];

        userData.file = {
            data: base64String,
            mime_type: file.type
        }
        fileInput.value = ""
    }
    reader.readAsDataURL(file)
})

document.querySelector("#file-upload").addEventListener("click", () => fileInput.click())


fileCancle.addEventListener("click",()=>{
    userData.file={}
    fileUploadewrapper.classList.remove("file-uploaded");


})