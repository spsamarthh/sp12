// DOM Elements
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');
const activityForm = document.getElementById('activity-form');
const dashboard = document.getElementById('dashboard');
const userName = document.getElementById('user-name');

// Mock user data (in a real app, this would be stored in a database)
let currentUser = null;
const users = [];

// IndexedDB setup
const dbName = 'fittrackDB';
const dbVersion = 1;

let db;
const request = indexedDB.open(dbName, dbVersion);

request.onerror = (event) => {
    console.error('Database error:', event.target.error);
};

request.onsuccess = (event) => {
    db = event.target.result;
    loadUserData();
};

request.onupgradeneeded = (event) => {
    const db = event.target.result;

    // Create object stores
    if (!db.objectStoreNames.contains('users')) {
        db.createObjectStore('users', { keyPath: 'email' });
    }
    if (!db.objectStoreNames.contains('activities')) {
        db.createObjectStore('activities', { keyPath: 'id', autoIncrement: true });
    }
};

// Update your data handling functions to use IndexedDB
function saveUser(user) {
    const transaction = db.transaction(['users'], 'readwrite');
    const store = transaction.objectStore('users');
    store.put(user);
}

function loadUserData() {
    const transaction = db.transaction(['users'], 'readonly');
    const store = transaction.objectStore('users');
    const request = store.getAll();

    request.onsuccess = () => {
        users.push(...request.result);
    };
}

// Utility Functions
function scrollToSignup() {
    document.getElementById('signup').scrollIntoView({ behavior: 'smooth' });
}

function showDashboard() {
    document.querySelectorAll('section').forEach(section => section.classList.add('hidden'));
    dashboard.classList.remove('hidden');
    updateDashboard();
}

function hideDashboard() {
    dashboard.classList.add('hidden');
    document.querySelectorAll('section').forEach(section => section.classList.remove('hidden'));
}

function updateDashboard() {
    if (!currentUser) return;

    userName.textContent = currentUser.name;

    // Update stats
    document.getElementById('steps-count').textContent = currentUser.stats.steps;
    document.getElementById('calories-count').textContent = currentUser.stats.calories;
    document.getElementById('distance-count').textContent = currentUser.stats.distance;

    // Update progress bars
    const stepsGoal = 10000;
    const caloriesGoal = 500;
    const distanceGoal = 5;

    document.getElementById('steps-progress').style.width = `${
        (currentUser.stats.steps / stepsGoal) * 100
    }%`;

    document.getElementById('calories-progress').style.width = `${
        (currentUser.stats.calories / caloriesGoal) * 100
    }%`;

    document.getElementById('distance-progress').style.width = `${  
        (currentUser.stats.distance / distanceGoal) * 100
    }%`;

}

// Add this to your existing JavaScript file
function addLoadingState(button) {
    button.classList.add('loading');
    setTimeout(() => {
        button.classList.remove('loading');
    }, 2000); // Simulated loading time
}

// Form Handlers
function handleLogin(event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    addLoadingState(submitButton);

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
        currentUser = user;
        showDashboard();
    } else {
        alert('Invalid credentials. Please try again.');
    }

    loginForm.reset();
    return false;
}

function handleSignup(event) {
    event.preventDefault();
    const submitButton = event.target.querySelector('button[type="submit"]');
    addLoadingState(submitButton);

    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;

    if (users.some(u => u.email === email)) {
        alert('Email already exists. Please use a different email.');
        return false;
    }

    const newUser = {
        name,
        email,
        password,
        stats: {
            steps: 0,
            calories: 0,
            distance: 0
        },
        activities: []
    };

    users.push(newUser);
    currentUser = newUser;
    showDashboard();
    signupForm.reset();
    return false;
}

function logActivity(event) {
    event.preventDefault();

    if (!currentUser) {
        alert('Please log in first');
        return false;
    }

    const type = document.getElementById('activity-type').value;
    const duration = parseInt(document.getElementById('activity-duration').value);
    const distance = parseFloat(document.getElementById('activity-distance').value);

    // Calculate calories (mock calculation - in a real app, this would be more sophisticated)
    const caloriesPerMinute = {
        running: 10,
        walking: 5,
        cycling: 7,
        swimming: 8
    };

    const calories = duration * caloriesPerMinute[type];
    const steps = type === 'walking' || type === 'running' ? Math.floor(distance * 1500) : 0;

    // Update user stats
    currentUser.stats.steps += steps;
    currentUser.stats.calories += calories;
    currentUser.stats.distance += distance;

    // Add activity to history
    currentUser.activities.push({
        type,
        duration,
        distance,
        calories,
        steps,
        date: new Date()
    });

    updateDashboard();
    activityForm.reset();
    alert('Activity logged successfully!');
    return false;
}

function logout() {
    currentUser = null;
    hideDashboard();
}

// Initialize event listeners
document.addEventListener('DOMContentLoaded', () => {
    loginForm.addEventListener('submit', handleLogin);
    signupForm.addEventListener('submit', handleSignup);
    activityForm.addEventListener('submit', logActivity);

    // Add mobile menu toggle functionality
    const menuToggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');

    menuToggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
    });

    // Close mobile menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
            navLinks.classList.remove('active');
        }
    });

    // Add loading animation for images
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('load', () => {
            img.classList.add('loaded');
        });
    });

    // Add active state to navigation links
    const navLinks = document.querySelectorAll('.nav-links a');
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
        });
    });

    // Set active state based on current section
    window.addEventListener('scroll', () => {
        let current = '';
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            if (pageYOffset >= sectionTop - 60) {
                current = section.getAttribute('id');
            }
        });

        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href').substring(1) === current) {
                link.classList.add('active');
            }
        });
    });
});

// Register Service Worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js')
            .then(registration => {
                console.log('ServiceWorker registration successful');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed: ', err);
            });
    });
}

// Add to Home Screen functionality
let deferredPrompt;
const addBtn = document.createElement('button');
addBtn.classList.add('add-button');
addBtn.style.display = 'none';
addBtn.textContent = 'Install FitTrack';

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    addBtn.style.display = 'block';
});

addBtn.addEventListener('click', async() => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log(`User response to the install prompt: ${outcome}`);
        deferredPrompt = null;
        addBtn.style.display = 'none';
    }
});