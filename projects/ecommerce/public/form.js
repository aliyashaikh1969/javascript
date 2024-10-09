let submitBtn = document.querySelector(".submit-btn");
let loader = document.querySelector(".loader");

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let name = document.querySelector("#name");
  let number = document.querySelector("#number");
  let email = document.querySelector("#email");
  let password = document.querySelector("#password");
  let tac = document.querySelector("#tc");

  if (name.value.length < 3) {
    errorShow("name must be 3 letter long");
  } else if (!email.value.length) {
    errorShow("enter your email");
  } else if (password.value.length < 8) {
    errorShow("password must be 8 letter long ");
  } else if (number.value.length < 10) {
    errorShow("invalid number , enter valid number");
  } else if (!tac.checked) {
    errorShow("accept ours term and condition");
  } else {
    //submitting form

    loader.style.display = "block";
    sendData("/sign", {
      name: name.value,
      number: number.value,
      email: email.value,
      password: password.value,
      tac: tac.checked,
    });
  }
});
