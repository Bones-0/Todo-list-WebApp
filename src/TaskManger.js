export default class TaskManager {
    constructor() {
        this.Title = "";
        this.Description = "";
        this.DueDate = "";
        this.Completed = false;
        this.id = crypto.randomUUID();
    }

    Create_task(template) {
        const fragment = template.content.cloneNode(true);   
        const taskElement = fragment.querySelector(".box");
        console.log("trying to work");

        taskElement.dataset.taskId = this.id; 
        return taskElement;
    }

    Delete_task(state, TaskID) {
        // state → "completed" or "incomplete"
        const element = document.getquerySelector(`[data-id='${TaskID}']`).remove();
        if (element) element.remove();

        if (state === "completed") {
            return true;
        } else {
            return false;
        }
    }

    Fetch_task_Details() {
        return {
            Title: this.Title,
            Description: this.Description,
            DueDate: this.DueDate,
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