// --- 1. DATA INITIALIZATION (Persistence Optimized) ---
let users = JSON.parse(localStorage.getItem("users"));
// --- NEW: ADD STUDENT FUNCTION (FACULTY ONLY) ---
function addStudent() {
    const newName = document.getElementById("regName").value.trim();
    const newPass = document.getElementById("regPass").value;

    if (!newName || !newPass) {
        alert("Please enter both name and password.");
        return;
    }

    // Check if student already exists
    const exists = users.find(u => u.name.toLowerCase() === newName.toLowerCase());
    if (exists) {
        alert("This student name is already registered.");
        return;
    }

    // Add new student object
    const newStudent = {
        name: newName,
        password: newPass,
        role: "student",
        points: 0,
        history: [{ action: "Account Created", date: new Date().toLocaleDateString() }]
    };

    users.push(newStudent);
    saveAll(); // Citing the saveAll function from previous context to persist data
    
    // UI Updates
    alert(`Success! ${newName} has been added.`);
    document.getElementById("regName").value = "";
    document.getElementById("regPass").value = "";
    
    // Refresh the faculty view components
    updateStudentSelect();
    renderLeaderboard();
}
// Only load defaults if the database is completely empty
if (!users) {
    users = [
        { 
            name: "Eshan", password: "123", role: "student", points: 120, 
            history: [
                { action: "Earned 50 Pts (Plastic Recycling)", date: "2026-03-15" },
                { action: "Redeemed Eco Badge", date: "2026-03-18" }
            ] 
        },
        { 
            name: "Aneya", password: "123", role: "student", points: 180, 
            history: [{ action: "Earned 80 Pts (Planting Trees)", date: "2026-03-10" }] 
        },
        { 
            name: "Arathy", password: "123", role: "student", points: 150, 
            history: [{ action: "Earned 30 Pts (Beach Cleanup)", date: "2026-03-19" }] 
        },
        { 
            name: "Gokul Viswa", password: "123", role: "student", points: 200, 
            history: [{ action: "Earned 100 Pts (Solar Project)", date: "2026-03-20" }] 
        },
        { name: "Faculty1", password: "admin", role: "faculty" }
    ];
    localStorage.setItem("users", JSON.stringify(users));
}

let rewardsList = JSON.parse(localStorage.getItem("rewards"));
if (!rewardsList) {
    rewardsList = [
        { name: "Eco Badge", cost: 50, icon: "🏅" },
        { name: "Tree Sapling", cost: 150, icon: "🌱" },
        { name: "Cafe Coupon", cost: 100, icon: "☕" }
    ];
    localStorage.setItem("rewards", JSON.stringify(rewardsList));
}

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
        
        // Log the login event
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
        <div class="leader-row" style="display: flex; align-items: center; gap: 15px; padding: 12px 0; border-bottom: 1px solid #f1f5f9;">
            <div class="rank" style="width: 32px; height: 32px; background: #f1f5f9; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-weight: 800;">${i + 1}</div>
            <div style="flex:1">
                <div style="display:flex; justify-content:space-between; font-weight:600;">
                    <span>${s.name}</span><span>${s.points} Pts</span>
                </div>
                <div class="progress-bar" style="height: 8px; background: #f1f5f9; border-radius: 10px; margin-top: 6px; overflow: hidden;">
                    <div class="progress-fill" style="background: #10b981; height: 100%; border-radius: 10px; width:${(s.points / max) * 100}%"></div>
                </div>
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
            <button class="btn-main" onclick="redeem('${r.name}', ${r.cost})" 
                ${userPoints < r.cost ? 'disabled style="background:#ccc; cursor:not-allowed; width:100%;"' : 'style="width:100%;"'}>
                Claim
            </button>
        </div>
    `).join("");
}

function redeem(name, cost) {
    const userName = localStorage.getItem("user");
    const user = users.find(u => u.name === userName);
    if (user && user.points >= cost) {
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
        <div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #eee; font-size:0.9rem;">
            <span>${h.action}</span><small color="#666">${h.date}</small>
        </div>
    `).join("");
}

// --- 5. FACULTY DASHBOARD ---
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
        <div style="display:flex; justify-content:space-between; align-items:center; padding:10px; border-bottom:1px solid #eee;">
            <span>${r.icon} ${r.name} (${r.cost} pts)</span>
            <button onclick="deleteReward(${i})" style="background:red; color:white; border:none; border-radius:4px; cursor:pointer; width:30px; height:30px;">X</button>
        </div>`).join("");
}

function deleteReward(index) {
    if(confirm("Delete this reward?")) {
        rewardsList.splice(index, 1);
        saveAll();
        location.reload();
    }
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
    } else { alert("User not found or invalid input."); }
}

function logout() { 
    // We don't use clear() because we want to keep the users/points database
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    window.location.href = "index.html"; 
}
