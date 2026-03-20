// --- 1. DATA INITIALIZATION ---
let users = JSON.parse(localStorage.getItem("users")) || [
    { name: "Eshan", password: "123", role: "student", points: 120, history: [] },
    { name: "Aneya", password: "123", role: "student", points: 180, history: [] },
    { name: "Faculty1", password: "admin", role: "faculty" }
];

let rewardsList = JSON.parse(localStorage.getItem("rewards")) || [
    { name: "Eco Badge", cost: 50, icon: "🏅" },
    { name: "Tree Sapling", cost: 150, icon: "🌱" },
    { name: "Cafe Coupon", cost: 100, icon: "☕" }
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
        alert("Invalid Username or Password!");
    }
}

// --- 3. UNIVERSAL LEADERBOARD ---
function renderLeaderboard() {
    const section = document.getElementById("leaderboardSection");
    if (!section) return;

    const students = users.filter(u => u.role === "student").sort((a, b) => b.points - a.points);
    const max = Math.max(...students.map(s => s.points), 1);

    section.innerHTML = students.map((s, i) => `
        <div class="leader-row">
            <div class="rank">${i + 1}</div>
            <div style="flex:1">
                <div style="display:flex; justify-content:space-between; font-weight:600;">
                    <span>${s.name}</span><span>${s.points} Pts</span>
                </div>
                <div class="progress-bar"><div class="progress-fill" style="width:${(s.points / max) * 100}%"></div></div>
            </div>
        </div>
    `).join("");
}

// --- 4. STUDENT DASHBOARD ---
function initStudent() {
    const currentUserName = localStorage.getItem("user");
    const user = users.find(u => u.name === currentUserName);
    if (!user) { window.location.href = "index.html"; return; }

    document.getElementById("userName").innerText = user.name;
    document.getElementById("points").innerText = user.points;
    
    renderLeaderboard();
    renderRewards(user.points);
    renderHistory(user);
}

function renderRewards(userPoints) {
    const res = document.getElementById("rewardsSection");
    if (!res) return;
    res.innerHTML = rewardsList.map(r => `
        <div class="reward-item" style="border:1px solid #eee; padding:15px; border-radius:12px; text-align:center;">
            <div style="font-size:2rem">${r.icon}</div>
            <strong>${r.name}</strong><br><small>${r.cost} Pts</small><br>
            <button class="btn-main" onclick="redeem('${r.name}', ${r.cost})" ${userPoints < r.cost ? 'disabled style="background:#ccc; cursor:not-allowed;"' : ''}>Claim</button>
        </div>
    `).join("");
}

function redeem(name, cost) {
    const user = users.find(u => u.name === localStorage.getItem("user"));
    if (user.points >= cost) {
        user.points -= cost;
        user.history.unshift({ action: `Redeemed ${name}`, date: new Date().toLocaleDateString() });
        redeemLogs.unshift({ user: user.name, item: name, time: new Date().toLocaleString() });
        saveAll();
        location.reload();
    }
}

function renderHistory(user) {
    const hist = document.getElementById("history");
    if (hist) hist.innerHTML = user.history.map(h => `
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee;">
            <span>${h.action}</span><small color="#666">${h.date}</small>
        </div>
    `).join("");
}

// --- 5. FACULTY DASHBOARD ---
function initFaculty() {
    if (localStorage.getItem("role") !== "faculty") { window.location.href = "index.html"; return; }
    renderRewardsAdmin();
    renderLeaderboard();
    updateStudentSelect();
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

function showLog(type) {
    const body = document.getElementById("logBody");
    const tabL = document.getElementById("tabLogin");
    const tabR = document.getElementById("tabRedeem");
    if(!body) return;

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

function addReward() {
    const name = document.getElementById("rewardName").value;
    const cost = parseInt(document.getElementById("rewardCost").value);
    const icon = document.getElementById("rewardIcon").value || "🎁";
    if (name && cost) {
        rewardsList.push({ name, cost, icon });
        saveAll();
        location.reload();
    }
}

function renderRewardsAdmin() {
    const container = document.getElementById("rewardsListAdmin");
    if (container) container.innerHTML = rewardsList.map((r, i) => `
        <div style="display:flex; justify-content:space-between; padding:10px; border-bottom:1px solid #eee;">
            <span>${r.icon} ${r.name} (${r.cost} pts)</span>
            <button onclick="rewardsList.splice(${i},1); saveAll(); location.reload();" style="background:red; color:white; border:none; border-radius:4px; cursor:pointer;">X</button>
        </div>`).join("");
}

function assignPoints() {
    const selectName = document.getElementById("studentSelect").value;
    const manualName = document.getElementById("manualName").value.trim();
    const pts = parseInt(document.getElementById("pointsInput").value);
    const finalName = manualName || selectName;
    const student = users.find(u => u.name.toLowerCase() === finalName.toLowerCase());

    if (student && !isNaN(pts)) {
        student.points += pts;
        student.history.unshift({ action: `Earned ${pts} Pts`, date: new Date().toLocaleDateString() });
        saveAll();
        location.reload();
    } else { alert("Error updating points."); }
}

function logout() { localStorage.clear(); window.location.href = "index.html"; }
