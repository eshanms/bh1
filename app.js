// --- 1. DATA ---
let users = JSON.parse(localStorage.getItem("users")) || [
  { name: "Eshan", password: "123", role: "student", points: 120, history: [] },
  { name: "Aneya", password: "123", role: "student", points: 180, history: [] },
  { name: "Faculty1", password: "admin", role: "faculty" }
];

const rewardsList = [
  { name: "Eco Badge", cost: 50, icon: "🏅" },
  { name: "Tree Sapling", cost: 150, icon: "🌱" },
  { name: "Cafe Coupon", cost: 100, icon: "☕" }
];

function saveUsers() { localStorage.setItem("users", JSON.stringify(users)); }

// --- 2. LOGIN ---
function login() {
  const name = document.getElementById("username").value.trim();
  const pass = document.getElementById("password").value;
  const user = users.find(u => u.name.toLowerCase() === name.toLowerCase() && u.password === pass);

  if (user) {
    localStorage.setItem("user", user.name);
    localStorage.setItem("role", user.role);
    window.location.href = user.role === "student" ? "student.html" : "faculty.html";
  } else {
    alert("Invalid credentials!");
  }
}

// --- 3. STUDENT DASHBOARD ---
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
    const el = document.getElementById("userLevel");
    if (el) el.innerText = lvl;
}

function renderLeaderboard() {
    const section = document.getElementById("leaderboardSection");
    const students = users.filter(u => u.role === "student").sort((a,b) => b.points - a.points);
    const max = students[0].points || 1;

    section.innerHTML = students.map((s, i) => `
        <div class="leader-row">
            <div class="rank-badge">${i === 0 ? '🥇' : i === 1 ? '🥈' : '🌱'}</div>
            <div class="user-info">
                <div class="name-row"><span>${s.name}</span><span>${s.points} Pts</span></div>
                <div class="progress-bg"><div class="progress-fill" style="width:${(s.points/max)*100}%"></div></div>
            </div>
        </div>
    `).join("");
}

function renderRewards(pts) {
    const res = document.getElementById("rewardsSection");
    res.innerHTML = rewardsList.map(r => `
        <div class="reward-item">
            ${r.icon}<br><strong>${r.name}</strong><br><small>${r.cost} Pts</small><br>
            <button onclick="redeem('${r.name}', ${r.cost})" ${pts < r.cost ? 'disabled style="background:#ccc"' : ''}>Claim</button>
        </div>
    `).join("");
}

function redeem(name, cost) {
    const user = users.find(u => u.name === localStorage.getItem("user"));
    if (user.points >= cost) {
        user.points -= cost;
        user.history.unshift({ action: `Redeemed ${name}`, date: new Date().toLocaleDateString() });
        saveUsers();
        location.reload();
    }
}

function renderHistory(user) {
    document.getElementById("history").innerHTML = user.history.map(h => `
        <div class="history-item"><span>${h.action}</span><span class="history-date">${h.date}</span></div>
    `).join("");
}

function assignPoints() {
    const target = document.getElementById("studentName").value;
    const pts = parseInt(document.getElementById("pointsInput").value);
    const student = users.find(u => u.name === target);
    if (student) {
        student.points += pts;
        student.history.unshift({ action: `Earned ${pts} Pts`, date: new Date().toLocaleDateString() });
        saveUsers();
        alert("Points added!");
        location.reload();
    }
}

let rewardsList = JSON.parse(localStorage.getItem("rewards")) || [
  { name: "Eco Badge", cost: 50, icon: "🏅" },
  { name: "Tree Sapling", cost: 150, icon: "🌱" }
];

function saveAll() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("rewards", JSON.stringify(rewardsList));
}

// --- FACULTY INITIALIZATION ---
function initFaculty() {
    renderStudentList();
    renderRewardsAdmin();
    renderLeaderboard(); // Reuse your leaderboard function
    updateStudentSelect();
}

// --- STUDENT MANAGEMENT ---
function addStudent() {
    const name = document.getElementById("newStudentName").value.trim();
    const pass = document.getElementById("newStudentPass").value;

    if (name && pass) {
        users.push({ name, password: pass, role: "student", points: 0, history: [] });
        saveAll();
        alert("Student Added!");
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
    container.innerHTML = "<h4>All Students</h4>";
    users.forEach((u, i) => {
        if(u.role === 'student') {
            container.innerHTML += `
                <div class="history-item">
                    <span>${u.name} (${u.points} pts)</span>
                    <button onclick="removeStudent(${i})" style="width:auto; padding:5px; background:red;">Remove</button>
                </div>
            `;
        }
    });
}

// --- REWARD MANAGEMENT ---
let editIndex = -1;

function addReward() {
    const name = document.getElementById("rewardName").value;
    const cost = parseInt(document.getElementById("rewardCost").value);
    const icon = document.getElementById("rewardIcon").value;

    if (editIndex === -1) {
        rewardsList.push({ name, cost, icon });
    } else {
        rewardsList[editIndex] = { name, cost, icon };
        editIndex = -1;
    }
    saveAll();
    location.reload();
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
}

function renderRewardsAdmin() {
    const container = document.getElementById("rewardsListAdmin");
    container.innerHTML = rewardsList.map((r, i) => `
        <div class="history-item">
            <span>${r.icon} ${r.name} - ${r.cost} pts</span>
            <div>
                <button onclick="editReward(${i})" style="width:auto; padding:5px; background:orange;">Edit</button>
                <button onclick="deleteReward(${i})" style="width:auto; padding:5px; background:red;">X</button>
            </div>
        </div>
    `).join("");
}

// --- UTILITIES ---
function updateStudentSelect() {
    const select = document.getElementById("studentSelect");
    users.filter(u => u.role === 'student').forEach(u => {
        select.innerHTML += `<option value="${u.name}">${u.name}</option>`;
    });
}
function logout() { localStorage.clear(); window.location.href = "index.html"; }

