console.log("todo");

const submitBtn = document.querySelector(".submit");
const input = document.querySelector("input");
const listContainer = document.querySelector(".list-container");

let listData = [];
let updating = () => {
  let listItem = "";
  if (listData.length) {
    listData.forEach((list) => {
        listItem +=`
        `
    });
  }
};
submitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  let inputValue = input.value.trim();
  if (inputValue) {
    let data = {
      task: inputValue,
      status: "pending",
    };
    listData.push(data);
    input.value = "";

    updating();
  }

  console.log("listdata", listData);
});
