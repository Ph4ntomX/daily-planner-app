// This file contains the JavaScript code for the daily planner web app.

const taskSlots = document.querySelectorAll('.task-slot');
const clearAllButton = document.getElementById('clear-all');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const tasks = JSON.parse(localStorage.getItem('tasks')) || {};

function init() {
    loadTasks();
    setEventListeners();
    updateTimeSlots();
}

function setEventListeners() {
    taskSlots.forEach(slot => {
        const addButton = slot.querySelector('.add-task');
        const editButton = slot.querySelector('.edit-task');
        const removeButton = slot.querySelector('.remove-task');
        const taskInput = slot.querySelector('.task-input');

        addButton.addEventListener('click', () => addTask(slot.dataset.time, taskInput.value));
        editButton.addEventListener('click', () => editTask(slot.dataset.time, taskInput.value));
        removeButton.addEventListener('click', () => removeTask(slot.dataset.time));
    });

    clearAllButton.addEventListener('click', clearAllTasks);
    darkModeToggle.addEventListener('click', toggleDarkMode);
}

function loadTasks() {
    for (const time in tasks) {
        const slot = document.querySelector(`.task-slot[data-time="${time}"]`);
        if (slot) {
            const taskInput = slot.querySelector('.task-input');
            taskInput.value = tasks[time];
        }
    }
}

function addTask(time, task) {
    if (task) {
        tasks[time] = task;
        updateLocalStorage();
        loadTasks();
    }
}

function editTask(time, task) {
    if (tasks[time] && task) {
        tasks[time] = task;
        updateLocalStorage();
        loadTasks();
    }
}

function removeTask(time) {
    delete tasks[time];
    updateLocalStorage();
    loadTasks();
}

function clearAllTasks() {
    for (const time in tasks) {
        delete tasks[time];
    }
    updateLocalStorage();
    loadTasks();
}

function updateLocalStorage() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
}

function updateTimeSlots() {
    const currentHour = new Date().getHours();
    taskSlots.forEach(slot => {
        const slotHour = parseInt(slot.dataset.time);
        slot.classList.remove('past', 'current', 'future');
        if (slotHour < currentHour) {
            slot.classList.add('past');
        } else if (slotHour === currentHour) {
            slot.classList.add('current');
        } else {
            slot.classList.add('future');
        }
    });
}

document.addEventListener('DOMContentLoaded', init);