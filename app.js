// ===== USERS =====
let users = [
  { name: "Eshan", password: "123", role: "student", points: 120, history: [] },
  { name: "Aneya", password: "123", role: "student", points: 90, history: [] },

// ===== LOGIN FUNCTION (HERE) =====
function login() {
  alert("Login clicked");

  let name = document.getElementById("username").value;
  let pass = document.getElementById("password").value;

  if (name === "Eshan" && pass === "123") {
    window.location.href = "student.html";
  } 
  else if (name === "Faculty1" && pass === "admin") {
    window.location.href = "faculty.html";
  } 
  else {
    alert("Invalid login!");
  }
}
// ===== STUDENT DASHBOARD =====
function initStudent() {
  loadUsers();

  let name = localStorage.getItem("user");
  document.getElementById("userName").innerText = name;

  let user = users.find(u => u.name === name);
  document.getElementById("points").innerText = user.points;

  // Leaderboard
  let list = document.getElementById("leaderboard");
  users.filter(u => u.role === "student")
       .sort((a,b) => b.points - a.points)
       .forEach(u => {
         let li = document.createElement("li");
         li.innerText = u.name + " - " + u.points;
         list.appendChild(li);
       });

  // Rewards
  let rewards = [
    { name: "Eco Badge", cost: 50 },
    { name: "Sapling 🌱", cost: 100 }
  ];

  let div = document.getElementById("rewards");

  rewards.forEach(r => {
    let btn = document.createElement("button");
    btn.innerText = r.name + " (" + r.cost + ")";
    btn.onclick = () => redeem(r);
    div.appendChild(btn);
  });

  // History
  let hist = document.getElementById("history");
  user.history.forEach(h => {
    let li = document.createElement("li");
    li.innerText = h;
    hist.appendChild(li);
  });
}

// ===== REDEEM =====
function redeem(reward) {
  let name = localStorage.getItem("user");
  let user = users.find(u => u.name === name);

  if (user.points >= reward.cost) {
    user.points -= reward.cost;
    user.history.push("Redeemed: " + reward.name);

    saveUsers();
    location.reload();
  } else {
    alert("Not enough points!");
  }
}

// ===== FACULTY =====
function assignPoints() {
  loadUsers();

  let name = document.getElementById("studentName").value;
  let pts = parseInt(document.getElementById("pointsInput").value);

  let user = users.find(u => u.name === name && u.role === "student");

  if (user) {
    user.points += pts;
    user.history.push("Earned " + pts + " points");

    saveUsers();
    alert("Points assigned!");
  } else {
    alert("Student not found");
  }
}
