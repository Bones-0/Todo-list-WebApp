import TaskManager from "./TaskManger.js";

const addtaskBTN = document.getElementsByClassName("add-task-button")[0];
const template = document.getElementById("task-template");
const deleteBTN = document.getElementsByClassName("delete-task-button")[0];
const container = document.getElementsByClassName("container")[0];

const task_map = new Map();
const completed_task_map = new Map();

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

function Clear_Field(element) {
    element.target.textContent = element.target.textContent.replace("⏱ ", "");

    setTimeout(() => {
        setCaretToEnd(element.target); // call your function here
    }, 1); // 0 milliseconds, basically "next tick"
}

function updateCompleteButtonVisibility(taskBox) {
    const title = taskBox.querySelector(".task-title").textContent.trim();
    const description = taskBox.querySelector(".task-description").textContent.trim();
    const dueDate = taskBox.querySelector(".task-due-date").textContent.trim().replace("⏱ ", "");
    
    const completeBtn = taskBox.querySelector(".complete-task-button");
    
    // Hide button if all fields are empty
    if (title !== "" && description !== "" && dueDate !== "") {
        completeBtn.style.display = "block"; // or "inline-block" depending on your CSS
    } else {
        completeBtn.style.display = "none";
    }
}

function read_task_map(task_map_array) {
    for (const [key, value] of task_map_array.entries()) {
        console.log(`Task ID: ${key}`);
        console.log(value.Fetch_task_Details());
    }
}

addtaskBTN.addEventListener("click", () => {
    const task = new TaskManager();
    task_map.set(task.id, task);

    const clone = task.Create_task(template);
    console.log("Task created");

    container.appendChild(clone);

    const taskBox = container.querySelector(`[data-task-id="${task.id}"]`);
    updateCompleteButtonVisibility(taskBox);

    total_tasks.textContent = `Total Tasks: ${task_map.size}`;   
    read_task_map(task_map);
});

container.addEventListener("click", (e) => {
    const taskBox = e.target.closest(".box");
    if (!taskBox) return;
    
    const taskId = taskBox.dataset.taskId;
    // Delete Task
    if (e.target.classList.contains("delete-task-button")) {
        task_map.delete(taskId)
        taskBox.remove();
                
        total_tasks.textContent = `Total Tasks: ${task_map.size}`;   
        read_task_map(task_map);
    }

    // Complete Task
    if (e.target.classList.contains("complete-task-button")) {
        task_map.delete(taskId)
        completed_task_map.set(taskId, taskId);
        taskBox.remove();
                
        completed_tasks_count.textContent = `Completed Tasks: ${completed_task_map.size}`;
        total_tasks.textContent = `Total Tasks: ${task_map.size}`;  
        read_task_map(task_map);
    }

});

container.addEventListener("keydown", (e) => {
    const selection = window.getSelection();
    const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
    
    // If entire content is selected
    if (range && !range.collapsed) {
        const selectedText = range.toString();
        const fullText = e.target.textContent;
        
        // If selecting all or most of the content
        if (selectedText.length >= fullText.trim().length) {
            e.preventDefault();
            e.target.textContent = ""; // Force completely empty
            return;
        }
    }
    
    if (e.target.textContent.trim().length == 0) {
        e.target.textContent = "";
    }    
    if ((e.target.classList.contains("task-due-date") || e.target.classList.contains("task-title") || e.target.classList.contains("task-description")) && e.key === "Enter") {
        e.preventDefault(); // prevent new line from being inserted
        e.target.blur();    // remove focus
    }
});


container.addEventListener("focusin", (e) => {
    if (e.target.classList.contains("task-due-date")) {
        console.log("Focused on due date");
        Clear_Field(e);
    }
});

container.addEventListener("focusout", (e) => {
    if (e.target.textContent.trim().length == 0) {
        e.target.textContent = "";
    }
    
    const taskBox = e.target.closest(".box");
    if (!taskBox) return;
    
    const taskId = taskBox.dataset.taskId;
    const task = task_map.get(taskId);

    // Update Title
    if (e.target.classList.contains("task-title")) {
        task.Edit_task_title(e.target.textContent.trim());
        read_task_map(task_map);
    }

    // Update Description
    if (e.target.classList.contains("task-description")) {
        task.Edit_task_description(e.target.textContent.trim());
        read_task_map(task_map);
    }
    if (e.target.classList.contains("task-due-date") && e.target.textContent.trim() !== "") {
        if (e.target.textContent.trim().length <= 1 && e.target.textContent.includes("&#9201;")) {
            e.target.textContent = "";
        } else {
            let dateText = e.target.textContent.trim();
            dateText = "&#9201; " + dateText;
            e.target.innerHTML = dateText;

            dateText = dateText.replace("⏱ ", "");
            task.Edit_task_dueDate(dateText);
            read_task_map(task_map);
        }    
    }
    updateCompleteButtonVisibility(taskBox);
});
