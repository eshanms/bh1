// --- Updated Data ---
let users = JSON.parse(localStorage.getItem("users")) || [
  { name: "Eshan", password: "123", role: "student", points: 120, history: [] },
  { name: "Aneya", password: "123", role: "student", points: 90, history: [] },
  { name: "Faculty1", password: "admin", role: "faculty" }
];

function saveUsers() { localStorage.setItem("users", JSON.stringify(users)); }

// --- FIXED GRAPH FUNCTION ---
function renderLeaderboard() {
    const canvas = document.getElementById('leaderboardChart');
    if (!canvas) return;

    const students = users.filter(u => u.role === "student");
    const names = students.map(s => s.name);
    const points = students.map(s => s.points);

    // Wait for Chart.js to be ready
    if (typeof Chart !== 'undefined') {
        new Chart(canvas, {
            type: 'bar',
            data: {
                labels: names,
                datasets: [{
                    label: 'Points Scored',
                    data: points,
                    backgroundColor: '#2ecc71'
                }]
            },
            options: { responsive: true, scales: { y: { beginAtZero: true } } }
        });
    } else {
        setTimeout(renderLeaderboard, 500); // Retry if library not loaded
    }
}

// --- REWARDS & CLAIMING ---
function redeem(rewardName, cost) {
    const name = localStorage.getItem("user");
    const user = users.find(u => u.name === name);

    if (user.points >= cost) {
        user.points -= cost;
        // Record Activity
        const date = new Date().toLocaleDateString();
        user.history.unshift({ action: `Redeemed ${rewardName}`, date: date });
        
        saveUsers();
        alert("🎉 Success! Reward claimed.");
        location.reload();
    } else {
        alert("❌ Not enough points!");
    }
}

// --- RENDER HISTORY ---
function renderHistory(user) {
    const historyList = document.getElementById("history");
    if (!historyList) return;
    
    historyList.innerHTML = user.history.map(item => `
        <div class="history-item">
            <span>${item.action}</span>
            <span class="history-date">${item.date}</span>
        </div>
    `).join("");
}

// Update the Faculty side to log history correctly
function assignPoints() {
    const target = document.getElementById("studentName").value;
    const pts = parseInt(document.getElementById("pointsInput").value);
    const student = users.find(u => u.name === target && u.role === "student");

    if (student && !isNaN(pts)) {
        student.points += pts;
        const date = new Date().toLocaleDateString();
        student.history.unshift({ action: `Earned ${pts} points`, date: date });
        
        saveUsers();
        alert("Points added to " + target);
        location.reload();
    } else {
        alert("Student not found!");
    }
}
