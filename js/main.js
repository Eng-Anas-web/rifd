// إعدادات Firebase
const firebaseConfig = {
  databaseURL: "https://frid-49635-default-rtdb.firebaseio.com/",
};


firebase.initializeApp(firebaseConfig);
const db = firebase.database();
const logsContainer = document.getElementById("logsContainer");
const dynamicCounters = document.getElementById("dynamicCounters");

// 1. مراقبة البيانات بالكامل (لتحديث العدادات ومسح المحذوف فوراً)
db.ref().on("value", (snapshot) => {
  const data = snapshot.val();

  // مسح الحاوية تماماً قبل إعادة الرسم لضمان عدم بقاء عناصر محذوفة
  dynamicCounters.innerHTML = "";

  if (!data) {
    document.getElementById("totalCounter").innerText = 0;
    return;
  }

  // تحديث العداد الكلي
  document.getElementById("totalCounter").innerText = data.total_inside || 0;

  // بناء العدادات بناءً على ما هو موجود "حالياً" في Firebase
  let countersHTML = "";
  Object.keys(data).forEach((key) => {
    if (key.endsWith("_total")) {
      const typeName = key.replace("_total", "");
      const count = data[key];

      countersHTML += `
                        <div class="type-box">
                            <div class="type-name">${typeName}</div>
                            <div class="type-count">${count}</div>
                        </div>
                    `;
    }
  });
  dynamicCounters.innerHTML = countersHTML;
});



// 2. مراقبة حركة التاجات (الدخول والخروج) للسجل
db.ref("tags").on("child_changed", (snapshot) => {
  const tagData = snapshot.val();
  const tagId = snapshot.key;
  const timeNow = new Date().toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const isEntering = tagData.status === 1;
  const actionText = isEntering ? "Entered" : "Exited";
  const badgeClass = isEntering ? "entered" : "exited";

  const logHTML = `
                <div class="log-item">
                    <span class="status-badge ${badgeClass}">${actionText}</span>
                    <div class="user-info">
                        <strong>${tagData.name}</strong> 
                        <span class="tag-id">Tag ID: ${tagId}</span>
                    </div>
                    <span class="time">${timeNow}</span>
                </div>
            `;

  const waitingMessage = document.getElementById("waitingMessage");
  if (waitingMessage) waitingMessage.remove();

  // إضافة السطر الجديد في أعلى القائمة
  logsContainer.insertAdjacentHTML("afterbegin", logHTML);

  // حفظ نسخة في كاش المتصفح
  localStorage.setItem("myTrackerLogs", logsContainer.innerHTML);
});

// استعادة سجل النشاط عند فتح الصفحة
window.onload = () => {
  const savedLogs = localStorage.getItem("myTrackerLogs");
  if (savedLogs && savedLogs.trim() !== "") {
    logsContainer.innerHTML = savedLogs;
  }
};

// دالة مسح السجل
function clearLogs() {
  if (confirm("Are you sure you want to clear the history?")) {
    localStorage.removeItem("myTrackerLogs");
    logsContainer.innerHTML =
      '<p id="waitingMessage" style="text-align: center; color: #95a5a6; margin-top: 30px;">History cleared. Waiting for new scans...</p>';
  }
}
