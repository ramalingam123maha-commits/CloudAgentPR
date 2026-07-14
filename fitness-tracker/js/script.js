// Fitness Tracker Application

// Activity data storage
let activities = JSON.parse(localStorage.getItem('activities')) || [];

// Activity metadata for calculations
const activityMetadata = {
    walking: { caloriesPerMin: 5, speedKmPerHour: 5 },
    running: { caloriesPerMin: 12, speedKmPerHour: 10 },
    cycling: { caloriesPerMin: 10, speedKmPerHour: 20 },
    swimming: { caloriesPerMin: 11, speedKmPerHour: 8 },
    gym: { caloriesPerMin: 9, speedKmPerHour: 0 },
    yoga: { caloriesPerMin: 4, speedKmPerHour: 0 },
};

// Intensity multipliers
const intensityMultipliers = {
    low: 0.8,
    medium: 1.0,
    high: 1.3,
};

// DOM Elements
const activityForm = document.getElementById('activityForm');
const activityList = document.getElementById('activityList');
const stepsValue = document.getElementById('stepsValue');
const caloriesValue = document.getElementById('caloriesValue');
const distanceValue = document.getElementById('distanceValue');
const heartRateValue = document.getElementById('heartRateValue');

// Event Listeners
activityForm.addEventListener('submit', handleAddActivity);

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    renderActivityList();
    updateWeeklyChart();
});

/**
 * Handle form submission to add new activity
 */
function handleAddActivity(e) {
    e.preventDefault();

    const activityType = document.getElementById('activityType').value;
    const duration = parseInt(document.getElementById('duration').value);
    const intensity = document.getElementById('intensity').value;
    const distance = parseFloat(document.getElementById('distance').value) || 0;

    // Create activity object
    const activity = {
        id: Date.now(),
        type: activityType,
        duration,
        intensity,
        distance,
        timestamp: new Date().toLocaleString(),
        date: new Date(),
        calories: calculateCalories(activityType, duration, intensity),
        steps: calculateSteps(activityType, duration, distance),
    };

    // Add to activities
    activities.push(activity);
    localStorage.setItem('activities', JSON.stringify(activities));

    // Reset form and update UI
    activityForm.reset();
    updateDashboard();
    renderActivityList();
    updateWeeklyChart();

    // Show success feedback
    showSuccessMessage('Activity added successfully!');
}

/**
 * Calculate calories burned based on activity
 */
function calculateCalories(type, duration, intensity) {
    const baseCalories = activityMetadata[type].caloriesPerMin * duration;
    const adjustedCalories = baseCalories * intensityMultipliers[intensity];
    return Math.round(adjustedCalories);
}

/**
 * Calculate steps estimate
 */
function calculateSteps(type, duration, distance) {
    if (type === 'walking' || type === 'running') {
        // Assuming 1 km = 1300 steps
        return Math.round(distance * 1300 || duration * (type === 'running' ? 180 : 100));
    }
    return 0;
}

/**
 * Update dashboard statistics
 */
function updateDashboard() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayActivities = activities.filter(activity => {
        const actDate = new Date(activity.date);
        actDate.setHours(0, 0, 0, 0);
        return actDate.getTime() === today.getTime();
    });

    // Calculate stats
    const totalSteps = todayActivities.reduce((sum, act) => sum + act.steps, 0);
    const totalCalories = todayActivities.reduce((sum, act) => sum + act.calories, 0);
    const totalDistance = todayActivities.reduce((sum, act) => sum + act.distance, 0);
    const avgHeartRate = calculateAverageHeartRate(todayActivities);

    // Update DOM
    stepsValue.textContent = totalSteps.toLocaleString();
    caloriesValue.textContent = totalCalories.toLocaleString();
    distanceValue.textContent = totalDistance.toFixed(1);
    heartRateValue.textContent = avgHeartRate;
}

/**
 * Calculate average heart rate based on activity type and intensity
 */
function calculateAverageHeartRate(activitiesArray) {
    if (activitiesArray.length === 0) return 0;

    const heartRates = {
        low: 100,
        medium: 130,
        high: 160,
    };

    const totalHeartRate = activitiesArray.reduce((sum, activity) => {
        return sum + (heartRates[activity.intensity] || 120);
    }, 0);

    return Math.round(totalHeartRate / activitiesArray.length);
}

/**
 * Render activity list
 */
function renderActivityList() {
    if (activities.length === 0) {
        activityList.innerHTML = '<p class="empty-state">No activities logged yet. Start tracking!</p>';
        return;
    }

    const sortedActivities = [...activities].reverse();
    activityList.innerHTML = sortedActivities.map(activity => `
        <div class="activity-item">
            <div class="activity-item-info">
                <h4>${capitalizeText(activity.type)}</h4>
                <p class="activity-item-details">${activity.timestamp}</p>
            </div>
            <div class="activity-item-stats">
                <div class="stat-item">
                    <span class="stat-item-label">Duration</span>
                    <span class="stat-item-value">${activity.duration} min</span>
                </div>
                <div class="stat-item">
                    <span class="stat-item-label">Calories</span>
                    <span class="stat-item-value">${activity.calories} kcal</span>
                </div>
                <div class="stat-item">
                    <span class="stat-item-label">Distance</span>
                    <span class="stat-item-value">${activity.distance.toFixed(1)} km</span>
                </div>
                <div class="stat-item">
                    <span class="stat-item-label">Intensity</span>
                    <span class="stat-item-value">${capitalizeText(activity.intensity)}</span>
                </div>
                <button class="btn btn-danger" onclick="deleteActivity(${activity.id})">Delete</button>
            </div>
        </div>
    `).join('');
}

/**
 * Delete activity by ID
 */
function deleteActivity(id) {
    activities = activities.filter(activity => activity.id !== id);
    localStorage.setItem('activities', JSON.stringify(activities));
    updateDashboard();
    renderActivityList();
    updateWeeklyChart();
    showSuccessMessage('Activity deleted!');
}

/**
 * Update weekly chart with activity data
 */
function updateWeeklyChart() {
    const today = new Date();
    const weekData = Array(7).fill(0);

    // Calculate activity for each day of the week
    activities.forEach(activity => {
        const actDate = new Date(activity.date);
        const dayDiff = today.getDate() - actDate.getDate();
        const dayIndex = 6 - dayDiff; // Sunday (6) to Monday (0)

        if (dayIndex >= 0 && dayIndex < 7) {
            weekData[dayIndex] += activity.calories;
        }
    });

    // Update bar heights (max 300px)
    const maxCalories = Math.max(...weekData, 1);
    weekData.forEach((calories, index) => {
        const dayElement = document.getElementById(`day-${index}`);
        const barElement = dayElement.querySelector('.day-bar');
        const height = (calories / maxCalories) * 200;
        barElement.style.height = `${Math.max(height, 20)}px`;
        barElement.title = `${calories} kcal`;
    });
}

/**
 * Show success message
 */
function showSuccessMessage(message) {
    const messageElement = document.createElement('div');
    messageElement.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #2ecc71;
        color: white;
        padding: 15px 20px;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    messageElement.textContent = message;
    document.body.appendChild(messageElement);

    setTimeout(() => {
        messageElement.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => messageElement.remove(), 300);
    }, 3000);
}

/**
 * Capitalize first letter of text
 */
function capitalizeText(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}

// Add animations for success messages
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);
