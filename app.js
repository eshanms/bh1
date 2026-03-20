// --- 1. PERSISTENT DATA INITIALIZATION ---
let users = JSON.parse(localStorage.getItem("users")) || [
    { name: "Faculty1", password: "admin", role: "faculty" },
    { name: "Eshan", password: "123", role: "student", points: 150, history: [] }
];
let rewardsList = JSON.parse(localStorage.getItem("rewards")) || [
    { name: "Eco Badge", cost: 50, icon: "🏅" },
    { name: "Canteen Coupon", cost: 100, icon: "🎫" }
];
let loginLogs = JSON.parse(localStorage.getItem("loginLogs")) || [];
let redeemLogs = JSON.parse(localStorage.getItem("redeemLogs")) || [];

function saveAll() {
    localStorage.setItem("users", JSON.stringify(users));
    localStorage.setItem("rewards", JSON.stringify(rewardsList));
    localStorage.setItem("loginLogs", JSON.stringify(loginLogs));
    localStorage.setItem("redeemLogs", JSON.stringify(redeemLogs));
}

// --- 2. SECURITY & LOGIN ---
function togglePassword() {
    const p = document.getElementById("password");
    const icon = document.getElementById("togglePass");
    p.type = p.type === "password" ? "text" : "password";
    icon.classList.toggle("fa-eye-slash");
}

function login() {
    const nameInput = document.getElementById("username").value.trim();
    const passInput = document.getElementById("password").value;
    const user = users.find(u => u.name.toLowerCase() === nameInput.toLowerCase() && u.password === passInput);

    if (user) {
        localStorage.setItem("currentUser", user.name);
        localStorage.setItem("currentRole", user.role);
        loginLogs.unshift({ user: user.name, status: "Success", time: new Date().toLocaleString() });
        saveAll();
        window.location.href = (user.role === "faculty") ? "faculty.html" : "student.html";
    } else {
        alert("Invalid Username or Password");
    }
}

function logout() {
    localStorage.removeItem("currentUser");
    localStorage.removeItem("currentRole");
    window.location.href = "index.html";
}

// --- 3. FACULTY CONTROLS ---
function initFaculty() {
    if (localStorage.getItem("currentRole") !== "faculty") window.location.href = "index.html";
    document.getElementById("adminName").innerText = localStorage.getItem("currentUser");
    updateStudentDropdown();
    renderLeaderboard();
    renderSystemLogs();
}

function updateStudentDropdown() {
    const select = document.getElementById("studentSelect");
    if (select) {
        const students = users.filter(u => u.role === "student");
        select.innerHTML = students.map(s => `<option value="${s.name}">${s.name}</option>`).join("");
    }
}

function addStudent() {
    const name = document.getElementById("regName").value.trim();
    const pass = document.getElementById("regPass").value;
    if (name && pass) {
        users.push({ name, password: pass, role: "student", points: 0, history: [] });
        saveAll();
        alert("Account Created!");
        location.reload();
    }
}

function assignPoints() {
    const name = document.getElementById("studentSelect").value;
    const pts = parseInt(document.getElementById("pointsInput").value);
    const user = users.find(u => u.name === name);
    if (user && pts) {
        user.points += pts;
        saveAll();
        alert(`Added ${pts} to ${name}`);
        location.reload();
    }
}

function removeStudent() {
    const name = document.getElementById("studentSelect").value;
    if (confirm(`Delete ${name}'s account forever?`)) {
        users = users.filter(u => u.name !== name);
        saveAll();
        location.reload();
    }
}

function addReward() {
    const name = document.getElementById("rewardName").value.trim();
    const cost = parseInt(document.getElementById("rewardCost").value);
    if (name && cost) {
        rewardsList.push({ name, cost, icon: "🎁" });
        saveAll();
        alert("Reward Added!");
        location.reload();
    }
}

function renderSystemLogs() {
    const loginTbody = document.getElementById("loginBody");
    const redeemTbody = document.getElementById("redeemLogBody");
    if (loginTbody) loginTbody.innerHTML = loginLogs.slice(0, 8).map(l => `<tr><td>${l.user}</td><td>${l.status}</td><td>${l.time}</td></tr>`).join("");
    if (redeemTbody) redeemTbody.innerHTML = redeemLogs.slice(0, 8).map(l => `<tr><td>${l.user}</td><td>${l.item}</td><td>${l.time}</td></tr>`).join("");
}

// --- 4. STUDENT FEATURES ---
function initStudent() {
    const name = localStorage.getItem("currentUser");
    const user = users.find(u => u.name === name);
    if (!user) window.location.href = "index.html";

    document.getElementById("userName").innerText = user.name;
    document.getElementById("points").innerText = user.points;
    renderLeaderboard();
    renderShop(user.points);
}

function renderShop(balance) {
    const container = document.getElementById("rewardsSection");
    if (container) {
        container.innerHTML = rewardsList.map(r => `
            <div class="card" style="text-align: center; border: 2px solid #f1f5f9;">
                <div style="font-size: 2.5rem; margin-bottom: 10px;">${r.icon}</div>
                <strong style="font-size: 1.1rem;">${r.name}</strong>
                <p style="color: var(--primary); font-weight: 700;">${r.cost} Pts</p>
                <button class="btn-main" onclick="claim('${r.name}', ${r.cost})" ${balance < r.cost ? 'disabled style="background:#cbd5e1"' : ''}>
                    ${balance < r.cost ? 'Not Enough Pts' : 'Claim Now'}
                </button>
            </div>
        `).join("");
    }
}

function claim(itemName, itemCost) {
    const user = users.find(u => u.name === localStorage.getItem("currentUser"));
    if (user && user.points >= itemCost) {
        user.points -= itemCost;
        redeemLogs.unshift({ user: user.name, item: itemName, time: new Date().toLocaleString() });
        saveAll();
        alert(`Success! You claimed ${itemName}`);
        location.reload();
    }
}

// --- 5. SHARED COMPONENTS ---
function renderLeaderboard() {
    const section = document.getElementById("leaderboardSection");
    if (!section) return;

    const students = users.filter(u => u.role === "student").sort((a, b) => b.points - a.points);
    const maxPoints = students.length > 0 ? Math.max(...students.map(s => s.points), 1) : 1;

    section.innerHTML = students.map((s, i) => {
        const pct = (s.points / maxPoints) * 100;
        return `
            <div class="leader-row">
                <div style="display:flex; justify-content:space-between; font-weight:600; margin-bottom: 5px;">
                    <span>${i + 1}. ${s.name}</span>
                    <span style="color: var(--primary);">${s.points} Pts</span>
                </div>
                <div class="bar-container">
                    <div class="bar-fill" style="width: ${pct}%"></div>
                </div>
            </div>
        `;
    }).join("");
}
