import './style.css'

interface Habit {
    name: string;
    date: string;
    goal: number;
    frequency: string;
    completed: number; 
}

let userHabits: Habit[] = []

function renderApp(): void {
    const habitViewContainer = document.querySelector<HTMLDivElement>('#habit-view-container')!
    const weeklyViewContainer = document.querySelector<HTMLDivElement>('#weekly-view-container')!
    const weeklySummaryContainer = document.querySelector<HTMLDivElement>('#weekly-summary-container')!
    const monthlyStatsContainer = document.querySelector<HTMLDivElement>('#monthly-stats-container')!

    habitViewContainer.innerHTML = renderHabitView()
    weeklyViewContainer.innerHTML = renderWeekView()
    weeklySummaryContainer.innerHTML = calculateWeeklySummary()
    monthlyStatsContainer.innerHTML = renderMonthlyStats()
}

function renderHabitView(): string {
    return `
        <div class="habit-view">
            <h2>Habit View</h2>
            <div class="habits-list">
                ${userHabits.length === 0 
                    ? '<p>No habits added yet.</p>'
                    : userHabits.map(habit => `
                        <div class="habit-item">
                            <span>
                                <input type="checkbox" class="habit-checkbox" data-habit="${habit.name}" data-date="${habit.date}">
                                ${habit.name} (Goal: ${habit.goal} ${mapFrequency(habit.frequency)}) - Completed: ${habit.completed}
                            </span>
                            <button class="edit-habit-btn" data-habit="${habit.name}" data-date="${habit.date}">✎</button>
                            <button class="delete-habit-btn" data-habit="${habit.name}" data-date="${habit.date}">×</button>
                        </div>
                    `).join('')}
            </div>
        </div>
    `
}

function mapFrequency(frequency: string): string {
    switch (frequency) {
        case 'daily':
            return 'days';
        case 'weekly':
            return 'weeks';
        case 'monthly':
            return 'months';
        default:
            return '';
    }
}

function setupEventListeners(): void {
    document.addEventListener('submit', (e) => {
        const target = e.target as HTMLFormElement
        if (target.id === 'addHabitForm') {
            e.preventDefault()
            const input = document.querySelector<HTMLInputElement>('#newHabit')!
            const goalInput = document.querySelector<HTMLInputElement>('#habitGoal')!
            const frequencySelect = document.querySelector<HTMLSelectElement>('#goalFrequency')!
            const newHabit = input.value.trim()
            const goal = parseInt(goalInput.value, 10)
            const frequency = frequencySelect.value
            const today = new Date().toISOString().split('T')[0]
            if (newHabit && goal && frequency && !userHabits.some(habit => habit.name === newHabit && habit.date === today)) {
                userHabits.push({ name: newHabit, date: today, goal, frequency, completed: 0 })
                renderApp()
                input.value = ''
                goalInput.value = ''
                frequencySelect.value = ''
            }
        }
    })

    document.addEventListener('click', (e) => {
        const target = e.target as HTMLElement

        if (target.classList.contains('edit-habit-btn')) {
            const habitName = target.dataset.habit
            const dateStr = target.dataset.date
            if (habitName && dateStr) {
                editHabit(habitName, dateStr)
            }
        }

        if (target.classList.contains('delete-habit-btn')) {
            const habitName = target.dataset.habit
            const dateStr = target.dataset.date
            if (habitName && dateStr) {
                deleteHabit(habitName, dateStr)
            }
        }

        if (target.classList.contains('view-btn') && target.dataset.view === 'week') {
            const weeklyView = document.getElementById('weekly-view')
            if (weeklyView) {
                weeklyView.scrollIntoView({ behavior: 'smooth' })
            }
        }

        if (target.classList.contains('month-item')) {
            const monthIndex = parseInt(target.dataset.month!, 10)
            showMonthlyActivityModal(monthIndex)
        }
    })

    document.addEventListener('change', (e) => {
        const target = e.target as HTMLInputElement
        if (target.classList.contains('habit-checkbox')) {
            const habitName = target.dataset.habit
            const dateStr = target.dataset.date
            if (habitName && dateStr) {
                const habit = userHabits.find(h => h.name === habitName && h.date === dateStr)
                if (habit) {
                    if (target.checked) {
                        habit.completed += 1
                        if (habit.completed >= habit.goal) {
                            alert(`Habit "${habit.name}" completed!`)
                            target.checked = false
                        }
                    } else {
                        habit.completed = Math.max(0, habit.completed - 1)
                    }
                    renderApp()
                }
            }
        }
    })
}

function editHabit(habitName: string, dateStr: string): void {
    const newHabitName = prompt("Edit habit name:", habitName)
    if (newHabitName) {
        userHabits = userHabits.map(habit =>
            habit.name === habitName && habit.date === dateStr
                ? { ...habit, name: newHabitName }
                : habit
        )
        renderApp()
    }
}

function renderWeekView(): string {
    return `
        <div id="weekly-view" class="week-view">
            ${userHabits.map(habit => renderHabitBox(habit)).join('')}
        </div>
    `
}

function renderHabitBox(habit: Habit): string {
    return `
        <div class="habit-box">
            <div class="habit-header">
                <h3>${habit.name}</h3>
            </div>
            <div class="habit-details">
                <textarea placeholder="Write more about this habit..."></textarea>
            </div>
        </div>
    `
}

function renderMonthlyStats(): string {
    const currentMonth = new Date().getMonth();
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 
                   'July', 'August', 'September', 'October', 'November', 'December'];

    const orderedMonths = months.slice(currentMonth).concat(months.slice(0, currentMonth));

    return `
        <div class="monthly-stats">
            <h2>Monthly stats</h2>
            <div class="months-list">
                ${orderedMonths.map((month, index) => {
                    const actualIndex = (currentMonth + index) % 12;
                    return `<div class="month-item" data-month="${actualIndex}">${month}</div>`;
                }).join('')}
            </div>
        </div>
    `;
}

function calculateWeeklySummary(): string {
    const today = new Date()
    const startOfWeek = new Date(today)
    startOfWeek.setDate(today.getDate() - today.getDay())

    const weeklySummary: { [key: string]: number } = {}

    userHabits.forEach(habit => {
        const habitDate = new Date(habit.date)
        if (habitDate >= startOfWeek && habitDate <= today) {
            weeklySummary[habit.name] = (weeklySummary[habit.name] || 0) + 1
        }
    })

    return `
        <div class="weekly-summary">
            <h3>Weekly Summary</h3>
            <ul>
                ${Object.entries(weeklySummary).map(([habit, count]) => `
                    <li>${habit}: ${count} time${count > 1 ? 's' : ''}</li>
                `).join('')}
            </ul>
        </div>
    `
}

function deleteHabit(habitName: string, dateStr: string): void {
    userHabits = userHabits.filter(habit => habit.name !== habitName || habit.date !== dateStr)
    renderApp()
}

function renderMonthlyActivity(monthIndex: number): string {
    const activities: { [key: string]: { count: number, goal: number } } = {}
    const currentYear = new Date().getFullYear()

    userHabits.forEach(habit => {
        const habitDate = new Date(habit.date)
        if (habitDate.getMonth() === monthIndex && habitDate.getFullYear() === currentYear) {
            if (!activities[habit.name]) {
                activities[habit.name] = { count: 0, goal: habit.goal }
            }
            activities[habit.name].count += 1
        }
    })

    return `
        <div class="monthly-activity">
            <h3>Activities for ${new Date(currentYear, monthIndex).toLocaleString('en-US', { month: 'long' })}</h3>
            <ul>
                ${Object.entries(activities).map(([habit, { count, goal }]) => `
                    <li>
                        ${habit}: ${count} times (Goal: ${goal})
                        <div class="progress-bar">
                            <div class="progress" style="width: ${(count / goal) * 100}%;"></div>
                        </div>
                    </li>
                `).join('')}
            </ul>
        </div>
    `
}

function showMonthlyActivityModal(monthIndex: number): void {
    const modal = document.createElement('div')
    modal.classList.add('modal')
    modal.innerHTML = `
        <div class="modal-content">
            <span class="close-button">&times;</span>
            ${renderMonthlyActivity(monthIndex)}
        </div>
    `
    document.body.appendChild(modal)

    const closeButton = modal.querySelector('.close-button')!
    closeButton.addEventListener('click', () => {
        document.body.removeChild(modal)
    })
}

document.addEventListener('DOMContentLoaded', () => {
    const startButton = document.getElementById('startTracking');
    if (startButton) {
        startButton.addEventListener('click', () => {
            document.getElementById('home')!.style.display = 'none';
            document.getElementById('app')!.style.display = 'block';
        });
    }
});

function initApp(): void {
    renderApp()
    setupEventListeners()
}

initApp()