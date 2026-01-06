// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyDQOyPTvonheJ77Rck4Kx989sQGd1zEkV4",
  authDomain: "hushly-nnc.firebaseapp.com",
  databaseURL: "https://hushly-nnc-default-rtdb.firebaseio.com",
  projectId: "hushly-nnc",
  storageBucket: "hushly-nnc.firebasestorage.app",
  messagingSenderId: "1001686893734",
  appId: "1:1001686893734:web:d3037506921d2e757f2067",
  measurementId: "G-4X0EX13KL6"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();

// DOM Elements
const confessionForm = document.getElementById('confessionForm');
const confessionText = document.getElementById('confessionText');
const submitBtn = document.getElementById('submitBtn');
const statusMessage = document.getElementById('statusMessage');
const charCount = document.getElementById('charCount');

// Character counter
confessionText.addEventListener('input', () => {
    const count = confessionText.value.length;
    charCount.textContent = count;
    
    if (count > 450) {
        charCount.style.color = '#e74c3c';
    } else {
        charCount.style.color = '#999';
    }
});

// Sign in anonymously when page loads
auth.signInAnonymously()
    .then(() => {
        console.log('Anonymous authentication successful');
        checkIfBanned();
    })
    .catch((error) => {
        console.error('Authentication error:', error);
        showMessage('Authentication failed. Please refresh the page.', 'error');
    });

// Check if user is banned
function checkIfBanned() {
    const uid = auth.currentUser.uid;
    database.ref('banned-users/' + uid).once('value')
        .then((snapshot) => {
            if (snapshot.exists()) {
                showMessage('⛔ You have been banned from submitting confessions.', 'error');
                submitBtn.disabled = true;
                confessionText.disabled = true;
            }
        });
}

// Handle form submission
confessionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const confession = confessionText.value.trim();
    
    if (confession.length === 0) {
        showMessage('Please write something before submitting!', 'error');
        return;
    }
    
    submitConfession(confession);
});

// Submit confession to Firebase
function submitConfession(confession) {
    submitBtn.disabled = true;
    submitBtn.querySelector('.button-text').textContent = 'Submitting...';
    
    const confessionData = {
        text: confession,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        uid: auth.currentUser ? auth.currentUser.uid : 'anonymous',
        reported: false
    };
    
    // Push to Firebase Realtime Database
    database.ref('confessions').push(confessionData)
        .then(() => {
            // Trigger sending animation
            triggerSendingAnimation();
            
            // Reset form after animation completes
            setTimeout(() => {
                confessionText.value = '';
                charCount.textContent = '0';
                submitBtn.disabled = false;
                submitBtn.querySelector('.button-text').textContent = 'Submit Confession';
            }, 3500);
        })
        .catch((error) => {
            console.error('Error submitting confession:', error);
            showMessage('❌ Failed to submit. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.querySelector('.button-text').textContent = 'Submit Confession';
        });
}

// Trigger sending animation modal
function triggerSendingAnimation() {
    const modal = document.getElementById('animationModal');
    const plane = document.getElementById('sendingPlane');
    const check = document.getElementById('successCheck');
    const text = document.getElementById('successText');

    // Show modal
    modal.classList.add('active');

    // Start plane flight after short delay
    setTimeout(() => {
        plane.classList.add('fly');
    }, 400);

    // Show checkmark
    setTimeout(() => {
        check.classList.add('show');
        text.classList.add('show');
    }, 1600);

    // Trigger confetti
    setTimeout(() => {
        triggerConfetti();
    }, 2200);

    // Hide modal after animation completes
    setTimeout(() => {
        modal.classList.remove('active');
        plane.classList.remove('fly');
        check.classList.remove('show');
        text.classList.remove('show');
    }, 3800);
}

// Confetti animation
function triggerConfetti() {
    const duration = 3 * 1000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10001 };

    function randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    const interval = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
            return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
        });
        confetti({
            ...defaults,
            particleCount,
            origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
        });
    }, 250);
}

// Show status message
function showMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 5000);
}
