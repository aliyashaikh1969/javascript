console.log("todo");
const submitBtn = document.querySelector(".submit");
const input = document.querySelector("input");
const listContainer = document.querySelector(".list-item");
const progressBar=document.querySelector('.progress-bar');
const progress=document.querySelector('.progress');
const numbers=document.querySelector('.number');
      
let listData = JSON.parse(localStorage.getItem("task"))||[];

let complete = false

const editItem = (id)=>{
  input.value = listData[id].task
  listData.splice(id,1)
  updating()
}


const deleteItem =(id)=>{
  listData.splice(id,1)
  updating()
}


const taskstatus=()=>{
  let completedtasks=listData.filter(item=>item.status).length
  let numberOfTask = listData.length

  let progressPercentage = (completedtasks/numberOfTask)*100;

  progress.style.width=`${progressPercentage}%`;

  numbers.innerHTML=`${completedtasks}/${numberOfTask}`

}

const completedItem =(id)=>{
  // console.log("first")/
  listData[id].status=!listData[id].status
  updating()
}

let updating = () => {
  let listItem = "";
  if (listData.length) {
    listData.forEach((list,index) => {
        listItem +=`
        <li class="item ${list.status ? "complete":""}"  onChange=completedItem(${index})>
          <input type="checkbox" name="task" id="${index}" ${list.status?"checked":""}>
          <label for="${index}" >${list.task}</label>
          <div class="controls">
        <span class="edit" onClick="editItem(${index})">
        <i class="fa-solid fa-pen "></i>
        </span>
        <span class="delete" onClick="deleteItem(${index})">
                            <i class="fa-solid fa-trash"></i>
                        </span>
                    </div>
                    
                </li>
        `
    });
    listContainer.innerHTML = listItem
  }else{
    listContainer.innerHTML=""
  }
  localStorage.setItem('task',JSON.stringify(listData))

  taskstatus()
};

submitBtn.addEventListener("click", (e) => {
  e.preventDefault();

  let inputValue = input.value.trim();
  if (inputValue) {
    let data = {
      task: inputValue,
      status: false,
    };
    listData.push(data);
    localStorage.setItem('task',JSON.stringify(listData))
    input.value = "";
    
    updating();
  }
  
  console.log("listdata", listData);
});

updating()

