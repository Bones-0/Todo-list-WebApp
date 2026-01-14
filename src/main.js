import TaskManager from "./TaskManger.js";
import { inject } from "@vercel/analytics/next"
inject();

/* ===================== GLOBALS ===================== */
const addtaskBTN = document.querySelector(".add-task-button");
const template = document.getElementById("task-template");
const container = document.querySelector(".container");

const task_map = new Map();
const completed_task_map = new Map();

const STORAGE_KEY = "task_map_storage";
const STORAGE_KEY2 = "completed_task_map_storage";

const CLOCK = "⏱ ";

const total_tasks = document.getElementById("total-tasks");
const completed_tasks_count = document.getElementById("completed-tasks-count");

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

/* ===================== STORAGE (SAFE + DEBOUNCED) ===================== */

let saveTimeout;

function save_Tasks() {
    clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        const active = [...task_map.values()].map(t => t.toJSON());
        const completed = [...completed_task_map.values()].map(t => t.toJSON());

        localStorage.setItem(STORAGE_KEY, JSON.stringify(active));
        localStorage.setItem(STORAGE_KEY2, JSON.stringify(completed));
    }, 300);
}

function safeParse(key) {
    try {
        return JSON.parse(localStorage.getItem(key)) || [];
    } catch {
        return [];
    }
}

/* ===================== LOAD ===================== */

function load_Tasks() {
    const activeRaw = safeParse(STORAGE_KEY);
    const completedRaw = safeParse(STORAGE_KEY2);

    activeRaw.forEach(data => {
        const task = TaskManager.fromJSON(data);
        task_map.set(task.id, task);
        mountTask(task, false);
    });

    completedRaw.forEach(data => {
        const task = TaskManager.fromJSON(data);
        completed_task_map.set(task.id, task);
        mountTask(task, true);
    });

    updateCounters();
}

function mountTask(task, completed) {
    const clone = task.Create_task(template);
    container.appendChild(clone);

    const box = container.querySelector(
        `.box[data-task-id="${task.id}"]`
    );
    if (!box) return;

    box.querySelector(".task-title").textContent = task.Title;
    box.querySelector(".task-description").textContent = task.Description;
    box.querySelector(".task-due-date").textContent =
    task.DueDate ? CLOCK + task.DueDate : "";

    if (completed) {
        box.classList.add("completed");
        box.querySelector(".complete-task-button").textContent = "✓ Completed";

        box.querySelector(".task-title").setAttribute("contenteditable", "false");
        box.querySelector(".task-description").setAttribute("contenteditable", "false");
        box.querySelector(".task-due-date").setAttribute("contenteditable", "false");
    }
    updateCompleteButtonVisibility(box);
}

/* ===================== COUNTERS ===================== */

function updateCounters() {
    total_tasks.textContent =
        `Non-Completed Tasks: ${task_map.size}`;
    completed_tasks_count.textContent =
        `Completed Tasks: ${completed_task_map.size}`;
}

/* ===================== UI ===================== */

function updateCompleteButtonVisibility(taskBox) {
    const title = taskBox.querySelector(".task-title").textContent.trim();
    const desc = taskBox.querySelector(".task-description").textContent.trim();
    const due = taskBox.querySelector(".task-due-date").textContent
        .replace(CLOCK, "")
        .trim();

    taskBox.querySelector(".complete-task-button").style.display =
        title && desc && due ? "block" : "none";
}

/* ===================== ADD TASK ===================== */

addtaskBTN.addEventListener("click", () => {
    const task = new TaskManager();
    task_map.set(task.id, task);

    mountTask(task, false);
    updateCounters();
    save_Tasks();
});

/* ===================== CLICK EVENTS ===================== */

container.addEventListener("click", (e) => {
    const box = e.target.closest(".box");
    if (!box) return;

    const id = box.dataset.taskId;

    /* DELETE */
    if (e.target.classList.contains("delete-task-button")) {
        task_map.delete(id);
        completed_task_map.delete(id);
        box.remove();
        updateCounters();
        save_Tasks();
    }

    /* COMPLETE */
    if (e.target.classList.contains("complete-task-button")) {
        const task = task_map.get(id);
        if (!task) return;

        task.Completed = true;
        task_map.delete(id);
        completed_task_map.set(id, task);

        box.remove();
        mountTask(task, true);
        updateCounters();
        save_Tasks();
    }
});

/* ===================== INPUT (ACTIVE + COMPLETED) ===================== */

container.addEventListener("input", (e) => {
    const box = e.target.closest(".box");
    if (!box) return;

    const id = box.dataset.taskId;
    const task =
        task_map.get(id) ||
        completed_task_map.get(id);

    if (!task) return;

    if (e.target.classList.contains("task-title")) {
        task.Edit_task_title(e.target.textContent.trim());
    }

    if (e.target.classList.contains("task-description")) {
        task.Edit_task_description(e.target.textContent.trim());
    }

    if (e.target.classList.contains("task-due-date")) {
        task.Edit_task_dueDate(
            e.target.textContent.replace(CLOCK, "").trim()
        );
    }

    save_Tasks();
});

/* ===================== KEYDOWN ===================== */

container.addEventListener("keydown", (e) => {
    if (
        e.key === "Enter" &&
        e.target.matches(
            ".task-title, .task-description, .task-due-date"
        )
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
    const box = e.target.closest(".box");
    if (box) updateCompleteButtonVisibility(box);
});

/* ===================== SAFETY ===================== */

window.addEventListener("beforeunload", save_Tasks);

/* ===================== INIT ===================== */

load_Tasks();
