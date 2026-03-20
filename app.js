// --- Updated Data ---
let users = JSON.parse(localStorage.getItem("users")) || [
  { name: "Eshan", password: "123", role: "student", points: 120, history: [] },
  { name: "Aneya", password: "123", role: "student", points: 90, history: [] },
  { name: "Faculty1", password: "admin", role: "faculty" }
];

function saveUsers() { localStorage.setItem("users", JSON.stringify(users)); }

// Ensure data is loaded from the start
let users = JSON.parse(localStorage.getItem("users")) || [
  { name: "Eshan", password: "123", role: "student", points: 120, history: [] },
  { name: "Aneya", password: "123", role: "student", points: 180, history: [] }
];

function initStudent() {
    // 1. Get Logged in User
    const currentUser = localStorage.getItem("user");
    if (!currentUser) {
        window.location.href = "login.html";
        return;
    }

    // 2. Find User Data
    const user = users.find(u => u.name === currentUser);
    
    // 3. Update UI (Fixed Name & Points)
    if (user) {
        document.getElementById("userName").innerText = user.name;
        document.getElementById("points").innerText = user.points;
        renderInnovativeLeaderboard();
        renderHistory(user);
    }
}

// INNOVATIVE LEADERBOARD: Podium + Growth Bars
function renderInnovativeLeaderboard() {
    const list = document.getElementById("leaderboardSection");
    if (!list) return;

    // Sort students by points
    const students = users.filter(u => u.role === "student")
                          .sort((a, b) => b.points - a.points);

    let html = '<div class="podium-container">';
    
    students.forEach((s, index) => {
        const rank = index + 1;
        const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : "🌱";
        const barWidth = Math.min((s.points / students[0].points) * 100, 100);

        html += `
            <div class="leader-row">
                <div class="rank-badge">${medal}</div>
                <div class="user-info">
                    <div class="name-row">
                        <span>${s.name}</span>
                        <span class="pts-label">${s.points} Pts</span>
                    </div>
                    <div class="progress-bg">
                        <div class="progress-fill" style="width: ${barWidth}%"></div>
                    </div>
                </div>
            </div>
        `;
    });

    html += '</div>';
    list.innerHTML = html;
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
