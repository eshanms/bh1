// 1. DATA INITIALIZATION
let users = JSON.parse(localStorage.getItem("users")) || [
  { name: "Eshan", password: "123", role: "student", points: 120, history: [] },
  { name: "Aneya", password: "123", role: "student", points: 90, history: [] },
  { name: "Faculty1", password: "admin", role: "faculty" }
];

// 2. SAVE/LOAD
function saveUsers() {
  localStorage.setItem("users", JSON.stringify(users));
}

function loadUsers() {
  const data = localStorage.getItem("users");
  if (data) users = JSON.parse(data);
}

// 3. LOGIN SYSTEM
function login() {
  loadUsers();
  const nameInput = document.getElementById("username").value;
  const passInput = document.getElementById("password").value;

  const user = users.find(u => u.name === nameInput && u.password === passInput);

  if (user) {
    localStorage.setItem("user", user.name);
    localStorage.setItem("role", user.role);
    window.location.href = (user.role === "student") ? "student.html" : "faculty.html";
  } else {
    alert("Invalid Username or Password!");
  }
}

// 4. LOGOUT
function logout() {
  localStorage.clear();
  window.location.href = "login.html";
}

// 5. STUDENT DASHBOARD
function initStudent() {
  loadUsers();
  const name = localStorage.getItem("user");
  const user = users.find(u => u.name === name);

  if (!user) return;

  document.getElementById("userName").innerText = user.name;
  document.getElementById("points").innerText = user.points;

  const list = document.getElementById("leaderboard");
  if (list) {
    list.innerHTML = "";
    users.filter(u => u.role === "student")
         .sort((a,b) => b.points - a.points)
         .forEach(u => {
           let li = document.createElement("li");
           li.innerText = u.name + " - " + u.points;
           list.appendChild(li);
         });
  }
}

// 6. FACULTY SYSTEM
function assignPoints() {
  loadUsers();
  const targetName = document.getElementById("studentName").value;
  const pts = parseInt(document.getElementById("pointsInput").value);

  const student = users.find(u => u.name === targetName && u.role === "student");

  if (student && !isNaN(pts)) {
    student.points += pts;
    student.history.push("Earned " + pts + " points");
    saveUsers();
    alert("Points assigned!");
    location.reload();
  } else {
    alert("Check student name or points value!");
  }
}

  


  
