// --- 1. DATA INITIALIZATION ---
// This handles both Students and Faculty
let users = JSON.parse(localStorage.getItem("users")) || [
  { name: "Eshan", password: "123", role: "student", points: 120, history: [] },
  { name: "Aneya", password: "123", role: "student", points: 180, history: [] },
  { name: "Faculty1", password: "admin", role: "faculty" }
];

// This pulls Rewards managed by the Faculty
let rewardsList = JSON.parse(localStorage.getItem("rewards")) || [
  { name: "Eco Badge", cost: 50, icon: "🏅" },
  { name: "Tree Sapling", cost: 150, icon: "🌱" },
  { name: "Cafe Coupon", cost: 100, icon: "☕" }
];

// Helper to save everything to browser memory
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

// --- 3. STUDENT DASHBOARD ---
function initStudent() {
    const currentUserName = localStorage.getItem("user");
    const user = users.find(u => u.name === currentUserName);

    if (!user) {
        window.location.href = "index.html";
        return;
    }

    document.getElementById("userName").innerText = user.name;
    document.getElementById("points").innerText = user.points;
    
    updateLevel(user.points);
    renderLeaderboard();
    renderRewards(user.points); // Now uses the dynamic rewardsList
    renderHistory(user);
}

function updateLevel(pts) {
    let lvl = "Seed 🌰";
    if (pts >= 100) lvl = "Sapling 🌱";
    if (pts >= 250) lvl = "Tree 🌳";
    const el = document.getElementById("userLevel");
    if (el) el.innerText = lvl;
}

function renderLeaderboard() {
    const section = document.getElementById("leaderboardSection");
    if (!section) return;

    const students = users.filter(u => u.role === "student").sort((a,b) => b.points - a.points);
    if (students.length === 0) return;

    const max = students[0].points || 1;

    section.innerHTML = students.map((s, i) => `
        <div class="leader-row">
            <div class="rank-badge">${i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : '🌱'}</div>
            <div class="user-info">
                <div class="name-row"><span>${s.name}</span><span>${s.points} Pts</span></div>
                <div class="progress-bg"><div class="progress-fill" style="width:${(s.points/max)*100}%"></div></div>
            </div>
        </div>
    `).join("");
}

function renderRewards(userPoints) {
    const res = document.getElementById("rewardsSection");
    if (!res) return;

    res.innerHTML = rewardsList.map(r => `
        <div class="reward-item">
            <div style="font-size: 2rem;">${r.icon}</div>
            <strong>${r.name}</strong>
            <p>${r.cost} Pts</p>
            <button onclick="redeem('${r.name}', ${r.cost})" 
                ${userPoints < r.cost ? 'disabled style="background:#ccc; cursor:not-allowed;"' : ''}>
                Claim
            </button>
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
    const histEl = document.getElementById("history");
    if (!histEl) return;
    histEl.innerHTML = user.history.map(h => `
        <div class="history-item"><span>${h.action}</span><span class="history-date">${h.date}</span></div>
    `).join("");
}

// --- 4. FACULTY ADMIN PANEL ---
function initFaculty() {
    if (localStorage.getItem("role") !== "faculty") {
        window.location.href = "index.html";
        return;
    }
    renderStudentList();
    renderRewardsAdmin();
    renderLeaderboard();
    updateStudentSelect();
}

// Student Management
function addStudent() {
    const name = document.getElementById("newStudentName").value.trim();
    const pass = document.getElementById("newStudentPass").value;

    if (name && pass) {
        users.push({ name, password: pass, role: "student", points: 0, history: [] });
        saveAll();
        alert("Student Created Successfully!");
        location.reload();
    }
}

function removeStudent(index) {
    if(confirm("Are you sure you want to remove this student?")) {
        users.splice(index, 1);
        saveAll();
        location.reload();
    }
}

function renderStudentList() {
    const container = document.getElementById("studentListAdmin");
    if (!container) return;
    container.innerHTML = "<h4>All Registered Students</h4>";
    users.forEach((u, i) => {
        if(u.role === 'student') {
            container.innerHTML += `
                <div class="history-item" style="padding: 10px 0; border-bottom: 1px solid #eee;">
                    <span>${u.name} (${u.points} pts)</span>
                    <button onclick="removeStudent(${i})" style="width:auto; padding:5px 10px; background:#e74c3c;">Delete</button>
                </div>
            `;
        }
    });
}

function updateStudentSelect() {
    const select = document.getElementById("studentSelect");
    if (!select) return;
    select.innerHTML = '<option value="">Select Student</option>';
    users.filter(u => u.role === 'student').forEach(u => {
        select.innerHTML += `<option value="${u.name}">${u.name}</option>`;
    });
}

function assignPoints() {
    const target = document.getElementById("studentSelect").value;
    const pts = parseInt(document.getElementById("pointsInput").value);
    const student = users.find(u => u.name === target);
    if (student && !isNaN(pts)) {
        student.points += pts;
        student.history.unshift({ action: `Earned ${pts} Pts`, date: new Date().toLocaleDateString() });
        saveAll();
        alert(`Successfully added ${pts} points to ${target}`);
        location.reload();
    }
}

// Reward Management
let editIndex = -1;
function addReward() {
    const name = document.getElementById("rewardName").value;
    const cost = parseInt(document.getElementById("rewardCost").value);
    const icon = document.getElementById("rewardIcon").value || "🎁";

    if (name && cost) {
        if (editIndex === -1) {
            rewardsList.push({ name, cost, icon });
        } else {
            rewardsList[editIndex] = { name, cost, icon };
            editIndex = -1;
        }
        saveAll();
        location.reload();
    }
}

function deleteReward(index) {
    rewardsList.splice(index, 1);
    saveAll();
    location.reload();
}

function editReward(index) {
    const r = rewardsList[index];
    document.getElementById("rewardName").value = r.name;
    document.getElementById("rewardCost").value = r.cost;
    document.getElementById("rewardIcon").value = r.icon;
    document.getElementById("rewardActionBtn").innerText = "Update Reward";
    editIndex = index;
    // Open the rewards section if it's closed
    document.querySelector('details:nth-of-type(3)').open = true;
}

function renderRewardsAdmin() {
    const container = document.getElementById("rewardsListAdmin");
    if (!container) return;
    container.innerHTML = rewardsList.map((r, i) => `
        <div class="history-item" style="padding: 10px 0; border-bottom: 1px solid #eee;">
            <span>${r.icon} ${r.name} - ${r.cost} pts</span>
            <div>
                <button onclick="editReward(${i})" style="width:auto; padding:5px; background:orange;">Edit</button>
                <button onclick="deleteReward(${i})" style="width:auto; padding:5px; background:#95a5a6;">X</button>
            </div>
        </div>
    `).join("");
}

function logout() { localStorage.clear(); window.location.href = "index.html"; }


