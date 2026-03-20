// --- DATA INITIALIZATION ---
let users = JSON.parse(localStorage.getItem("users")) || [
    { name: "Eshan", password: "123", role: "student", points: 120, history: [] },
    { name: "Aneya", password: "123", role: "student", points: 180, history: [] },
    { name: "Faculty1", password: "admin", role: "faculty" }
];

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

// --- LOGIN LOGIC ---
function login() {
    const nameInput = document.getElementById("username").value.trim();
    const passInput = document.getElementById("password").value;
    const user = users.find(u => u.name.toLowerCase() === nameInput.toLowerCase() && u.password === passInput);

    if (user) {
        localStorage.setItem("user", user.name);
        localStorage.setItem("role", user.role);
        
        // Log the login
        loginLogs.unshift({ user: user.name, action: "Logged In", time: new Date().toLocaleString() });
        saveAll();

        window.location.href = (user.role === "student") ? "student.html" : "faculty.html";
    } else {
        alert("Invalid Login!");
    }
}

// --- FACULTY FUNCTIONS ---
function initFaculty() {
    if (localStorage.getItem("role") !== "faculty") { window.location.href = "index.html"; return; }
    updateStudentSelect();
    renderRewardsAdmin();
    renderLeaderboard();
    showLog('login');
}

function updateStudentSelect() {
    const select = document.getElementById("studentSelect");
    if (!select) return;
    select.innerHTML = '<option value="">-- Select Student --</option>';
    users.filter(u => u.role === 'student').forEach(u => {
        select.innerHTML += `<option value="${u.name}">${u.name}</option>`;
    });
}

// Reward Editing
function addReward() {
    const name = document.getElementById("rewardName").value;
    const cost = parseInt(document.getElementById("rewardCost").value);
    const icon = document.getElementById("rewardIcon").value || "🎁";
    if (name && cost) {
        rewardsList.push({ name, cost, icon });
        saveAll();
        renderRewardsAdmin();
    }
}

function renderRewardsAdmin() {
    const container = document.getElementById("rewardsListAdmin");
    if (!container) return;
    container.innerHTML = rewardsList.map((r, i) => `
        <div class="reward-edit-item">
            <span>${r.icon} <strong>${r.name}</strong> (${r.cost} Pts)</span>
            <button class="del-btn" onclick="removeReward(${i})">Delete</button>
        </div>
    `).join("");
}

function removeReward(index) {
    rewardsList.splice(index, 1);
    saveAll();
    renderRewardsAdmin();
}

// Logs Logic
function showLog(type) {
    const body = document.getElementById("logBody");
    const tabL = document.getElementById("tabLogin");
    const tabR = document.getElementById("tabRedeem");

    body.innerHTML = "";
    if (type === 'login') {
        tabL.classList.add('active'); tabR.classList.remove('active');
        loginLogs.slice(0, 10).forEach(l => {
            body.innerHTML += `<tr><td>${l.user}</td><td>${l.action}</td><td>${l.time}</td></tr>`;
        });
    } else {
        tabR.classList.add('active'); tabL.classList.remove('active');
        redeemLogs.slice(0, 10).forEach(l => {
            body.innerHTML += `<tr><td>${l.user}</td><td>Redeemed ${l.item}</td><td>${l.time}</td></tr>`;
        });
    }
}

// --- SHARED LEADERBOARD ---
function renderLeaderboard() {
    const section = document.getElementById("leaderboardSection");
    if (!section) return;
    const students = users.filter(u => u.role === "student").sort((a,b) => b.points - a.points);
    const max = Math.max(...students.map(s => s.points), 1);

    section.innerHTML = students.map((s, i) => `
        <div class="leader-row">
            <div class="rank-medal">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : (i + 1)}</div>
            <div class="user-info">
                <div class="name-pts"><span>${s.name}</span><span>${s.points} Pts</span></div>
                <div class="progress-bg"><div class="progress-fill" style="width:${(s.points/max)*100}%"></div></div>
            </div>
        </div>
    `).join("");
}

// --- STUDENT ACTIONS ---
function initStudent() {
    const name = localStorage.getItem("user");
    const u = users.find(user => user.name === name);
    if (!u) { window.location.href = "index.html"; return; }
    document.getElementById("userName").innerText = u.name;
    document.getElementById("points").innerText = u.points;
    renderLeaderboard();
    renderRewards(u.points);
}

function redeem(name, cost) {
    const u = users.find(user => user.name === localStorage.getItem("user"));
    if (u.points >= cost) {
        u.points -= cost;
        u.history.unshift({ action: `Redeemed ${name}`, date: new Date().toLocaleDateString() });
        
        // Add to global logs for Faculty
        redeemLogs.unshift({ user: u.name, item: name, time: new Date().toLocaleString() });
        
        saveAll();
        location.reload();
    }
}

function assignPoints() {
    const target = document.getElementById("manualName").value.trim() || document.getElementById("studentSelect").value;
    const pts = parseInt(document.getElementById("pointsInput").value);
    const student = users.find(u => u.name.toLowerCase() === target.toLowerCase());

    if (student && !isNaN(pts)) {
        student.points += pts;
        student.history.unshift({ action: `Received ${pts} Pts`, date: new Date().toLocaleDateString() });
        saveAll();
        alert("Credits added successfully!");
        location.reload();
    } else { alert("User not found!"); }
}

function logout() { localStorage.clear(); window.location.href = "index.html"; }
