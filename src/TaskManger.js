export default class TaskManager {
    constructor(data = null) {
        this.id = data?.id ?? crypto.randomUUID();
        this.Title = data?.Title ?? "";
        this.Description = data?.Description ?? "";
        this.DueDate = data?.DueDate ?? "";
        this.Completed = data?.Completed ?? false;
    }

    toJSON() {
        return {
            id: this.id,
            Title: this.Title,
            Description: this.Description,
            DueDate: this.DueDate,
            Completed: this.Completed
        };
    }

    static fromJSON(obj) {
        return new TaskManager(obj);
    }

    Create_task(template) {
        const fragment = template.content.cloneNode(true);
        const taskElement = fragment.querySelector(".box");
        taskElement.dataset.taskId = this.id;
        return taskElement;
    }

    Fetch_task_Details() {
        return {
            Title: this.Title,
            Description: this.Description,
            DueDate: this.DueDate
        };
    }

    Edit_task_title(newTitle) {
        this.Title = newTitle;
    }

    Edit_task_description(newDescription) {
        this.Description = newDescription;
    }

    Edit_task_dueDate(newDueDate) {
        this.DueDate = newDueDate;
    }
}
