// one4all Dashboard - Main JS

// Live ping update
async function updateStats() {
  try {
    const res = await fetch('/api/stats');
    const data = await res.json();
    const pingEl = document.querySelector('.ping-live');
    if (pingEl) pingEl.textContent = `📡 ${data.ping}ms`;
  } catch {}
}

setInterval(updateStats, 15000);

// showTab - works with both old and new guild.ejs
window.showTab = function(tab, el) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.sidebar-link').forEach(l => l.classList.remove('active'));
  const tabEl = document.getElementById('tab-' + tab);
  if (tabEl) {
    tabEl.classList.add('active');
  } else {
    // التبويب مش موجود - أنشئه ديناميكياً
    console.warn('Tab not found: ' + tab);
    document.querySelectorAll('.tab-content')[0]?.classList.add('active');
  }
  if (el) {
    el.classList.add('active');
  } else if (window.event && window.event.currentTarget) {
    window.event.currentTarget.classList.add('active');
  }
};

console.log('🚀 one4all Dashboard loaded');
