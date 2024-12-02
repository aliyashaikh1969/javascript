window.onload = () => {
  if (sessionStorage.user) {
    user = JSON.parse(sessionStorage.user);
    if (user.email) {
      location.replace("/");
    }
  }
};

const sendData = (path, data) => {
    console.log("sendData ", data);

  fetch(path, {
    method: "POST",
    headers: new Headers({ "Content-type": "application/json" }),
    body: JSON.stringify(data),
  })
    .then((res) => res.json())
    .then((data) => processData(data));
};

const processData = (data) => {
  loader.style.display = "none";
  console.log("data", data);
  if (data.alert) {
    errorShow(data.alert);
  } else if (data.name) {
    sessionStorage.user = JSON.stringify(data);
    location.replace("/");
  }
};

const errorShow = (err) => {
  let errorElm = document.querySelector(".error");
  errorElm.innerHTML = err;
  errorElm.classList.add("show");
};
