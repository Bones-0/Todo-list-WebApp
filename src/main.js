import TaskManager from "./TaskManger.js";

const addtaskBTN = document.getElementsByClassName("add-task-button")[0];
const template = document.getElementById("task-template");
const container = document.getElementsByClassName("container")[0];
const hamburgerMenu = document.querySelector(".hamburger-menu");
const hamburgerList = document.querySelector(".hamburger-list");

const task_map = new Map();
const completed_task_map = new Map();

const STORAGE_KEY = "task_map_storage";
const CLOCK = "⏱ ";

let total_tasks = document.getElementById("total-tasks");
let completed_tasks_count = document.getElementById("completed-tasks-count");

/* ===================== CARET UTILS ===================== */

function setCaretToEnd(el) {
    const range = document.createRange();
    range.selectNodeContents(el);
    range.collapse(false);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
}

function Clear_Field(e) {
    e.target.textContent = e.target.textContent.replace(CLOCK, "");
    setTimeout(() => setCaretToEnd(e.target), 1);
}

/* ===================== STORAGE ===================== */

function save_Tasks() {
    const tasksArray = [...task_map.values()].map(task => task.toJSON());
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasksArray));
}

function load_Tasks() {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    raw.forEach(taskData => {
        const task = TaskManager.fromJSON(taskData);
        task_map.set(task.id, task);

        const clone = task.Create_task(template);
        container.appendChild(clone);

        const taskBox = container.querySelector(`[data-task-id="${task.id}"]`);

        taskBox.querySelector(".task-title").textContent = task.Title;
        taskBox.querySelector(".task-description").textContent = task.Description;

        if (task.DueDate) {
            taskBox.querySelector(".task-due-date").textContent =
                CLOCK + task.DueDate;
        }

        updateCompleteButtonVisibility(taskBox);
    });

    total_tasks.textContent = `Total Tasks: ${task_map.size}`;
}

/* ===================== UI ===================== */

function updateCompleteButtonVisibility(taskBox) {
    const title = taskBox.querySelector(".task-title").textContent.trim();
    const description = taskBox.querySelector(".task-description").textContent.trim();
    const dueDate = taskBox.querySelector(".task-due-date").textContent
        .replace(CLOCK, "")
        .trim();

    const completeBtn = taskBox.querySelector(".complete-task-button");

    completeBtn.style.display =
        title && description && dueDate ? "block" : "none";
}

/* ===================== ADD TASK ===================== */

addtaskBTN.addEventListener("click", () => {
    const task = new TaskManager();
    task_map.set(task.id, task);

    const clone = task.Create_task(template);
    container.appendChild(clone);

    total_tasks.textContent = `Total Tasks: ${task_map.size}`;
    save_Tasks();
});

/* ===================== CLICK EVENTS ===================== */

hamburgerMenu.addEventListener("click", () => {
    hamburgerMenu.classList.toggle("active");
    hamburgerList.classList.toggle("active");
});

container.addEventListener("click", (e) => {
    const taskBox = e.target.closest(".box");
    if (!taskBox) return;

    const taskId = taskBox.dataset.taskId;

    // Delete
    if (e.target.classList.contains("delete-task-button")) {
        task_map.delete(taskId);
        taskBox.remove();

        total_tasks.textContent = `Total Tasks: ${task_map.size}`;
        save_Tasks();
    }

    // Complete
    if (e.target.classList.contains("complete-task-button")) {
        const task = task_map.get(taskId);
        task.Completed = true;

        task_map.delete(taskId);
        completed_task_map.set(taskId, task);

        taskBox.remove();

        completed_tasks_count.textContent =
            `Completed Tasks: ${completed_task_map.size}`;
        total_tasks.textContent = `Total Tasks: ${task_map.size}`;

        save_Tasks();
    }
});

/* ===================== INPUT (CRITICAL FIX) ===================== */
/* THIS is what prevents data loss */

container.addEventListener("input", (e) => {
    const taskBox = e.target.closest(".box");
    if (!taskBox) return;

    const taskId = taskBox.dataset.taskId;
    const task = task_map.get(taskId);
    if (!task) return;

    if (e.target.classList.contains("task-title")) {
        task.Edit_task_title(e.target.textContent.trim());
    }

    if (e.target.classList.contains("task-description")) {
        task.Edit_task_description(e.target.textContent.trim());
    }

    if (e.target.classList.contains("task-due-date")) {
        const text = e.target.textContent.replace(CLOCK, "").trim();
        task.Edit_task_dueDate(text);
    }

    save_Tasks();
});

/* ===================== KEYDOWN ===================== */

container.addEventListener("keydown", (e) => {
    if (
        (e.target.classList.contains("task-title") ||
         e.target.classList.contains("task-description") ||
         e.target.classList.contains("task-due-date")) &&
        e.key === "Enter"
    ) {
        e.preventDefault();
        e.target.blur();
    }
});

/* ===================== FOCUS ===================== */

container.addEventListener("focusin", (e) => {
    if (e.target.classList.contains("task-due-date")) {
        Clear_Field(e);
    }
});

container.addEventListener("focusout", (e) => {
    const taskBox = e.target.closest(".box");
    if (!taskBox) return;
    updateCompleteButtonVisibility(taskBox);
});

/* ===================== SAFETY ===================== */

window.addEventListener("beforeunload", save_Tasks);

/* ===================== INIT ===================== */

load_Tasks();
