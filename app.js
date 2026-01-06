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
    })
    .catch((error) => {
        console.error('Authentication error:', error);
        showMessage('Authentication failed. Please refresh the page.', 'error');
    });

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
    submitBtn.textContent = 'Submitting...';
    
    const confessionData = {
        text: confession,
        timestamp: firebase.database.ServerValue.TIMESTAMP,
        uid: auth.currentUser ? auth.currentUser.uid : 'anonymous'
    };
    
    // Push to Firebase Realtime Database
    database.ref('confessions').push(confessionData)
        .then(() => {
            showMessage('✅ Your confession has been submitted anonymously!', 'success');
            confessionText.value = '';
            charCount.textContent = '0';
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Confession';
        })
        .catch((error) => {
            console.error('Error submitting confession:', error);
            showMessage('❌ Failed to submit. Please try again.', 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Confession';
        });
}

// Show status message
function showMessage(message, type) {
    statusMessage.textContent = message;
    statusMessage.className = `status-message ${type}`;
    
    setTimeout(() => {
        statusMessage.style.display = 'none';
    }, 5000);
}
