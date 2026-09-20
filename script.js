// Task Manager Dashboard using DOM


// HTML Elements
const taskList = document.getElementById("taskList");
const searchInput = document.getElementById("searchInput");
const filterSelect = document.getElementById("filterSelect");
const total = document.getElementById("total");
const completed = document.getElementById("completed");
const pending = document.getElementById("pending");

// Modal Elements
const taskModal = new bootstrap.Modal(document.getElementById('taskModal'));
const modalTitle = document.getElementById('modalTitle');
const modalTaskInput = document.getElementById('modalTaskInput');
const editTaskId = document.getElementById('editTaskId');
const saveTaskBtn = document.getElementById('saveTaskBtn');
const openAddModalBtn = document.getElementById('openAddModalBtn');

// Toast Elements
const successToast = new bootstrap.Toast(document.getElementById('successToast'));
const toastMessage = document.getElementById('toastMessage');

// Confirmation Modal Elements
const confirmModal = new bootstrap.Modal(document.getElementById('confirmModal'));
const confirmModalTitle = document.getElementById('confirmModalTitle');
const confirmModalBody = document.getElementById('confirmModalBody');
const confirmActionBtn = document.getElementById('confirmActionBtn');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');

// Exit Modal Elements
const exitModal = new bootstrap.Modal(document.getElementById('exitModal'));
const confirmExitBtn = document.getElementById('confirmExitBtn');
const exitBtn = document.getElementById('exitBtn');

// Pending action data
let pendingAction = null;

// Load tasks
let tasks = [];

try {
    tasks = JSON.parse(localStorage.getItem("tasks")) || [];
} catch (error) {
    console.log("Could not load saved tasks.");
    tasks = [];
}


// Fix existing IDs - convert timestamps to sequential numbers

function fixTaskIds() {
    if (tasks.length > 0) {
        // Check if any task has a timestamp ID (greater than 1000000000000)
        const hasTimestampId = tasks.some(task => task.id > 1000000000000);
        if (hasTimestampId) {
            // Reassign sequential IDs
            tasks.forEach((task, index) => {
                task.id = index + 1;
            });
            saveTasks();
            console.log(" Fixed task IDs to sequential numbers");
        }
    }
}

// Call this immediately to fix existing IDs
fixTaskIds();


// Function to generate sequential ID

function generateId() {
    if (tasks.length === 0) {
        return 1;
    }
    // Find the highest ID and add 1
    const maxId = Math.max(...tasks.map(task => task.id));
    return maxId + 1;
}


// Show Toast Message

function showToast(message) {
    toastMessage.textContent = message;
    successToast.show();
}


// Show Confirmation Dialog

function showConfirmation(title, message, actionType, callback) {
    confirmModalTitle.textContent = title;
    confirmModalBody.textContent = message;

    // Set button colors based on action type
    if (actionType === 'delete') {
        confirmActionBtn.className = 'btn btn-danger';
        confirmActionBtn.textContent = 'Delete';
    } else if (actionType === 'edit') {
        confirmActionBtn.className = 'btn btn-primary';
        confirmActionBtn.textContent = 'Edit';
    } else if (actionType === 'toggle') {
        confirmActionBtn.className = 'btn btn-warning';
        confirmActionBtn.textContent = 'Update';
    } else {
        confirmActionBtn.className = 'btn btn-primary';
        confirmActionBtn.textContent = 'Confirm';
    }

    pendingAction = callback;
    confirmModal.show();
}


// Confirm Action Handler

confirmActionBtn.addEventListener('click', function() {
    if (pendingAction) {
        pendingAction();
        pendingAction = null;
    }
    confirmModal.hide();
});


// Exit Application

exitBtn.addEventListener('click', function() {
    exitModal.show();
});

confirmExitBtn.addEventListener('click', function() {
    // Clear localStorage
    localStorage.removeItem('tasks');
    // Show exit message
    showToast('👋 Goodbye! Neema Task Manager closed.');
    exitModal.hide();
    // Redirect to a blank page or refresh
    setTimeout(function() {
        document.body.innerHTML = `
            <div style="display: flex; justify-content: center; align-items: center; height: 100vh; background: #e8e8e8; color: #1a2b3e; font-family: 'Segoe UI', sans-serif; flex-direction: column; gap: 20px;">
                <h1 style="font-size: 3rem;">👋 Goodbye!</h1>
                <p style="font-size: 1.2rem; color: #4a5d73;">Thank you for using Neema Task Manager</p>
                <button onclick="location.reload()" style="padding: 12px 30px; background: #2563eb; color: white; border: none; border-radius: 8px; font-size: 1rem; cursor: pointer; transition: background 0.3s;">
                    Start Again
                </button>
            </div>
        `;
    }, 500);
});


// Open Add Task Modal

openAddModalBtn.addEventListener("click", function() {
    modalTitle.textContent = "Add New Task";
    modalTaskInput.value = "";
    editTaskId.value = "";
    document.querySelector('.modal-footer .btn-primary').textContent = 'Save Task';
    taskModal.show();
    setTimeout(() => modalTaskInput.focus(), 300);
});


// Save Task (Add or Edit)

saveTaskBtn.addEventListener("click", function() {
    const title = modalTaskInput.value.trim();
    const editId = editTaskId.value;

    if (title === "") {
        alert("Please enter a task title");
        return;
    }

    if (editId) {
        // Edit existing task
        const task = tasks.find(function(t) {
            return t.id === Number(editId);
        });
        if (task) {
            const oldTitle = task.title;
            showConfirmation(
                'Edit Task',
                `Are you sure you want to edit task ${task.id} "${oldTitle}" to "${title}"?`,
                'edit',
                function() {
                    task.title = title;
                    saveTasks();
                    displayTasks();
                    taskModal.hide();
                    showToast('Task ' + task.id + ' updated successfully!');
                }
            );
        }
    } else {
        // Add new task with sequential ID
        showConfirmation(
            'Add New Task',
            `Are you sure you want to add task "${title}"?`,
            'add',
            function() {
                const task = {
                    id: generateId(),
                    title: title,
                    completed: false
                };
                tasks.push(task);
                saveTasks();
                displayTasks();
                taskModal.hide();
                showToast('Task added successfully! ');
            }
        );
    }
});

// Enter key support in modal
modalTaskInput.addEventListener("keydown", function(e) {
    if (e.key === "Enter") {
        saveTaskBtn.click();
    }
});


// Save Tasks

function saveTasks() {
    localStorage.setItem("tasks", JSON.stringify(tasks));
}


// Display Tasks (Table format)


function displayTasks() {
    let filteredTasks = tasks;

    // Search
    const searchText = searchInput.value.toLowerCase();
    filteredTasks = filteredTasks.filter(function(task) {
        return task.title.toLowerCase().includes(searchText);
    });

    // Filter
    if (filterSelect.value === "completed") {
        filteredTasks = filteredTasks.filter(function(task) {
            return task.completed;
        });
    } else if (filterSelect.value === "pending") {
        filteredTasks = filteredTasks.filter(function(task) {
            return !task.completed;
        });
    }

    // Build table rows
    if (filteredTasks.length === 0) {
        taskList.innerHTML = `
            <tr>
                <td colspan="4" class="empty-message">No tasks found. Try a different search or filter.</td>
            </tr>
        `;
    } else {
        let html = '';
        filteredTasks.forEach(function(task) {
            const statusClass = task.completed ? 'completed' : 'pending';
            const statusLabel = task.completed ? 'Completed' : 'Pending';
            const toggleLabel = task.completed ? 'Mark Pending' : 'Mark Done';
            const toggleIcon = task.completed ? 'bi-arrow-counterclockwise' : 'bi-check-circle';

            html += `
                <tr>
                    <td class="task-id">${task.id}</td>
                    <td class="task-title">${task.title}</td>
                    <td><span class="status-badge ${statusClass}">${statusLabel}</span></td>
                    <td class="text-end">
                        <div class="action-buttons">
                            <button class="action-btn toggle-btn" data-id="${task.id}" data-action="toggle" title="${toggleLabel}">
                                <i class="bi ${toggleIcon}"></i> ${toggleLabel}
                            </button>
                            <button class="action-btn edit-btn" data-id="${task.id}" data-action="edit" title="Edit task">
                                <i class="bi bi-pencil-square"></i> Edit
                            </button>
                            <button class="action-btn delete-btn" data-id="${task.id}" data-action="delete" title="Delete task">
                                <i class="bi bi-trash"></i> Delete
                            </button>
                        </div>
                    </td>
                </tr>
            `;
        });
        taskList.innerHTML = html;
    }

    // Attach event listeners to action buttons
    document.querySelectorAll('.action-btn').forEach(function(el) {
        el.removeEventListener('click', handleAction);
        el.addEventListener('click', handleAction);
    });

    updateStats();
}


// Action Handler (Toggle / Edit / Delete)

function handleAction(e) {
    const target = e.currentTarget;
    const id = Number(target.dataset.id);
    const action = target.dataset.action;
    const task = tasks.find(function(t) {
        return t.id === id;
    });

    if (!task) return;

    if (action === 'delete') {
        // Delete with custom confirmation
        showConfirmation(
            'Delete Task',
            `Are you sure you want to delete task ${task.id} "${task.title}"? This action cannot be undone.`,
            'delete',
            function() {
                tasks = tasks.filter(function(t) {
                    return t.id !== id;
                });
                saveTasks();
                displayTasks();
                showToast('Task ' + id + ' deleted successfully! 🗑️');
            }
        );
    } else if (action === 'toggle') {
        // Toggle status with custom confirmation
        const newStatus = task.completed ? 'pending' : 'completed';
        showConfirmation(
            'Update Status',
            `Are you sure you want to mark task ${task.id} "${task.title}" as ${newStatus}?`,
            'toggle',
            function() {
                task.completed = !task.completed;
                saveTasks();
                displayTasks();
                showToast('Task ' + id + ' status updated! 🔄');
            }
        );
    } else if (action === 'edit') {
        // Open edit modal
        modalTitle.textContent = "Edit Task " + task.id;
        modalTaskInput.value = task.title;
        editTaskId.value = task.id;
        document.querySelector('.modal-footer .btn-primary').textContent = 'Update Task';
        taskModal.show();
        setTimeout(() => modalTaskInput.focus(), 300);
        // Select all text for easy editing
        modalTaskInput.select();
    }
}


// Statistics

function updateStats() {
    total.textContent = tasks.length;
    const done = tasks.filter(function(t) {
        return t.completed;
    }).length;
    const pend = tasks.filter(function(t) {
        return !t.completed;
    }).length;
    completed.textContent = done;
    pending.textContent = pend;
}


// Search & Filter Events

searchInput.addEventListener("input", displayTasks);
filterSelect.addEventListener("change", displayTasks);


// Load Data

displayTasks();