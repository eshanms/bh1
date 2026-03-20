// --- 1. DATA INITIALIZATION ---
let users = JSON.parse(localStorage.getItem("users"));

if (!users) {
    users = [
        { name: "Eshan", password: "123", role: "student", points: 120, history: [{ action: "Account Created", date: "2026-03-15" }] },
        { name: "Aneya", password: "123", role: "student", points: 180, history: [{ action: "Account Created", date: "2026-03-15" }] },
        { name: "Faculty1", password: "admin", role: "faculty" }
    ];
    localStorage.setItem("users", JSON.stringify(users));
}

let rewardsList = JSON.parse(localStorage.getItem("rewards")) || [
    { name: "Eco Badge", cost: 50, icon: "🏅" },
    { name: "Tree Sapling", cost: 150, icon: "🌱" }
];

let loginLogs = JSON.parse(localStorage.getItem("loginLogs")) || [];
let redeemLogs = JSON.parse(localStorage.getItem("redeemLogs")) || [];

function saveAll() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("rewards", JSON.stringify(rewardsList));
    localStorage.setItem("loginLogs", JSON.stringify(loginLogs));
    localStorage.setItem("redeemLogs", JSON.stringify(redeemLogs));
}

// --- 2. LOGIN SYSTEM ---
function togglePassword() {
    const pw = document.getElementById("password");
    pw.type = pw.type === "password" ? "text" : "password";
}

function login() {
    const nameInput = document.getElementById("username").value.trim();
    const passInput = document.getElementById("password").value;
    const user = users.find(u => u.name.toLowerCase() === nameInput.toLowerCase() && u.password === passInput);

    if (user) {
        localStorage.setItem("user", user.name);
        localStorage.setItem("role", user.role);
        loginLogs.unshift({ user: user.name, action: "Logged In", time: new Date().toLocaleString() });
        saveAll();
        window.location.href = (user.role === "student") ? "student.html" : "faculty.html";
    } else {
        alert("Invalid credentials!");
    }
}

// --- 3. FACULTY FUNCTIONS ---
function initFaculty() {
    if (localStorage.getItem("role") !== "faculty") { window.location.href = "index.html"; return; }
    document.getElementById("adminName").innerText = localStorage.getItem("user");
    updateStudentSelect();
    renderLeaderboard();
    renderLogs();
}

function addStudent() {
    const name = document.getElementById("regName").value.trim();
    const pass = document.getElementById("regPass").value;
    if (name && pass) {
        users.push({ name, password: pass, role: "student", points: 0, history: [{ action: "Joined Bhoomify", date: new Date().toLocaleDateString() }] });
        saveAll();
        alert("Student Added!");
        location.reload();
    }
}

function removeStudent() {
    const name = document.getElementById("manualName").value.trim() || document.getElementById("studentSelect").value;
    if (!name) return alert("Select a student");
    if (confirm(`Delete ${name}?`)) {
        users = users.filter(u => u.name !== name);
        saveAll();
        location.reload();
    }
}

function assignPoints() {
    const name = document.getElementById("manualName").value.trim() || document.getElementById("studentSelect").value;
    const pts = parseInt(document.getElementById("pointsInput").value);
    const student = users.find(u => u.name === name);
    if (student && pts) {
        student.points += pts;
        student.history.unshift({ action: `Earned ${pts} Pts`, date: new Date().toLocaleDateString() });
        saveAll();
        location.reload();
    }
}

function renderLogs() {
    const loginBody = document.getElementById("loginBody");
    const redeemBody = document.getElementById("redeemLogBody");
    if (loginBody) loginBody.innerHTML = loginLogs.slice(0, 10).map(l => `<tr><td>${l.user}</td><td>${l.action}</td><td>${l.time}</td></tr>`).join("");
    if (redeemBody) redeemBody.innerHTML = redeemLogs.slice(0, 10).map(l => `<tr><td>${l.user}</td><td>Redeemed ${l.item}</td><td>${l.time}</td></tr>`).join("");
}

// --- 4. STUDENT FUNCTIONS ---
function initStudent() {
    const user = users.find(u => u.name === localStorage.getItem("user"));
    if (!user) return window.location.href = "index.html";
    document.getElementById("userName").innerText = user.name;
    document.getElementById("points").innerText = user.points;
    renderLeaderboard();
    renderRewards(user.points);
}

function renderRewards(userPoints) {
    const container = document.getElementById("rewardsSection");
    if (container) container.innerHTML = rewardsList.map(r => `
        <div class="card" style="text-align:center;">
            <div style="font-size:2rem">${r.icon}</div>
            <strong>${r.name}</strong><br><small>${r.cost} Pts</small><br>
            <button class="btn-main" onclick="redeem('${r.name}', ${r.cost})" ${userPoints < r.cost ? 'disabled style="background:#ccc"' : ''}>Claim</button>
        </div>
    `).join("");
}

function redeem(name, cost) {
    const user = users.find(u => u.name === localStorage.getItem("user"));
    if (user && user.points >= cost) {
        user.points -= cost;
        user.history.unshift({ action: `Redeemed ${name}`, date: new Date().toLocaleDateString() });
        redeemLogs.unshift({ user: user.name, item: name, time: new Date().toLocaleString() });
        saveAll();
        location.reload();
    }
}

function renderLeaderboard() {
    const section = document.getElementById("leaderboardSection");
    if (!section) return;
    const students = users.filter(u => u.role === "student").sort((a, b) => b.points - a.points);
    section.innerHTML = students.map((s, i) => `
        <div class="leader-row">
            <div class="rank">${i + 1}</div>
            <div style="flex:1">
                <div style="display:flex; justify-content:space-between"><strong>${s.name}</strong><span>${s.points} Pts</span></div>
                <div class="progress-bar"><div class="progress-fill" style="width:${Math.min(s.points, 100)}%"></div></div>
            </div>
        </div>
    `).join("");
}

function logout() { localStorage.removeItem("user"); localStorage.removeItem("role"); window.location.href = "index.html"; }
function updateStudentSelect() {
    const select = document.getElementById("studentSelect");
    if (select) select.innerHTML = users.filter(u => u.role === 'student').map(u => `<option value="${u.name}">${u.name}</option>`).join("");
}
function updateCredits() {
    const student = document.getElementById('studentSelect').value;
    const points = parseInt(document.getElementById('pointAmount').value);
    
    if(!student || !points) return alert("Fill all fields");

    let users = JSON.parse(localStorage.getItem('users')) || {};
    if(users[student]) {
        users[student].points += points;
        users[student].history.push({
            date: new Date().toLocaleDateString(),
            reason: "Faculty Reward",
            amount: points
        });
        localStorage.setItem('users', JSON.stringify(users));
        alert(`Successfully added ${points} to ${student}`);
    }
}

function addReward() {
    const name = document.getElementById('rewardName').value;
    const cost = document.getElementById('rewardCost').value;
    // Logic to push to a 'rewards' array in localStorage
    alert("Reward added to Student Shop!");
}
// Add these functions or update existing ones in app.js

function renderLeaderboard() {
    const section = document.getElementById("leaderboardSection");
    if (!section) return;

    const students = users.filter(u => u.role === "student").sort((a, b) => b.points - a.points);
    // Find highest points to set bar percentage
    const maxPoints = students.length > 0 ? Math.max(...students.map(s => s.points), 1) : 1;

    section.innerHTML = students.map((s, i) => {
        const percentage = (s.points / maxPoints) * 100;
        return `
            <div class="leader-row">
                <div class="leader-info">
                    <span>${i + 1}. ${s.name}</span>
                    <span>${s.points} Pts</span>
                </div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${percentage}%"></div>
                </div>
            </div>
        `;
    }).join("");
}

// Fixed addReward function
function addReward() {
    const name = document.getElementById("rewardName").value;
    const cost = parseInt(document.getElementById("rewardCost").value);
    if (name && cost) {
        rewardsList.push({ name, cost, icon: "🎁" });
        saveAll();
        alert("Reward Added!");
        location.reload();
    }
}

// Logic to handle log switching
function showLog(type) {
    const body = document.getElementById("logBody");
    const header = document.getElementById("logHeader");
    body.innerHTML = "";
    
    if (type === 'login') {
        header.innerHTML = "<th>User</th><th>Action</th><th>Time</th>";
        loginLogs.forEach(l => {
            body.innerHTML += `<tr><td>${l.user}</td><td>${l.action}</td><td>${l.time}</td></tr>`;
        });
    } else {
        header.innerHTML = "<th>User</th><th>Item</th><th>Time</th>";
        redeemLogs.forEach(l => {
            body.innerHTML += `<tr><td>${l.user}</td><td>${l.item}</td><td>${l.time}</td></tr>`;
        });
    }
}


function updatePoints() {
    const name = document.getElementById("studentSelect").value;
    const pts = parseInt(document.getElementById("pointsUpdate").value);
    
    let userIndex = users.findIndex(u => u.name === name);
    if (userIndex !== -1) {
        users[userIndex].points += pts;
        users[userIndex].history.push({
            date: new Date().toLocaleDateString(),
            event: "Faculty Update",
            amount: pts
        });
        saveData();
        renderLeaderboard();
        alert("Credits Updated!");
    }
}

function renderLeaderboard() {
    const container = document.getElementById("leaderboardDisplay");
    const students = users.filter(u => u.role === "student").sort((a,b) => b.points - a.points);
    const max = Math.max(...students.map(s => s.points), 1);

    container.innerHTML = students.map(s => `
        <div class="leader-row">
            <div class="leader-info"><span>${s.name}</span><span>${s.points} XP</span></div>
            <div class="bar-outer"><div class="bar-inner" style="width: ${(s.points/max)*100}%"></div></div>
        </div>
    `).join('');
}

function togglePass() {
    const p = document.getElementById("password");
    const t = document.querySelector(".pass-toggle");
    if(p.type === "password") {
        p.type = "text"; t.innerText = "HIDE";
    } else {
        p.type = "password"; t.innerText = "SHOW";
    }
}

function saveData() {
    localStorage.setItem("users", JSON.stringify(users));
}
