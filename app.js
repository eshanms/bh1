// --- 1. SETUP DATA (Include initial history for demo) ---
let users = JSON.parse(localStorage.getItem("users")) || [
  { name: "Eshan", password: "123", role: "student", points: 120, history: ["Joined Bhoomify"] },
  { name: "Aneya", password: "123", role: "student", points: 180, history: ["Waste Segregation +50"] },
  { name: "Faculty1", password: "admin", role: "faculty" }
];

const rewardsList = [
  { id: 1, name: "Eco Badge", cost: 50, icon: "🏅" },
  { id: 2, name: "Tree Sapling", cost: 150, icon: "🌱" },
  { id: 3, name: "Cafeteria Coupon", cost: 100, icon: "☕" }
];

function saveUsers() { localStorage.setItem("users", JSON.stringify(users)); }

function initStudent() {
  const name = localStorage.getItem("user");
  const user = users.find(u => u.name === name);
  if (!user) { window.location.href = "login.html"; return; }

  document.getElementById("userName").innerText = user.name;
  document.getElementById("points").innerText = user.points;

  renderLeaderboard();
  renderRewards(user);
  renderHistory(user);
}

// --- NEW: GRAPH LEADERBOARD ---
function renderLeaderboard() {
  const students = users.filter(u => u.role === "student");
  const names = students.map(s => s.name);
  const points = students.map(s => s.points);

  const ctx = document.getElementById('leaderboardChart').getContext('2d');
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: names,
      datasets: [{
        label: 'Points Scored',
        data: points,
        backgroundColor: '#2ecc71',
        borderRadius: 5
      }]
    },
    options: { scales: { y: { beginAtZero: true } } }
  });
}

function renderRewards(user) {
  const container = document.getElementById("rewardsSection");
  container.innerHTML = "";
  rewardsList.forEach(reward => {
    const item = document.createElement("div");
    item.className = "reward-item";
    item.innerHTML = `
      <div>${reward.icon}</div>
      <strong>${reward.name}</strong>
      <p>${reward.cost} Pts</p>
      <button onclick="redeem('${reward.name}', ${reward.cost})">Claim</button>
    `;
    container.appendChild(item);
  });
}

function redeem(rewardName, cost) {
  const name = localStorage.getItem("user");
  const user = users.find(u => u.name === name);
  
  if (user.points >= cost) {
    user.points -= cost;
    user.history.unshift(`Redeemed ${rewardName} (-${cost})`);
    saveUsers();
    alert("Reward Claimed!");
    location.reload();
  } else {
    alert("Not enough points!");
  }
}

function renderHistory(user) {
  const list = document.getElementById("history");
  list.innerHTML = user.history.map(h => `<li>${h}</li>`).join("");
}

function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("role");
  window.location.href = "login.html";
}
