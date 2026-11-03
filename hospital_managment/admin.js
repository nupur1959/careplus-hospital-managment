

const STORE_KEY = "careplus_hospital_data";
const API_BASE = (window.location.protocol === "file:") ? "http://localhost/hospital_managment/api/" : "api/";



const defaultData = {

  patients: [

    { id: 1, name: "Aarav Shah", email: "aarav@example.com", phone: "9876543210", age: 28, gender: "Male", blood: "B+", registered: "2026-10-21" },

    { id: 2, name: "Diya Patel", email: "diya@example.com", phone: "9876543211", age: 34, gender: "Female", blood: "O+", registered: "2026-10-22" },

    { id: 3, name: "Rohan Mehta", email: "rohan@example.com", phone: "9876543212", age: 46, gender: "Male", blood: "A+", registered: "2026-10-24" }

  ],

  doctors: [

    { id: 1, name: "Dr. Ananya Rao", specialty: "Cardiology", department: "Cardiology", email: "ananya@example.com", phone: "9876511001", experience: 12, availability: "Available" },

    { id: 2, name: "Dr. Kunal Shah", specialty: "Neurology", department: "Neurology", email: "kunal@example.com", phone: "9876511002", experience: 9, availability: "Available" },

    { id: 3, name: "Dr. Neha Patel", specialty: "Pediatrics", department: "Pediatrics", email: "neha@example.com", phone: "9876511003", experience: 7, availability: "On leave" }

  ],

  appointments: [

    { id: 1, patientId: 1, patient: "Aarav Shah", doctorId: 1, doctor: "Dr. Ananya Rao", department: "Cardiology", date: "2026-10-27", time: "10:00", reason: "Routine checkup", status: "Confirmed" },

    { id: 2, patientId: 2, patient: "Diya Patel", doctorId: 3, doctor: "Dr. Neha Patel", department: "Pediatrics", date: "2026-10-27", time: "11:30", reason: "Consultation", status: "Pending" }

  ],

  departments: [

    { id: 1, name: "Cardiology", description: "Heart health and cardiac care.", icon: "♥" },

    { id: 2, name: "Neurology", description: "Brain and nervous system care.", icon: "◉" },

    { id: 3, name: "Pediatrics", description: "Healthcare for infants and children.", icon: "♧" },

    { id: 4, name: "Orthopedics", description: "Bone and joint care.", icon: "✚" }

  ],

  bills: [

    { id: 1001, patient: "Aarav Shah", description: "Consultation fee", amount: 800, status: "Paid" },

    { id: 1002, patient: "Diya Patel", description: "Diagnostic tests", amount: 1500, status: "Due" }

  ],

  settings: {

    hospitalName: "CarePlus Hospital",

    hospitalEmail: "hello@careplus.example",

    hospitalPhone: "+91 00000 00000",

    hospitalAddress: "Your hospital address",

    notificationsEnabled: true

  }

};



function cloneDefault() {

  return JSON.parse(JSON.stringify(defaultData));

}



function loadData() {

  try {

    const saved = localStorage.getItem(STORE_KEY);

    return saved ? { ...cloneDefault(), ...JSON.parse(saved) } : cloneDefault();

  } catch {

    return cloneDefault();

  }

}



let data = loadData();

let activeModal = "";

let editId = null;



const $ = id => document.getElementById(id);



function saveData() {

  try {

    localStorage.setItem(STORE_KEY, JSON.stringify(data));

  } catch {

    alert("Browser storage unavailable. Changes might not be saved.");

  }

}



function escapeHtml(value) {

  return String(value ?? "").replace(/[&<>"']/g, char => ({

    "&": "&amp;",

    "<": "&lt;",

    ">": "&gt;",

    '"': "&quot;",

    "'": "&#39;"

  })[char]);

}



function nextId(list) {

  return list.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1;

}



function initials(name) {

  return String(name || "")

    .replace(/^Dr\.\s*/, "")

    .split(/\s+/)

    .filter(Boolean)

    .slice(0, 2)

    .map(word => word[0])

    .join("")

    .toUpperCase() || "CP";

}



function money(amount) {

  return "₹" + Number(amount || 0).toLocaleString("en-IN");

}



function formatDate(date) {

  if (!date) return "—";

  const d = new Date(date + "T00:00:00");

  return Number.isNaN(d.getTime())

    ? date

    : d.toLocaleDateString("en-IN", {

        day: "2-digit",

        month: "short",

        year: "numeric"

      });

}



function toast(message, type = "success") {

  const region = $("toastRegion");

  if (!region) return;



  const item = document.createElement("div");

  item.className = "toast " + type;

  item.textContent = message;

  region.appendChild(item);



  setTimeout(() => item.remove(), 3200);

}



function personCell(name, subtitle = "") {

  return `

    <div class="person-cell">

      <span class="avatar">${escapeHtml(initials(name))}</span>

      <span>

        <strong>${escapeHtml(name)}</strong>

        ${subtitle ? `<small>${escapeHtml(subtitle)}</small>` : ""}

      </span>

    </div>`;

}



function statusBadge(status) {

  return `<span class="status ${escapeHtml(String(status).toLowerCase())}">${escapeHtml(status)}</span>`;

}



/* NAVIGATION */



function setPage(page) {

  const validPages = [

    "dashboard", "appointments", "patients", "doctors",

    "departments", "billing", "reports", "settings"

  ];



  if (!validPages.includes(page)) page = "dashboard";



  document.querySelectorAll(".page-section").forEach(section => {

    section.classList.toggle("active", section.id === "page-" + page);

  });



  document.querySelectorAll(".nav-link").forEach(button => {

    button.classList.toggle("active", button.dataset.page === page);

  });



  const titles = {

    dashboard: "Dashboard overview",

    appointments: "Appointment management",

    patients: "Patient management",

    doctors: "Doctor management",

    departments: "Hospital departments",

    billing: "Billing & payments",

    reports: "Reports & analytics",

    settings: "Workspace settings"

  };



  $("pageTitle").textContent = titles[page];

  $("sidebar").classList.remove("open");

  renderAll();

}



/* DASHBOARD */



function renderDashboard() {

  $("statPatients").textContent = data.patients.length;

  $("statDoctors").textContent =

    data.doctors.filter(d => d.availability === "Available").length;

  $("statAppointments").textContent = data.appointments.length;



  const pending = data.appointments.filter(a => a.status === "Pending").length;

  $("statPending").textContent = pending;

  $("pendingBadge").textContent = pending ? "Needs attention" : "All caught up";

  $("statApptFoot").textContent =

    data.appointments.filter(a => a.status === "Confirmed").length + " confirmed";

  $("pendingNavCount").textContent = pending;



  const recent = [...data.appointments].sort((a, b) => b.id - a.id).slice(0, 5);



  $("recentAppointments").innerHTML = recent.map(a => `

    <tr>

      <td>${personCell(a.patient, a.reason)}</td>

      <td>${escapeHtml(a.doctor)}</td>

      <td>${formatDate(a.date)}</td>

      <td>${statusBadge(a.status)}</td>

      <td><button class="tiny-button" data-action="view-appointment" data-id="${a.id}">View</button></td>

    </tr>`).join("");



  $("recentEmpty").classList.toggle("hidden", recent.length > 0);



  const total = Math.max(data.appointments.length, 1);

  $("departmentOverview").innerHTML = data.departments.slice(0, 4).map(dept => {

    const count = data.appointments.filter(a => a.department === dept.name).length;

    const width = Math.max(8, Math.round(count / total * 100));



    return `

      <div class="department-mini">

        <div class="dept-icon">${escapeHtml(dept.icon || "✚")}</div>

        <strong>${escapeHtml(dept.name)}</strong>

        <small>${count} appointment(s)</small>

        <div class="progress"><span style="width:${width}%"></span></div>

      </div>`;

  }).join("") || '<span class="no-data">No departments added.</span>';

}



/* PATIENTS */



function renderPatients() {

  const query = ($("patientSearch").value || "").toLowerCase();



  const patients = data.patients.filter(p =>

    [p.name, p.email, p.phone, p.blood].join(" ").toLowerCase().includes(query)

  );



  $("patientsTable").innerHTML = patients.map(p => `

    <tr>

      <td>${personCell(p.name, "Patient ID #" + p.id)}</td>

      <td>${escapeHtml(p.email)}<small style="display:block;margin-top:4px">${escapeHtml(p.phone)}</small></td>

      <td>${escapeHtml(p.age)} / ${escapeHtml(p.gender)}</td>

      <td>${escapeHtml(p.blood || "—")}</td>

      <td>${formatDate(p.registered)}</td>

      <td>

        <div class="row-actions">

          <button class="tiny-button" data-action="edit-patient" data-id="${p.id}">Edit</button>

          <button class="tiny-button" data-action="delete-patient" data-id="${p.id}">Delete</button>

        </div>

      </td>

    </tr>`).join("");



  $("patientsEmpty").classList.toggle("hidden", patients.length > 0);

}



/* DOCTORS */



function renderDoctors() {

  const query = ($("doctorSearch").value || "").toLowerCase();

  const filter = $("doctorDepartmentFilter");

  const selected = filter.value;



  filter.innerHTML = '<option value="all">All departments</option>' +

    data.departments.map(d =>

      `<option value="${escapeHtml(d.name)}">${escapeHtml(d.name)}</option>`

    ).join("");



  filter.value = [...filter.options].some(o => o.value === selected) ? selected : "all";



  const doctors = data.doctors.filter(d =>

    (filter.value === "all" || d.department === filter.value) &&

    [d.name, d.specialty, d.department, d.email].join(" ").toLowerCase().includes(query)

  );



  $("doctorGrid").innerHTML = doctors.map(d => `

    <article class="doctor-card">

      <div class="doctor-card-top">

        <div class="doctor-avatar">${escapeHtml(initials(d.name))}</div>

        <div>

          <h3>${escapeHtml(d.name)}</h3>

          <p>${escapeHtml(d.specialty)}</p>

        </div>

      </div>

      <div class="doctor-meta">

        <span>${escapeHtml(d.department)}</span>

        <span>${escapeHtml(d.availability)}</span>

      </div>

      <div class="doctor-meta">

        <span>${escapeHtml(d.experience)} years' experience</span>

        <span>${escapeHtml(d.phone)}</span>

      </div>

      <div class="doctor-card-actions">

        <button class="outline-button" data-action="edit-doctor" data-id="${d.id}">Edit</button>

        <button class="danger-button" data-action="delete-doctor" data-id="${d.id}">Delete</button>

      </div>

    </article>`).join("");



  $("doctorsEmpty").classList.toggle("hidden", doctors.length > 0);

}



/* APPOINTMENTS */



function renderAppointments() {

  const query = ($("appointmentSearch").value || "").toLowerCase();

  const selectedStatus = $("appointmentStatus").value;



  const appointments = data.appointments.filter(a =>

    (selectedStatus === "all" || a.status === selectedStatus) &&

    [a.patient, a.doctor, a.department, a.reason].join(" ").toLowerCase().includes(query)

  );



  $("appointmentsTable").innerHTML = appointments.map(a => `

    <tr>

      <td>${personCell(a.patient, a.reason)}</td>

      <td>${escapeHtml(a.doctor)}</td>

      <td>${escapeHtml(a.department)}</td>

      <td>${formatDate(a.date)}<small style="display:block;margin-top:4px">${escapeHtml(a.time)}</small></td>

      <td>${statusBadge(a.status)}</td>

      <td>

        <div class="row-actions">

          ${a.status === "Pending" ? `<button class="tiny-button" data-action="confirm-appointment" data-id="${a.id}">Confirm</button>` : ""}

          ${a.status === "Confirmed" ? `<button class="tiny-button" data-action="complete-appointment" data-id="${a.id}">Complete</button>` : ""}

          <button class="tiny-button" data-action="edit-appointment" data-id="${a.id}">Edit</button>

          <button class="tiny-button" data-action="delete-appointment" data-id="${a.id}">Delete</button>

        </div>

      </td>

    </tr>`).join("");



  $("appointmentsEmpty").classList.toggle("hidden", appointments.length > 0);

}



/* DEPARTMENTS */



function renderDepartments() {

  $("departmentCards").innerHTML = data.departments.map(d => {

    const count = data.appointments.filter(a => a.department === d.name).length;



    return `

      <article class="department-card">

        <div class="dept-icon">${escapeHtml(d.icon || "✚")}</div>

        <h3>${escapeHtml(d.name)}</h3>

        <p>${escapeHtml(d.description)}</p>

        <div class="department-card-foot">

          <span>${count} appointment(s)</span>

          <div class="row-actions">

            <button class="tiny-button" data-action="edit-department" data-id="${d.id}">Edit</button>

            <button class="tiny-button" data-action="delete-department" data-id="${d.id}">Delete</button>

          </div>

        </div>

      </article>`;

  }).join("");

}



/* BILLING */



function renderBilling() {

  const billed = data.bills.reduce((sum, b) => sum + Number(b.amount || 0), 0);

  const paid = data.bills.filter(b => b.status === "Paid")

    .reduce((sum, b) => sum + Number(b.amount || 0), 0);



  $("totalBilled").textContent = money(billed);

  $("totalPaid").textContent = money(paid);

  $("totalDue").textContent = money(billed - paid);



  $("billingTable").innerHTML = data.bills.map(b => `

    <tr>

      <td>INV-${b.id}</td>

      <td>${escapeHtml(b.patient)}</td>

      <td>${escapeHtml(b.description)}</td>

      <td>${money(b.amount)}</td>

      <td>${statusBadge(b.status)}</td>

      <td>

        <div class="row-actions">

          ${b.status !== "Paid" ? `<button class="tiny-button" data-action="mark-paid" data-id="${b.id}">Mark paid</button>` : ""}

          <button class="tiny-button" data-action="delete-bill" data-id="${b.id}">Delete</button>

        </div>

      </td>

    </tr>`).join("");



  $("billingEmpty").classList.toggle("hidden", data.bills.length > 0);

}



/* REPORTS AND SETTINGS */



function renderReports() {

  $("reportPatients").textContent = data.patients.length;

  $("reportCompleted").textContent =

    data.appointments.filter(a => a.status === "Completed").length;

  $("reportCancelled").textContent =

    data.appointments.filter(a => a.status === "Cancelled").length;

  $("reportDoctors").textContent =

    data.doctors.filter(d => d.availability === "Available").length;



  const statuses = ["Pending", "Confirmed", "Completed", "Cancelled"];

  const max = Math.max(1, data.appointments.length);



  $("reportBars").innerHTML = statuses.map(status => {

    const count = data.appointments.filter(a => a.status === status).length;

    const width = Math.round(count / max * 100);



    return `

      <div class="report-bar-row">

        <span>${status}</span>

        <div class="report-bar-track">

          <div class="report-bar-fill" style="width:${width}%"></div>

        </div>

        <strong>${count}</strong>

      </div>`;

  }).join("");

}



function renderSettings() {

  $("hospitalName").value = data.settings.hospitalName || "";

  $("hospitalEmail").value = data.settings.hospitalEmail || "";

  $("hospitalPhone").value = data.settings.hospitalPhone || "";

  $("hospitalAddress").value = data.settings.hospitalAddress || "";

  $("notificationsEnabled").checked = data.settings.notificationsEnabled !== false;

}



function renderAll() {

  renderDashboard();

  renderAppointments();

  renderPatients();

  renderDoctors();

  renderDepartments();

  renderBilling();

  renderReports();

  renderSettings();

}



/* ADD / EDIT FORMS */



function field(label, name, type = "text", value = "", options = [], full = false) {

  const safeValue = escapeHtml(value);

  let control = "";



  if (type === "select") {

    control = `

      <select name="${name}" required>

        ${options.map(option => `

          <option value="${escapeHtml(option)}" ${String(option) === String(value) ? "selected" : ""}>

            ${escapeHtml(option)}

          </option>`).join("")}

      </select>`;

  } else if (type === "textarea") {

    control = `<textarea name="${name}" rows="3" required>${safeValue}</textarea>`;

  } else {

    control = `<input name="${name}" type="${type}" value="${safeValue}" ${type === "number" ? 'min="0"' : ""} required>`;

  }



  return `<label class="field ${full ? "full" : ""}">${label}${control}</label>`;

}



function fieldsFor(type, record = {}) {

  const patientNames = data.patients.map(p => p.name);

  const doctorNames = data.doctors.map(d => d.name);

  const departmentNames = data.departments.map(d => d.name);



  if (type === "patient") {

    return field("Full name", "name", "text", record.name) +

      field("Email", "email", "email", record.email) +

      field("Phone", "phone", "tel", record.phone) +

      field("Age", "age", "number", record.age || "") +

      field("Gender", "gender", "select", record.gender || "Female", ["Female", "Male", "Other"]) +

      field("Blood group", "blood", "select", record.blood || "O+", ["A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-"]);

  }



  if (type === "doctor") {

    return field("Doctor name", "name", "text", record.name) +

      field("Specialty", "specialty", "text", record.specialty) +

      field("Department", "department", "select", record.department || departmentNames[0] || "General Medicine", departmentNames.length ? departmentNames : ["General Medicine"]) +

      field("Email", "email", "email", record.email) +

      field("Phone", "phone", "tel", record.phone) +

      field("Experience (years)", "experience", "number", record.experience || 0) +

      field("Availability", "availability", "select", record.availability || "Available", ["Available", "On leave"]);

  }



  if (type === "appointment") {

    return field("Patient", "patient", "select", record.patient || patientNames[0] || "", patientNames.length ? patientNames : ["Add a patient first"], true) +

      field("Doctor", "doctor", "select", record.doctor || doctorNames[0] || "", doctorNames.length ? doctorNames : ["Add a doctor first"], true) +

      field("Date", "date", "date", record.date || new Date().toISOString().slice(0, 10)) +

      field("Time", "time", "time", record.time || "10:00") +

      field("Status", "status", "select", record.status || "Pending", ["Pending", "Confirmed", "Completed", "Cancelled"]) +

      field("Reason for visit", "reason", "text", record.reason || "", [], true);

  }



  if (type === "department") {

    return field("Department name", "name", "text", record.name) +

      field("Icon / symbol", "icon", "text", record.icon || "✚") +

      field("Description", "description", "textarea", record.description || "", [], true);

  }



  if (type === "bill") {

    return field("Patient name", "patient", "select", record.patient || patientNames[0] || "Walk-in patient", patientNames.length ? patientNames : ["Walk-in patient"], true) +

      field("Description", "description", "text", record.description || "Consultation fee", [], true) +

      field("Amount (₹)", "amount", "number", record.amount || 0) +

      field("Payment status", "status", "select", record.status || "Due", ["Due", "Paid"]);

  }



  return "";

}



function openModal(type, id = null) {

  activeModal = type;

  editId = id === null ? null : Number(id);



  const collections = {

    patient: "patients",

    doctor: "doctors",

    appointment: "appointments",

    department: "departments",

    bill: "bills"

  };



  const collection = collections[type];

  const record = editId && collection

    ? data[collection].find(item => item.id === editId)

    : {};



  const titles = {

    patient: record && editId ? "Edit patient" : "Add patient",

    doctor: record && editId ? "Edit doctor" : "Add doctor",

    appointment: record && editId ? "Edit appointment" : "New appointment",

    department: record && editId ? "Edit department" : "Add department",

    bill: "Create invoice"

  };



  $("modalTitle").textContent = titles[type] || "Add record";

  $("submitModal").textContent = editId ? "Save changes" : "Save record";

  $("modalFields").innerHTML = fieldsFor(type, record || {});

  $("modalBackdrop").classList.remove("hidden");

}



function closeModal() {

  $("modalBackdrop").classList.add("hidden");

  $("modalForm").reset();

  activeModal = "";

  editId = null;

}



function saveModal(event) {

  event.preventDefault();



  const values = Object.fromEntries(new FormData($("modalForm")).entries());

  const collectionNames = {

    patient: "patients",

    doctor: "doctors",

    appointment: "appointments",

    department: "departments",

    bill: "bills"

  };



  const collectionName = collectionNames[activeModal];

  if (!collectionName) return;



  if (activeModal === "appointment") {

    const patient = data.patients.find(p => p.name === values.patient);

    const doctor = data.doctors.find(d => d.name === values.doctor);



    if (!patient || !doctor) {

      toast("Please add a patient and doctor first.", "error");

      return;

    }



    values.patientId = patient.id;

    values.doctorId = doctor.id;

    values.department = doctor.department;

  }



  if (activeModal === "patient") {

    values.age = Number(values.age);

    if (!editId) values.registered = new Date().toISOString().slice(0, 10);

  }



  if (activeModal === "doctor") {

    values.experience = Number(values.experience);

  }



  if (activeModal === "bill") {

    values.amount = Number(values.amount);

  }



  const list = data[collectionName];



  if (editId !== null) {

    const index = list.findIndex(item => item.id === editId);

    if (index !== -1) {

      const oldRecord = list[index];

      list[index] = { ...oldRecord, ...values };



      if (activeModal === "patient" && oldRecord.name !== values.name) {

        data.appointments.forEach(a => {

          if (a.patient === oldRecord.name) a.patient = values.name;

        });

        data.bills.forEach(b => {

          if (b.patient === oldRecord.name) b.patient = values.name;

        });

      }



      if (activeModal === "doctor" && oldRecord.name !== values.name) {

        data.appointments.forEach(a => {

          if (a.doctor === oldRecord.name) a.doctor = values.name;

        });

      }

    }

  } else {

    values.id = activeModal === "bill" ? nextId(list) + 1000 : nextId(list);

    list.push(values);

  }



  saveData();

  closeModal();

  renderAll();

  toast(editId !== null ? "Record updated successfully." : "Record added successfully.");

}



/* DELETE, STATUS AND OTHER ROW ACTIONS */



function handleAction(action, id) {

  const removeRecord = (collection, message) => {

    if (!confirm(message)) return;

    data[collection] = data[collection].filter(item => item.id !== id);

  };



  if (action.startsWith("edit-")) {

    openModal(action.replace("edit-", ""), id);

    return;

  }



  if (action === "confirm-appointment") {

    const a = data.appointments.find(item => item.id === id);

    if (a) a.status = "Confirmed";

  } else if (action === "complete-appointment") {

    const a = data.appointments.find(item => item.id === id);

    if (a) a.status = "Completed";

  } else if (action === "delete-appointment") {

    removeRecord("appointments", "Delete this appointment?");

  } else if (action === "delete-patient") {

    const patient = data.patients.find(p => p.id === id);

    if (!confirm("Delete this patient and their appointments?")) return;

    data.patients = data.patients.filter(p => p.id !== id);

    if (patient) {

      data.appointments = data.appointments.filter(a => a.patient !== patient.name);

      data.bills = data.bills.filter(b => b.patient !== patient.name);

    }

  } else if (action === "delete-doctor") {

    removeRecord("doctors", "Delete this doctor?");

  } else if (action === "delete-department") {

    removeRecord("departments", "Delete this department?");

  } else if (action === "mark-paid") {

    const bill = data.bills.find(b => b.id === id);

    if (bill) bill.status = "Paid";

  } else if (action === "delete-bill") {

    removeRecord("bills", "Delete this invoice?");

  } else if (action === "view-appointment") {

    setPage("appointments");

    const a = data.appointments.find(item => item.id === id);

    if (a) {

      $("appointmentSearch").value = a.patient;

      renderAppointments();

    }

    return;

  } else {

    return;

  }



  saveData();

  renderAll();

  toast("Changes saved.");

}



/* CSV EXPORT */



function downloadCSV(filename, rows) {

  if (!rows.length) {

    toast("No records to export.", "error");

    return;

  }



  const keys = [...new Set(rows.flatMap(row => Object.keys(row)))];

  const csv = [

    keys.join(","),

    ...rows.map(row =>

      keys.map(key =>

        `"${String(row[key] ?? "").replace(/"/g, '""')}"`

      ).join(",")

    )

  ].join("\r\n");



  const blob = new Blob(["\ufeff" + csv], {

    type: "text/csv;charset=utf-8;"

  });



  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");

  link.href = url;

  link.download = filename;

  link.click();

  URL.revokeObjectURL(url);

  toast("CSV download started.");

}



/* EVENT LISTENERS */



document.addEventListener("click", event => {

  const pageButton = event.target.closest("[data-page]");

  if (pageButton) {

    event.preventDefault();

    setPage(pageButton.dataset.page);

    return;

  }



  const modalButton = event.target.closest("[data-modal]");

  if (modalButton) {

    openModal(modalButton.dataset.modal);

    return;

  }



  const actionButton = event.target.closest("[data-action]");

  if (actionButton) {

    handleAction(actionButton.dataset.action, Number(actionButton.dataset.id));

  }

});



$("sideNav").addEventListener("click", event => {

  const button = event.target.closest("[data-page]");

  if (button) setPage(button.dataset.page);

});



$("modalForm").addEventListener("submit", saveModal);

$("closeModal").addEventListener("click", closeModal);

$("cancelModal").addEventListener("click", closeModal);



$("modalBackdrop").addEventListener("click", event => {

  if (event.target === $("modalBackdrop")) closeModal();

});



document.addEventListener("keydown", event => {

  if (event.key === "Escape") closeModal();



  if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {

    event.preventDefault();

    $("globalSearch").focus();

  }

});



$("appointmentSearch").addEventListener("input", renderAppointments);

$("appointmentStatus").addEventListener("change", renderAppointments);

$("patientSearch").addEventListener("input", renderPatients);

$("doctorSearch").addEventListener("input", renderDoctors);

$("doctorDepartmentFilter").addEventListener("change", renderDoctors);



$("globalSearch").addEventListener("input", event => {

  const query = event.target.value.trim().toLowerCase();

  if (!query) return;



  const matchPatient = data.patients.some(p =>

    [p.name, p.email, p.phone].join(" ").toLowerCase().includes(query)

  );



  const matchDoctor = data.doctors.some(d =>

    [d.name, d.specialty].join(" ").toLowerCase().includes(query)

  );



  const matchAppointment = data.appointments.some(a =>

    [a.patient, a.doctor, a.department].join(" ").toLowerCase().includes(query)

  );



  if (matchPatient) {

    setPage("patients");

    $("patientSearch").value = query;

    renderPatients();

  } else if (matchDoctor) {

    setPage("doctors");

    $("doctorSearch").value = query;

    renderDoctors();

  } else if (matchAppointment) {

    setPage("appointments");

    $("appointmentSearch").value = query;

    renderAppointments();

  }

});



$("menuBtn").addEventListener("click", () => {

  $("sidebar").classList.toggle("open");

});



$("notificationBtn").addEventListener("click", () => {

  const pending = data.appointments.filter(a => a.status === "Pending").length;

  toast(pending

    ? `You have ${pending} pending appointment request(s).`

    : "No pending appointments.");

});



$("helpBtn").addEventListener("click", () => {

  toast("Use the sidebar to manage patients, doctors, appointments and reports.");

});



$("profileBtn").addEventListener("click", () => {

  if (confirm("Return to the welcome page?")) {

    window.location.href = "index.html";

  }

});



$("exportPatients").addEventListener("click", () =>

  downloadCSV("careplus-patients.csv", data.patients)

);



$("exportDoctors").addEventListener("click", () =>

  downloadCSV("careplus-doctors.csv", data.doctors)

);



$("exportAppointments").addEventListener("click", () =>

  downloadCSV("careplus-appointments.csv", data.appointments)

);



$("exportSummaryBtn").addEventListener("click", () =>

  downloadCSV("careplus-summary.csv", [

    { metric: "Patients", value: data.patients.length },

    { metric: "Doctors", value: data.doctors.length },

    { metric: "Appointments", value: data.appointments.length },

    { metric: "Pending appointments", value: data.appointments.filter(a => a.status === "Pending").length }

  ])

);



$("exportReport").addEventListener("click", () =>

  downloadCSV("careplus-report.csv", [

    { metric: "Patients registered", value: data.patients.length },

    { metric: "Active doctors", value: data.doctors.filter(d => d.availability === "Available").length },

    { metric: "Completed appointments", value: data.appointments.filter(a => a.status === "Completed").length },

    { metric: "Cancelled appointments", value: data.appointments.filter(a => a.status === "Cancelled").length }

  ])

);



$("exportAll").addEventListener("click", () => {

  downloadCSV("careplus-patients.csv", data.patients);

  setTimeout(() => downloadCSV("careplus-doctors.csv", data.doctors), 300);

  setTimeout(() => downloadCSV("careplus-appointments.csv", data.appointments), 600);

});



$("settingsForm").addEventListener("submit", event => {

  event.preventDefault();



  data.settings = {

    hospitalName: $("hospitalName").value.trim(),

    hospitalEmail: $("hospitalEmail").value.trim(),

    hospitalPhone: $("hospitalPhone").value.trim(),

    hospitalAddress: $("hospitalAddress").value.trim(),

    notificationsEnabled: $("notificationsEnabled").checked

  };



  saveData();

  toast("Settings saved.");

});



$("saveSettings").addEventListener("click", () => {

  $("settingsForm").requestSubmit();

});



$("resetData").addEventListener("click", () => {

  if (!confirm("Reset all demo data? This cannot be undone.")) return;



  data = cloneDefault();

  saveData();

  renderAll();

  toast("Demo data restored.");

});



/* INITIAL LOAD */



renderAll();



async function testCarePlusConnection() {

  try {

    const results = await Promise.all([

      CarePlusDB.getPatients(),

      CarePlusDB.getDoctors(),

      CarePlusDB.getAppointments(),

      CarePlusDB.getBills()

    ]);



    console.log("Patients:", results[0]);

    console.log("Doctors:", results[1]);

    console.log("Appointments:", results[2]);

    console.log("Bills:", results[3]);



    alert("Database API test successful! Chaaron endpoints ka response mil gaya.");

  } catch (error) {

    alert("Database API error: " + error.message);

  }

}



window.testCarePlusConnection = testCarePlusConnection;







async function syncAdminAppointmentsFromDB() {

  try {

    const res = await fetch(API_BASE + "get_appointments.php");

    const json = await res.json();

    if (json.success && Array.isArray(json.data) && json.data.length > 0) {

      data.appointments = json.data.map(item => ({

        id: item.id,

        patient: item.patient_name || ("Patient #" + item.user_id),

        patientPhone: item.patient_phone || "",

        doctor: item.doctor_name,

        department: item.department,

        date: item.appointment_date,

        time: item.appointment_time ? item.appointment_time.slice(0, 5) : "",

        reason: item.reason || "",

        status: item.status || "Pending"

      }));

      renderAppointments();

      renderRecentAppointments();

      renderOverview();

    }

  } catch (e) {

    console.warn("Could not sync appointments with MySQL in admin:", e);

  }

}



syncAdminAppointmentsFromDB();

