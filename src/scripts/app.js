const HOURS = Array.from({ length: 9 }, (_, i) => i + 9) // 9AM to 5PM
let tasks = {}
let date = new Date()
let currentDate = `${date.getFullYear()}-0${date.getMonth() + 1}-${date.getDate()}`

// Initialize the app
async function init() {
  loadTasks()
  setupEventListeners()
  await fetchQuote()
  renderTimeblocks()
  updateTimeblockColors()
  
  // Update colors every minute
  setInterval(updateTimeblockColors, 60000)

  // Set initial theme from localStorage or default to light
  const savedTheme = localStorage.getItem('theme') || 'light'
  document.documentElement.setAttribute('data-theme', savedTheme)
}

// Event Listeners
function setupEventListeners() {
  document.getElementById('darkModeToggle').addEventListener('click', toggleDarkMode)
  document.getElementById('clearAll').addEventListener('click', clearAllTasks)
  document.getElementById('dateSelector').addEventListener('change', handleDateChange)
  
  // Set default date
  document.getElementById('dateSelector').value = currentDate
}

// Dark Mode Toggle
function toggleDarkMode() {
  const currentTheme = document.documentElement.getAttribute('data-theme')
  const newTheme = currentTheme === 'dark' ? 'light' : 'dark'
  document.documentElement.setAttribute('data-theme', newTheme)
  localStorage.setItem('theme', newTheme)
}

// Quote of the Day
async function fetchQuote() {
  try {
    const response = await fetch('http://api.quotable.io/random')
    const data = await response.json()
    const quoteElement = document.getElementById('quoteOfDay')
    quoteElement.textContent = `"${data.content}" - ${data.author}`
    quoteElement.style.opacity = '0'
    quoteElement.style.transform = 'translateY(10px)'
    
    // Trigger animation
    setTimeout(() => {
      quoteElement.style.opacity = '1'
      quoteElement.style.transform = 'translateY(0)'
    }, 100)
  } catch (error) {
    console.error('Error fetching quote:', error)
  }
}

// Timeblock Management
function renderTimeblocks() {
  const container = document.getElementById('timeblocks')
  container.innerHTML = ''

  HOURS.forEach(hour => {
    const timeblock = createTimeblock(hour)
    container.appendChild(timeblock)
  })

  setupDragAndDrop()
}

function createTimeblock(hour) {
  const div = document.createElement('div')
  div.className = 'timeblock'
  div.setAttribute('data-hour', hour)
  div.draggable = true

  const timeDiv = document.createElement('div')
  timeDiv.className = 'time'
  timeDiv.textContent = `${hour}:00`

  const taskDiv = document.createElement('div')
  taskDiv.className = 'task'
  
  const textarea = document.createElement('textarea')
  textarea.value = getTask(hour) || ''
  textarea.placeholder = 'Enter your task here...'
  textarea.addEventListener('change', (e) => saveTask(hour, e.target.value))

  taskDiv.appendChild(textarea)
  div.appendChild(timeDiv)
  div.appendChild(taskDiv)

  return div
}

function updateTimeblockColors() {
  const currentHour = Math.floor(new Date().getTime() / 1000 / 60 / 60)
  
  HOURS.forEach(hour => {
    const date = new Date(currentDate)
    const time = Math.floor(date.getTime() / 1000 / 60 / 60)
    const timeblock = document.querySelector(`[data-hour="${hour}"]`)
    if (!timeblock) return

    timeblock.classList.remove('past', 'present', 'future')
    
    if (time < currentHour) {
      timeblock.classList.add('past')
      console.log("past")
    } else if (time === currentHour) {
      timeblock.classList.add('present')
      console.log("present")
    } else {
      timeblock.classList.add('future')
      console.log("future")
    }
  })
}

// Task Management
function getTask(hour) {
  return tasks[currentDate]?.[hour] || ''
}

function saveTask(hour, text) {
  if (!tasks[currentDate]) {
    tasks[currentDate] = {}
  }
  tasks[currentDate][hour] = text
  localStorage.setItem('plannerTasks', JSON.stringify(tasks))
}

function loadTasks() {
  const savedTasks = localStorage.getItem('plannerTasks')
  tasks = savedTasks ? JSON.parse(savedTasks) : {}
}

function clearAllTasks() {
  if (confirm('Are you sure you want to clear all tasks for this day?')) {
    tasks[currentDate] = {}
    localStorage.setItem('plannerTasks', JSON.stringify(tasks))
    renderTimeblocks()
    updateTimeblockColors()
  }
}

function handleDateChange(e) {
  currentDate = e.target.value
  renderTimeblocks()
  updateTimeblockColors()
}

// Drag and Drop
function setupDragAndDrop() {
  const timeblocks = document.querySelectorAll('.timeblock')
  
  timeblocks.forEach(timeblock => {
    timeblock.addEventListener('dragstart', handleDragStart)
    timeblock.addEventListener('dragend', handleDragEnd)
    timeblock.addEventListener('dragover', handleDragOver)
    timeblock.addEventListener('drop', handleDrop)
  })
}

function handleDragStart(e) {
  e.target.classList.add('dragging')
}

function handleDragEnd(e) {
  e.target.classList.remove('dragging')
}

function handleDragOver(e) {
  e.preventDefault()
}

function handleDrop(e) {
  e.preventDefault()
  const draggingElement = document.querySelector('.dragging')
  const dropTarget = e.target.closest('.timeblock')
  
  if (draggingElement && dropTarget) {
    const dragHour = parseInt(draggingElement.getAttribute('data-hour'))
    const dropHour = parseInt(dropTarget.getAttribute('data-hour'))
    
    // Swap tasks
    const dragTask = getTask(dragHour)
    const dropTask = getTask(dropHour)
    
    saveTask(dragHour, dropTask)
    saveTask(dropHour, dragTask)
    
    renderTimeblocks()
    updateTimeblockColors()
  }
}

// Initialize the app
init()