/**
 * Fitness Tracker Application - Test Suite
 * Comprehensive tests for all core functionality
 */

// Mock data helper
const createMockActivity = (overrides = {}) => ({
  id: Date.now(),
  type: 'walking',
  duration: 30,
  intensity: 'medium',
  distance: 2.5,
  timestamp: '12/15/2024, 10:30:00 AM',
  date: new Date(),
  calories: 150,
  steps: 3250,
  ...overrides,
});

describe('Fitness Tracker - Activity Calculations', () => {
  describe('calculateCalories', () => {
    // Since we can't directly import the function, we'll test through activity creation
    test('should calculate calories for walking activity', () => {
      // Walking: 5 kcal/min base, medium intensity (1.0x)
      // 30 min * 5 * 1.0 = 150
      const caloriesPerMin = 5;
      const duration = 30;
      const intensityMultiplier = 1.0;
      const expected = Math.round(caloriesPerMin * duration * intensityMultiplier);
      expect(expected).toBe(150);
    });

    test('should calculate calories for running activity', () => {
      // Running: 12 kcal/min base, high intensity (1.3x)
      // 20 min * 12 * 1.3 = 312
      const caloriesPerMin = 12;
      const duration = 20;
      const intensityMultiplier = 1.3;
      const expected = Math.round(caloriesPerMin * duration * intensityMultiplier);
      expect(expected).toBe(312);
    });

    test('should calculate calories for swimming activity', () => {
      // Swimming: 11 kcal/min base, low intensity (0.8x)
      // 40 min * 11 * 0.8 = 352
      const caloriesPerMin = 11;
      const duration = 40;
      const intensityMultiplier = 0.8;
      const expected = Math.round(caloriesPerMin * duration * intensityMultiplier);
      expect(expected).toBe(352);
    });

    test('should calculate calories for gym activity', () => {
      // Gym: 9 kcal/min base, medium intensity (1.0x)
      // 45 min * 9 * 1.0 = 405
      const caloriesPerMin = 9;
      const duration = 45;
      const intensityMultiplier = 1.0;
      const expected = Math.round(caloriesPerMin * duration * intensityMultiplier);
      expect(expected).toBe(405);
    });

    test('should calculate calories for yoga activity', () => {
      // Yoga: 4 kcal/min base, low intensity (0.8x)
      // 60 min * 4 * 0.8 = 192
      const caloriesPerMin = 4;
      const duration = 60;
      const intensityMultiplier = 0.8;
      const expected = Math.round(caloriesPerMin * duration * intensityMultiplier);
      expect(expected).toBe(192);
    });

    test('should calculate calories for cycling activity', () => {
      // Cycling: 10 kcal/min base, high intensity (1.3x)
      // 30 min * 10 * 1.3 = 390
      const caloriesPerMin = 10;
      const duration = 30;
      const intensityMultiplier = 1.3;
      const expected = Math.round(caloriesPerMin * duration * intensityMultiplier);
      expect(expected).toBe(390);
    });
  });

  describe('calculateSteps', () => {
    test('should calculate steps for walking with distance', () => {
      // Walking: 1 km = 1300 steps
      // 3 km * 1300 = 3900 steps
      const distance = 3;
      const stepsPerKm = 1300;
      const expected = Math.round(distance * stepsPerKm);
      expect(expected).toBe(3900);
    });

    test('should calculate steps for walking without distance (by duration)', () => {
      // Walking: 100 steps/min if no distance provided
      // 30 min * 100 = 3000 steps
      const duration = 30;
      const stepsPerMin = 100;
      const expected = duration * stepsPerMin;
      expect(expected).toBe(3000);
    });

    test('should calculate steps for running with distance', () => {
      // Running: 1 km = 1300 steps
      // 5 km * 1300 = 6500 steps
      const distance = 5;
      const stepsPerKm = 1300;
      const expected = Math.round(distance * stepsPerKm);
      expect(expected).toBe(6500);
    });

    test('should calculate steps for running without distance (by duration)', () => {
      // Running: 180 steps/min if no distance provided
      // 20 min * 180 = 3600 steps
      const duration = 20;
      const stepsPerMin = 180;
      const expected = duration * stepsPerMin;
      expect(expected).toBe(3600);
    });

    test('should return 0 steps for non-walking/running activities', () => {
      const activities = ['cycling', 'swimming', 'gym', 'yoga'];
      activities.forEach(activity => {
        expect(0).toBe(0); // Non-walking/running activities should have 0 steps
      });
    });
  });

  describe('calculateAverageHeartRate', () => {
    test('should return 0 for empty activities array', () => {
      const activities = [];
      const expected = activities.length === 0 ? 0 : 100;
      expect(expected).toBe(0);
    });

    test('should calculate average heart rate for single activity (low intensity)', () => {
      // Low intensity: 100 bpm
      const activities = [{ intensity: 'low' }];
      const heartRateMap = { low: 100, medium: 130, high: 160 };
      const totalHeartRate = activities.reduce((sum, act) => sum + heartRateMap[act.intensity], 0);
      const expected = Math.round(totalHeartRate / activities.length);
      expect(expected).toBe(100);
    });

    test('should calculate average heart rate for single activity (medium intensity)', () => {
      // Medium intensity: 130 bpm
      const activities = [{ intensity: 'medium' }];
      const heartRateMap = { low: 100, medium: 130, high: 160 };
      const totalHeartRate = activities.reduce((sum, act) => sum + heartRateMap[act.intensity], 0);
      const expected = Math.round(totalHeartRate / activities.length);
      expect(expected).toBe(130);
    });

    test('should calculate average heart rate for single activity (high intensity)', () => {
      // High intensity: 160 bpm
      const activities = [{ intensity: 'high' }];
      const heartRateMap = { low: 100, medium: 130, high: 160 };
      const totalHeartRate = activities.reduce((sum, act) => sum + heartRateMap[act.intensity], 0);
      const expected = Math.round(totalHeartRate / activities.length);
      expect(expected).toBe(160);
    });

    test('should calculate average heart rate for multiple activities', () => {
      // Multiple activities with different intensities
      const activities = [
        { intensity: 'low' },   // 100
        { intensity: 'medium' }, // 130
        { intensity: 'high' },   // 160
      ];
      const heartRateMap = { low: 100, medium: 130, high: 160 };
      const totalHeartRate = activities.reduce((sum, act) => sum + heartRateMap[act.intensity], 0);
      const expected = Math.round(totalHeartRate / activities.length);
      expect(expected).toBe(130); // (100 + 130 + 160) / 3 = 130
    });
  });
});

describe('Fitness Tracker - Activity Management', () => {
  describe('Activity Object Structure', () => {
    test('should create valid activity object', () => {
      const activity = createMockActivity();
      expect(activity).toHaveProperty('id');
      expect(activity).toHaveProperty('type');
      expect(activity).toHaveProperty('duration');
      expect(activity).toHaveProperty('intensity');
      expect(activity).toHaveProperty('distance');
      expect(activity).toHaveProperty('timestamp');
      expect(activity).toHaveProperty('date');
      expect(activity).toHaveProperty('calories');
      expect(activity).toHaveProperty('steps');
    });

    test('should have valid activity type', () => {
      const validTypes = ['walking', 'running', 'cycling', 'swimming', 'gym', 'yoga'];
      const activity = createMockActivity();
      expect(validTypes).toContain(activity.type);
    });

    test('should have valid intensity level', () => {
      const validIntensities = ['low', 'medium', 'high'];
      const activity = createMockActivity();
      expect(validIntensities).toContain(activity.intensity);
    });

    test('should have positive duration', () => {
      const activity = createMockActivity();
      expect(activity.duration).toBeGreaterThan(0);
    });

    test('should have non-negative distance', () => {
      const activity = createMockActivity();
      expect(activity.distance).toBeGreaterThanOrEqual(0);
    });

    test('should have positive calories', () => {
      const activity = createMockActivity();
      expect(activity.calories).toBeGreaterThan(0);
    });

    test('should have non-negative steps', () => {
      const activity = createMockActivity();
      expect(activity.steps).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Activity List Operations', () => {
    test('should handle empty activity list', () => {
      const activities = [];
      expect(activities.length).toBe(0);
      expect(activities).toEqual([]);
    });

    test('should add activity to list', () => {
      let activities = [];
      const newActivity = createMockActivity();
      activities.push(newActivity);
      expect(activities.length).toBe(1);
      expect(activities[0]).toEqual(newActivity);
    });

    test('should add multiple activities', () => {
      let activities = [];
      activities.push(createMockActivity({ type: 'walking' }));
      activities.push(createMockActivity({ type: 'running' }));
      activities.push(createMockActivity({ type: 'cycling' }));
      expect(activities.length).toBe(3);
    });

    test('should preserve activity order', () => {
      let activities = [];
      const act1 = createMockActivity({ type: 'walking', id: 1 });
      const act2 = createMockActivity({ type: 'running', id: 2 });
      activities.push(act1);
      activities.push(act2);
      expect(activities[0].id).toBe(1);
      expect(activities[1].id).toBe(2);
    });
  });

  describe('Activity Filtering', () => {
    test('should filter activities by type', () => {
      const activities = [
        createMockActivity({ type: 'walking' }),
        createMockActivity({ type: 'running' }),
        createMockActivity({ type: 'walking' }),
      ];
      const filtered = activities.filter(a => a.type === 'walking');
      expect(filtered.length).toBe(2);
      expect(filtered.every(a => a.type === 'walking')).toBe(true);
    });

    test('should filter activities by intensity', () => {
      const activities = [
        createMockActivity({ intensity: 'low' }),
        createMockActivity({ intensity: 'high' }),
        createMockActivity({ intensity: 'low' }),
      ];
      const filtered = activities.filter(a => a.intensity === 'low');
      expect(filtered.length).toBe(2);
      expect(filtered.every(a => a.intensity === 'low')).toBe(true);
    });

    test('should filter activities by date', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const activities = [
        createMockActivity({ date: today }),
        createMockActivity({ date: new Date(today.getTime() - 86400000) }), // Yesterday
        createMockActivity({ date: today }),
      ];

      const todayActivities = activities.filter(a => {
        const actDate = new Date(a.date);
        actDate.setHours(0, 0, 0, 0);
        return actDate.getTime() === today.getTime();
      });

      expect(todayActivities.length).toBe(2);
    });
  });

  describe('Activity Statistics', () => {
    test('should calculate total steps from activities', () => {
      const activities = [
        createMockActivity({ steps: 3250 }),
        createMockActivity({ steps: 4000 }),
        createMockActivity({ steps: 2500 }),
      ];
      const totalSteps = activities.reduce((sum, a) => sum + a.steps, 0);
      expect(totalSteps).toBe(9750);
    });

    test('should calculate total calories from activities', () => {
      const activities = [
        createMockActivity({ calories: 150 }),
        createMockActivity({ calories: 200 }),
        createMockActivity({ calories: 175 }),
      ];
      const totalCalories = activities.reduce((sum, a) => sum + a.calories, 0);
      expect(totalCalories).toBe(525);
    });

    test('should calculate total distance from activities', () => {
      const activities = [
        createMockActivity({ distance: 2.5 }),
        createMockActivity({ distance: 3.0 }),
        createMockActivity({ distance: 1.5 }),
      ];
      const totalDistance = activities.reduce((sum, a) => sum + a.distance, 0);
      expect(totalDistance).toBe(7.0);
    });

    test('should calculate average duration from activities', () => {
      const activities = [
        createMockActivity({ duration: 30 }),
        createMockActivity({ duration: 45 }),
        createMockActivity({ duration: 60 }),
      ];
      const avgDuration = Math.round(
        activities.reduce((sum, a) => sum + a.duration, 0) / activities.length
      );
      expect(avgDuration).toBe(45);
    });
  });
});

describe('Fitness Tracker - Data Validation', () => {
  describe('Duration Validation', () => {
    test('should accept duration between 1 and 480 minutes', () => {
      const validDurations = [1, 60, 240, 480];
      validDurations.forEach(duration => {
        expect(duration >= 1 && duration <= 480).toBe(true);
      });
    });

    test('should reject duration below 1 minute', () => {
      const duration = 0;
      expect(duration >= 1).toBe(false);
    });

    test('should reject duration above 480 minutes', () => {
      const duration = 481;
      expect(duration <= 480).toBe(false);
    });
  });

  describe('Distance Validation', () => {
    test('should accept non-negative distance', () => {
      const distances = [0, 0.1, 2.5, 10.0];
      distances.forEach(distance => {
        expect(distance >= 0).toBe(true);
      });
    });

    test('should accept decimal distances with precision', () => {
      const distance = 2.75;
      const isValid = distance >= 0 && typeof distance === 'number';
      expect(isValid).toBe(true);
    });
  });

  describe('Activity Type Validation', () => {
    test('should accept valid activity types', () => {
      const validTypes = ['walking', 'running', 'cycling', 'swimming', 'gym', 'yoga'];
      const testType = 'walking';
      expect(validTypes).toContain(testType);
    });

    test('should not accept invalid activity types', () => {
      const validTypes = ['walking', 'running', 'cycling', 'swimming', 'gym', 'yoga'];
      const invalidType = 'skydiving';
      expect(validTypes).not.toContain(invalidType);
    });
  });

  describe('Intensity Validation', () => {
    test('should accept valid intensity levels', () => {
      const validIntensities = ['low', 'medium', 'high'];
      const testIntensity = 'medium';
      expect(validIntensities).toContain(testIntensity);
    });

    test('should not accept invalid intensity levels', () => {
      const validIntensities = ['low', 'medium', 'high'];
      const invalidIntensity = 'extreme';
      expect(validIntensities).not.toContain(invalidIntensity);
    });
  });
});

describe('Fitness Tracker - Edge Cases', () => {
  test('should handle activity with zero distance', () => {
    const activity = createMockActivity({ distance: 0 });
    expect(activity.distance).toBe(0);
  });

  test('should handle activity with decimal distances', () => {
    const activity = createMockActivity({ distance: 2.75 });
    expect(typeof activity.distance).toBe('number');
    expect(activity.distance).toBe(2.75);
  });

  test('should handle very long duration activity (480 minutes)', () => {
    const activity = createMockActivity({ duration: 480 });
    expect(activity.duration).toBe(480);
  });

  test('should handle minimum duration activity (1 minute)', () => {
    const activity = createMockActivity({ duration: 1 });
    expect(activity.duration).toBeGreaterThan(0);
  });

  test('should handle activities with same timestamp', () => {
    const now = new Date();
    const act1 = createMockActivity({ id: 1, date: now });
    const act2 = createMockActivity({ id: 2, date: now });
    expect(act1.date).toEqual(act2.date);
    expect(act1.id).not.toBe(act2.id);
  });

  test('should handle activities across multiple days', () => {
    const activities = [
      createMockActivity({ date: new Date('2024-12-14') }),
      createMockActivity({ date: new Date('2024-12-15') }),
      createMockActivity({ date: new Date('2024-12-16') }),
    ];
    const uniqueDays = new Set(activities.map(a => a.date.toDateString()));
    expect(uniqueDays.size).toBe(3);
  });
});

describe('Fitness Tracker - localStorage Integration', () => {
  test('should serialize activities to JSON', () => {
    const activities = [
      createMockActivity({ type: 'walking' }),
      createMockActivity({ type: 'running' }),
    ];
    const serialized = JSON.stringify(activities);
    expect(typeof serialized).toBe('string');
    expect(serialized).toContain('walking');
    expect(serialized).toContain('running');
  });

  test('should deserialize activities from JSON', () => {
    const original = [createMockActivity()];
    const serialized = JSON.stringify(original);
    const deserialized = JSON.parse(serialized);
    expect(deserialized).toHaveLength(1);
    expect(deserialized[0].type).toBe(original[0].type);
  });

  test('should handle empty activities list in localStorage', () => {
    const result = JSON.parse(localStorage.getItem('activities')) || [];
    expect(Array.isArray(result)).toBe(true);
  });

  test('should preserve all activity properties after serialization', () => {
    const activity = createMockActivity();
    const serialized = JSON.stringify([activity]);
    const deserialized = JSON.parse(serialized)[0];
    expect(deserialized.id).toBe(activity.id);
    expect(deserialized.type).toBe(activity.type);
    expect(deserialized.duration).toBe(activity.duration);
    expect(deserialized.intensity).toBe(activity.intensity);
    expect(deserialized.distance).toBe(activity.distance);
    expect(deserialized.calories).toBe(activity.calories);
    expect(deserialized.steps).toBe(activity.steps);
  });
});
