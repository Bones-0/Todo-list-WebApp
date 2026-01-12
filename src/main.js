import TaskManager from "./TaskManger.js";

const addtaskBTN = document.getElementsByClassName("add-task-button")[0];
const template = document.getElementById("task-template");
const deleteBTN = document.getElementsByClassName("delete-task-button")[0];
const container = document.getElementsByClassName("container")[0];

let task_number = 0;
let completed_tasks = 0;

const task_list = [];
const completed_task_list = [];

let total_tasks = document.getElementById("total-tasks");
let completed_tasks_count = document.getElementById("completed-tasks-count");

function setCaretToEnd(el) {
    // Create a range (selection)
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false); // false → move to end

    // Apply the selection
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

addtaskBTN.addEventListener("click", () => {
    task_number += 1;

    const task = new TaskManager();
    task_list.push(task);

    const clone = task.Create_task(template);
    console.log("Task created");
    
    container.appendChild(clone);
    total_tasks.textContent = `Total Tasks: ${task_number}`;   
});

container.addEventListener("click", (e) => {
    // Delete Task
    if (e.target.classList.contains("delete-task-button")) {

        e.target.closest("div").parentElement.remove();
        // check the task being deleted exists in task_list 
        
        total_tasks.textContent = `Total Tasks: ${task_number}`;   

    }

    // Complete Task
    if (e.target.classList.contains("complete-task-button")) {
        completed_tasks += 1;
        task_number -= 1;
        e.target.closest("div").parentElement.remove();
        completed_tasks_count.textContent = `Completed Tasks: ${completed_tasks}`;
        total_tasks.textContent = `Total Tasks: ${task_number}`;
    }

});

container.addEventListener("keydown", (e) => {
    if ((e.target.classList.contains("task-due-date") || e.target.classList.contains("task-title") || e.target.classList.contains("task-description")) && e.key === "Enter") {
        e.preventDefault(); // prevent new line from being inserted
        e.target.blur();    // remove focus
    }
});


container.addEventListener("focusin", (e) => {
    if (e.target.classList.contains("task-due-date")) {
        console.log("Focused on due date");
        e.target.textContent = e.target.textContent.replace("⏱ ", "");

        setTimeout(() => {
            setCaretToEnd(e.target); // call your function here
        }, 1); // 0 milliseconds, basically "next tick"
    }
});

container.addEventListener("focusout", (e) => {
    if (e.target.classList.contains("task-due-date") && e.target.textContent.trim() !== "") {
        if (e.target.textContent.trim().length >= 1 && e.target.textContent.includes("&#9201;")) {
            e.target.textContent = "";
        } else {
            let dateText = e.target.textContent;
            dateText = "&#9201; " + dateText;
            e.target.innerHTML = dateText;
        }    
    }
});
