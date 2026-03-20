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

function saveAll() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("rewards", JSON.stringify(rewardsList));
}

// --- 2. LOGIN SYSTEM ---
function login() {
    const nameInput = document.getElementById("username").value.trim();
    const passInput = document.getElementById("password").value;
    const user = users.find(u => u.name.toLowerCase() === nameInput.toLowerCase() && u.password === passInput);

    if (user) {
        localStorage.setItem("user", user.name);
        localStorage.setItem("role", user.role);
        window.location.href = (user.role === "student") ? "student.html" : "faculty.html";
    } else {
        alert("Invalid Username or Password!");
    }
}

// --- 3. UNIVERSAL LEADERBOARD (Fixed & Shared) ---
function renderLeaderboard() {
    const section = document.getElementById("leaderboardSection");
    if (!section) return;

    const students = users.filter(u => u.role === "student").sort((a, b) => b.points - a.points);
    if (students.length === 0) {
        section.innerHTML = "<p style='text-align:center; color:#666;'>No student data available.</p>";
        return;
    }

    const max = Math.max(...students.map(s => s.points), 1);

    section.innerHTML = students.map((s, i) => `
        <div class="leader-row">
            <div class="rank-badge">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🌱'}</div>
            <div class="user-info" style="flex:1">
                <div class="name-row"><span>${s.name}</span><span>${s.points} Pts</span></div>
                <div class="progress-bg"><div class="progress-fill" style="width:${(s.points / max) * 100}%"></div></div>
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
    
    updateLevel(user.points);
    renderLeaderboard();
    renderRewards(user.points);
    renderHistory(user);
}

function updateLevel(pts) {
    let lvl = "Seed 🌰";
    if (pts >= 100) lvl = "Sapling 🌱";
    if (pts >= 250) lvl = "Tree 🌳";
    if (document.getElementById("userLevel")) document.getElementById("userLevel").innerText = lvl;
}

function renderRewards(userPoints) {
    const res = document.getElementById("rewardsSection");
    if (!res) return;
    res.innerHTML = rewardsList.map(r => `
        <div class="reward-item">
            <div style="font-size:2rem">${r.icon}</div>
            <strong>${r.name}</strong><br><small>${r.cost} Pts</small><br>
            <button onclick="redeem('${r.name}', ${r.cost})" ${userPoints < r.cost ? 'disabled style="background:#ccc"' : ''}>Claim</button>
        </div>
    `).join("");
}

function redeem(name, cost) {
    const user = users.find(u => u.name === localStorage.getItem("user"));
    if (user.points >= cost) {
        user.points -= cost;
        user.history.unshift({ action: `Redeemed ${name}`, date: new Date().toLocaleDateString() });
        saveAll();
        location.reload();
    }
}

function renderHistory(user) {
    const hist = document.getElementById("history");
    if (hist) hist.innerHTML = user.history.map(h => `
        <div class="history-item"><span>${h.action}</span><span class="history-date">${h.date}</span></div>
    `).join("");
}

// --- 5. FACULTY DASHBOARD ---
function initFaculty() {
    if (localStorage.getItem("role") !== "faculty") { window.location.href = "index.html"; return; }
    renderStudentList();
    renderRewardsAdmin();
    renderLeaderboard();
    updateStudentSelect();
}

function updateStudentSelect() {
    const select = document.getElementById("studentSelect");
    if (!select) return;
    select.innerHTML = '<option value="">-- Select Student --</option>';
    users.filter(u => u.role === 'student').forEach(u => {
        select.innerHTML += `<option value="${u.name}">${u.name}</option>`;
    });
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
        alert(`Success! ${pts} points added to ${student.name}.`);
        location.reload();
    } else {
        alert("Student not found or points invalid.");
    }
}

function addStudent() {
    const name = document.getElementById("newStudentName").value.trim();
    const pass = document.getElementById("newStudentPass").value;
    if (name && pass) {
        users.push({ name, password: pass, role: "student", points: 0, history: [] });
        saveAll();
        location.reload();
    }
}

function removeStudent(index) {
    if(confirm("Remove this student?")) {
        users.splice(index, 1);
        saveAll();
        location.reload();
    }
}

function renderStudentList() {
    const container = document.getElementById("studentListAdmin");
    if (!container) return;
    container.innerHTML = users.map((u, i) => u.role === 'student' ? `
        <div class="history-item">
            <span>${u.name} (${u.points} pts)</span>
            <button onclick="removeStudent(${i})" style="width:auto; background:#e74c3c; padding:2px 8px;">Delete</button>
        </div>` : '').join("");
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
        <div class="history-item">
            <span>${r.icon} ${r.name} (${r.cost} pts)</span>
            <button onclick="rewardsList.splice(${i},1); saveAll(); location.reload();" style="width:auto; background:#95a5a6; padding:2px 6px;">X</button>
        </div>`).join("");
}

function logout() { localStorage.clear(); window.location.href = "index.html"; }

  





