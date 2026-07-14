# 💪 Fitness Tracker App

A modern, responsive web application to track your daily fitness activities and monitor your health goals. Built with vanilla HTML5, CSS3, and JavaScript.

## Features

✨ **Core Features:**
- 📊 **Real-time Dashboard** - View daily stats at a glance (steps, calories, distance, heart rate)
- 🏃 **Activity Logging** - Track multiple types of activities (walking, running, cycling, swimming, gym, yoga)
- 📝 **Activity Management** - Add, view, and delete activities with full details
- 📈 **Weekly Analytics** - Visual chart showing weekly activity trends
- 💾 **Local Storage** - Data persists even after closing the browser
- 📱 **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices

## Supported Activities

- **Walking** - Low impact cardio activity
- **Running** - High intensity cardio
- **Cycling** - Full-body workout
- **Swimming** - Low impact full-body exercise
- **Gym** - Strength and resistance training
- **Yoga** - Flexibility and mindfulness

## Installation

1. Clone or download the project:
```bash
git clone <repository-url>
cd fitness-tracker
```

2. Open `index.html` in your web browser:
```bash
open index.html
```

Or use a local server:
```bash
python -m http.server 8000
# Then visit http://localhost:8000
```

## Usage

### Adding an Activity

1. Select an activity type from the dropdown
2. Enter the duration in minutes (1-480 min)
3. Select intensity level (Low, Medium, High)
4. Optionally enter the distance in kilometers
5. Click "Add Activity"

### Viewing Statistics

- **Daily Stats**: Visible at the top of the page
  - Daily Steps
  - Calories Burned
  - Distance Covered
  - Average Heart Rate

- **Activity Log**: Complete history of logged activities with:
  - Activity type and timestamp
  - Duration and calories
  - Distance and intensity level
  - Delete button for each activity

- **Weekly Chart**: Bar chart showing weekly activity trends by calories burned

### Managing Activities

- Click the "Delete" button on any activity to remove it
- All stats update automatically when you add or remove activities
- Data is automatically saved to browser's local storage

## Technical Details

### Technology Stack
- **HTML5** - Semantic markup and form structure
- **CSS3** - Responsive grid layout, flexbox, gradients, and animations
- **Vanilla JavaScript** - No dependencies, pure ES6+ code

### Key Calculations

**Calories Burned:**
- Base calculation: Activity type × Duration × Intensity Multiplier
- Intensity: Low (0.8x), Medium (1.0x), High (1.3x)

**Steps Estimation:**
- Walking/Running: Distance × 1300 steps/km + duration-based estimate
- Other activities: 0 steps (not applicable)

**Heart Rate:**
- Estimated based on activity type and intensity
- Low: ~100 bpm, Medium: ~130 bpm, High: ~160 bpm

### Data Structure

Activities are stored as objects with the following properties:
```javascript
{
  id: timestamp,
  type: 'activity-type',
  duration: minutes,
  intensity: 'low|medium|high',
  distance: kilometers,
  timestamp: 'readable-date-string',
  date: Date object,
  calories: number,
  steps: number
}
```

## Responsive Breakpoints

- **Desktop** (>768px): Full multi-column layout
- **Tablet** (481-768px): 2-column stats grid, single-column form
- **Mobile** (<480px): Single-column layout for all sections

## Browser Support

- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+

## Features to Expand

Potential enhancements for future versions:
- User authentication and cloud sync
- Daily/weekly/monthly goals with progress tracking
- Social sharing and community challenges
- Wearable device integration (Fitbit, Apple Watch)
- Advanced analytics and trends
- Custom activity types
- Photo/media attachments for activities
- Integration with health APIs
- Push notifications and reminders

## File Structure

```
fitness-tracker/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # Styling and responsive design
├── js/
│   └── script.js       # Application logic
├── assets/             # Images and media (optional)
└── README.md           # Documentation
```

## Performance

- **Lightweight**: No external dependencies or CDN required
- **Fast Loading**: Optimized CSS and JavaScript
- **Efficient Storage**: Uses browser's local storage for data persistence
- **Smooth Animations**: CSS transitions and keyframe animations

## Security Notes

- All data is stored locally in the browser
- No data is sent to external servers
- No user authentication required
- Safe to use with personal fitness data

## License

MIT License - Feel free to use and modify for personal or commercial projects.

## Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## Support

For issues or questions, please open an issue on the repository or contact the maintainer.

---

**Happy Tracking! Stay active, stay healthy! 🏃‍♂️💪🚴**
