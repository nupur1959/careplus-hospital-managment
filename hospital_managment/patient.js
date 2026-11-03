

document.addEventListener("DOMContentLoaded", () => {

  "use strict";



  const $ = id => document.getElementById(id);

  const STORAGE_KEY = "careplus_patient_portal_v1";
  const API_BASE = (window.location.protocol === "file:") ? "http://localhost/hospital_managment/api/" : "api/";



  const doctors = [

    {id:"D101",name:"Dr. Aarav Shah",department:"Cardiology",experience:"12 years",fee:800},

    {id:"D102",name:"Dr. Meera Patel",department:"Neurology",experience:"10 years",fee:900},

    {id:"D103",name:"Dr. Rohan Desai",department:"Orthopedics",experience:"9 years",fee:700},

    {id:"D104",name:"Dr. Nisha Mehta",department:"Dermatology",experience:"8 years",fee:600},

    {id:"D105",name:"Dr. Priya Joshi",department:"Pediatrics",experience:"11 years",fee:700},

    {id:"D106",name:"Dr. Karan Shah",department:"General Medicine",experience:"7 years",fee:500},

    {id:"D107",name:"Dr. Anaya Trivedi",department:"Dental",experience:"6 years",fee:500}

  ];



  const today = new Date();

  const dateOffset = days => {

    const d = new Date();

    d.setDate(d.getDate() + days);

    return localDate(d);

  };

  function localDate(d) {

    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`;

  }

  const money = amount => "₹" + Number(amount || 0).toLocaleString("en-IN");

  const esc = value => String(value ?? "").replace(/[&<>"']/g, ch => ({

    "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"

  })[ch]);

  const prettyDate = value => {

    if (!value) return "—";

    const d = new Date(value + "T00:00:00");

    return Number.isNaN(d.getTime()) ? esc(value) :

      d.toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"});

  };

  const makeId = prefix => prefix + "-" + Date.now().toString().slice(-7) +

    Math.floor(Math.random()*90+10);



  function initialData() {

    return {

      profile:{

        name:"Patient",email:"patient@example.com",phone:"",

        dob:"",gender:"",blood:"",address:""

      },

      appointments:[],

      records:[

        {id:"MR-1001",title:"General Health Checkup",category:"Checkup",

          date:dateOffset(-10),notes:"Sample demo record"}

      ],

      prescriptions:[

        {id:"RX-1001",doctor:"Dr. Karan Shah",medication:"Sample prescription",

          instructions:"Demo only — consult your doctor",date:dateOffset(-10)}

      ],

      bills:[

        {id:"INV-1001",description:"Consultation (demo)",date:dateOffset(-10),

          amount:500,status:"Pending"}

      ],

      settings:{dark:false,reminders:true}

    };

  }



  function loadData() {

    try {

      const saved = localStorage.getItem(STORAGE_KEY);

      if (!saved) return initialData();

      const parsed = JSON.parse(saved);

      const defaults = initialData();

      return {

        profile:{...defaults.profile,...(parsed.profile || {})},

        appointments:Array.isArray(parsed.appointments)?parsed.appointments:[],

        records:Array.isArray(parsed.records)?parsed.records:defaults.records,

        prescriptions:Array.isArray(parsed.prescriptions)?parsed.prescriptions:defaults.prescriptions,

        bills:Array.isArray(parsed.bills)?parsed.bills:defaults.bills,

        settings:{...defaults.settings,...(parsed.settings || {})}

      };

    } catch (error) {

      console.warn("Could not load saved demo data.", error);

      return initialData();

    }

  }



  let data = loadData();

  let toastTimer;



  function save() {

    try {

      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));

      return true;

    } catch (error) {

      notify("Could not save data. Check browser storage settings.");

      return false;

    }

  }



  function notify(message) {

    const toast = $("toast");

    toast.textContent = message;

    toast.classList.add("show");

    clearTimeout(toastTimer);

    toastTimer = setTimeout(() => toast.classList.remove("show"), 3000);

  }



  function emptyRow(columns, message) {

    return `<tr><td colspan="${columns}" class="empty">${esc(message)}</td></tr>`;

  }



  function statusBadge(status) {

    const key = String(status).toLowerCase();

    return `<span class="status status-${esc(key)}">${esc(status)}</span>`;

  }



  function showPage(page) {

    const target = $("page-" + page);

    if (!target) return;

    document.querySelectorAll(".page").forEach(el => el.classList.remove("active"));

    document.querySelectorAll(".nav-link").forEach(el => {

      el.classList.toggle("active", el.dataset.page === page);

    });

    target.classList.add("active");

    const activeLink = document.querySelector(`.nav-link[data-page="${page}"]`);

    $("pageTitle").textContent = activeLink ? activeLink.querySelector("span").textContent : "Dashboard";

    $("pageLabel").textContent = "PATIENT PORTAL";

    $("sidebar").classList.remove("open");

    window.scrollTo({top:0,behavior:"smooth"});

    render();

  }



  document.querySelectorAll(".nav-link").forEach(button => {

    button.addEventListener("click", () => showPage(button.dataset.page));

  });



  document.querySelectorAll("[data-go]").forEach(button => {

    button.addEventListener("click", () => showPage(button.dataset.go));

  });



  $("menuToggle").addEventListener("click", () => $("sidebar").classList.toggle("open"));



  document.addEventListener("click", event => {

    if (window.innerWidth <= 760 &&

        !$("sidebar").contains(event.target) &&

        !$("menuToggle").contains(event.target)) {

      $("sidebar").classList.remove("open");

    }

  });



  $("logoutBtn").addEventListener("click", () => {

    if (confirm("Return to the welcome page? Your saved demo records will remain in this browser.")) {

      window.location.href = "index.html";

    }

  });



  function renderProfile() {

    const p = data.profile;

    const name = p.name || "Patient";

    $("sideName").textContent = name;

    $("welcomeName").textContent = name.split(" ")[0];

    $("sideAvatar").textContent = name.charAt(0).toUpperCase();

    $("topAvatar").textContent = name.charAt(0).toUpperCase();



    $("profileName").value = p.name || "";

    $("profileEmail").value = p.email || "";

    $("profilePhone").value = p.phone || "";

    $("profileDob").value = p.dob || "";

    $("profileGender").value = p.gender || "";

    $("profileBlood").value = p.blood || "";

    $("profileAddress").value = p.address || "";

    $("bookingName").value = p.name === "Patient" ? "" : p.name;

    $("bookingPhone").value = p.phone || "";

  }



  function renderDashboard() {

    const upcoming = data.appointments.filter(a =>

      a.status === "Scheduled" && a.date >= dateOffset(0));

    const pending = data.bills.filter(b => b.status === "Pending")

      .reduce((sum,b) => sum + Number(b.amount || 0),0);



    $("statUpcoming").textContent = upcoming.length;

    $("statRecords").textContent = data.records.length;

    $("statBills").textContent = money(pending);

    $("statPrescriptions").textContent = data.prescriptions.length;



    const list = [...upcoming].sort((a,b) =>

      (a.date+a.time).localeCompare(b.date+b.time)).slice(0,5);



    $("dashboardAppointments").innerHTML = list.length ? list.map(a => `

      <tr><td><strong>${esc(a.doctor)}</strong></td>

      <td>${esc(a.department)}</td><td>${prettyDate(a.date)} · ${esc(a.time)}</td>

      <td>${statusBadge(a.status)}</td></tr>`).join("") :

      emptyRow(4,"No upcoming appointments. Book your first visit!");

  }



  function populateDoctorSelect() {

    const department = $("bookingDepartment").value;

    const current = $("bookingDoctor").value;

    const options = doctors.filter(d => !department || d.department === department);

    $("bookingDoctor").innerHTML = '<option value="">Select doctor</option>' +

      options.map(d => `<option value="${esc(d.id)}">${esc(d.name)} — ${esc(d.department)}</option>`).join("");

    if (options.some(d => d.id === current)) $("bookingDoctor").value = current;

  }



  $("bookingDepartment").addEventListener("change", populateDoctorSelect);



  $("bookingDate").min = dateOffset(0);



  $("appointmentForm").addEventListener("submit", async event => {

    event.preventDefault();

    const doctor = doctors.find(d => d.id === $("bookingDoctor").value);

    const date = $("bookingDate").value;

    if (!doctor) return notify("Please select a doctor.");

    if (!date || date < dateOffset(0)) return notify("Please choose today or a future date.");



    const time = $("bookingTime").value;

    const name = $("bookingName").value.trim();

    const phone = $("bookingPhone").value.trim();

    const reason = $("bookingReason").value.trim();

    const email = data.profile?.email || "";



    const submitBtn = $("appointmentForm").querySelector('button[type="submit"]');

    if (submitBtn) submitBtn.disabled = true;



    try {

      const response = await fetch(API_BASE + "save_appointment.php", {

        method: "POST",

        headers: { "Content-Type": "application/json" },

        body: JSON.stringify({

          patient_name: name,

          phone: phone,

          email: email,

          doctor_name: doctor.name,

          department: doctor.department,

          appointment_date: date,

          appointment_time: time,

          reason: reason

        })

      });



      const resData = await response.json();

      if (!response.ok || !resData.success) {

        throw new Error(resData.error || "Database error");

      }



      const appointment = {

        id: "APT-" + resData.appointment_id,

        dbId: resData.appointment_id,

        name: name,

        phone: phone,

        department: doctor.department,

        doctor: doctor.name,

        doctorId: doctor.id,

        date: date,

        time: time,

        reason: reason,

        status: "Pending"

      };



      data.appointments.unshift(appointment);

      data.bills.push({

        id: makeId("INV"),

        description: "Consultation — " + doctor.name,

        date: date,

        amount: doctor.fee,

        status: "Pending",

        appointmentId: appointment.id

      });

      save();

      $("appointmentForm").reset();

      $("bookingDate").min = dateOffset(0);

      populateDoctorSelect();

      renderProfile();

      render();

      notify("Appointment database me successfully save ho gaya! (ID: #" + resData.appointment_id + ")");

      showPage("appointments");

    } catch (err) {

      console.error(err);

      let msg = err.message || "";
      if (msg.includes("Failed to fetch") || msg.includes("NetworkError")) {
        msg = "XAMPP Apache ya MySQL band hai, ya page file:// protocol se open hai. Kripya XAMPP me Apache & MySQL START karein aur URL 'http://localhost/hospital_managment/user.html' kholein.";
      }
      notify("Database me save nahi hua: " + msg);

    } finally {

      if (submitBtn) submitBtn.disabled = false;

    }

  });



  function renderAppointments() {

    const search = $("appointmentSearch").value.toLowerCase().trim();

    const filter = $("appointmentFilter").value;

    const list = data.appointments.filter(a =>

      (filter === "all" || a.status === filter) &&

      (a.doctor + " " + a.department + " " + a.id).toLowerCase().includes(search)

    ).sort((a,b) => (b.date+b.time).localeCompare(a.date+a.time));



    $("appointmentsTable").innerHTML = list.length ? list.map(a => `

      <tr><td>${esc(a.id)}</td><td>${esc(a.doctor)}</td><td>${esc(a.department)}</td>

      <td>${prettyDate(a.date)}</td><td>${esc(a.time)}</td><td>${statusBadge(a.status)}</td>

      <td>${a.status === "Scheduled" ? `<button class="table-action cancel-appointment" data-id="${esc(a.id)}">Cancel</button>` : "—"}</td></tr>`

    ).join("") : emptyRow(7,"No appointments match your search.");

  }



  $("appointmentSearch").addEventListener("input", renderAppointments);

  $("appointmentFilter").addEventListener("change", renderAppointments);



  $("appointmentsTable").addEventListener("click", event => {

    const button = event.target.closest(".cancel-appointment");

    if (!button) return;

    const appointment = data.appointments.find(a => a.id === button.dataset.id);

    if (!appointment || appointment.status !== "Scheduled") return;

    if (!confirm("Cancel this appointment? Its demo bill will remain in billing.")) return;

    appointment.status = "Cancelled";

    save();

    render();

    notify("Appointment cancelled.");

  });



  function renderDoctors() {

    const query = $("doctorSearch").value.toLowerCase().trim();

    const list = doctors.filter(d => (d.name+" "+d.department).toLowerCase().includes(query));

    $("doctorsGrid").innerHTML = list.length ? list.map(d => `

      <article class="doctor-card">

        <div class="doctor-avatar">⚕</div>

        <h3>${esc(d.name)}</h3><p>${esc(d.department)}</p>

        <p>Experience: ${esc(d.experience)}</p><p>Consultation fee: <strong>${money(d.fee)}</strong></p>

        <button class="primary-btn doctor-book" data-id="${esc(d.id)}">Book Appointment</button>

      </article>`).join("") : '<div class="panel empty">No doctors found.</div>';

  }



  $("doctorSearch").addEventListener("input", renderDoctors);

  $("doctorsGrid").addEventListener("click", event => {

    const button = event.target.closest(".doctor-book");

    if (!button) return;

    const doctor = doctors.find(d => d.id === button.dataset.id);

    if (!doctor) return;

    showPage("book");

    $("bookingDepartment").value = doctor.department;

    populateDoctorSelect();

    $("bookingDoctor").value = doctor.id;

  });



  function renderRecords() {

    $("recordsTable").innerHTML = data.records.length ? [...data.records].reverse().map(r => `

      <tr><td>${esc(r.id)}</td><td>${esc(r.title)}</td><td>${esc(r.category)}</td>

      <td>${prettyDate(r.date)}</td><td>${esc(r.notes || "—")}</td>

      <td><button class="table-action delete delete-record" data-id="${esc(r.id)}">Delete</button></td></tr>`

    ).join("") : emptyRow(6,"No medical records saved yet.");

  }



  function renderPrescriptions() {

    $("prescriptionsTable").innerHTML = data.prescriptions.length ?

      [...data.prescriptions].reverse().map(r => `

      <tr><td>${esc(r.id)}</td><td>${esc(r.doctor)}</td><td>${esc(r.medication)}</td>

      <td>${esc(r.instructions)}</td><td>${prettyDate(r.date)}</td>

      <td><button class="table-action delete delete-prescription" data-id="${esc(r.id)}">Delete</button></td></tr>`

    ).join("") : emptyRow(6,"No prescriptions saved yet.");

  }



  function renderBilling() {

    const total = data.bills.reduce((sum,b) => sum + Number(b.amount || 0),0);

    const paid = data.bills.filter(b => b.status === "Paid")

      .reduce((sum,b) => sum + Number(b.amount || 0),0);

    const pending = data.bills.filter(b => b.status === "Pending")

      .reduce((sum,b) => sum + Number(b.amount || 0),0);



    $("totalBills").textContent = money(total);

    $("paidBills").textContent = money(paid);

    $("pendingBills").textContent = money(pending);

    $("billingTable").innerHTML = data.bills.length ?

      [...data.bills].reverse().map(b => `

      <tr><td>${esc(b.id)}</td><td>${esc(b.description)}</td><td>${prettyDate(b.date)}</td>

      <td><strong>${money(b.amount)}</strong></td><td>${statusBadge(b.status)}</td>

      <td>${b.status === "Pending" ? `<button class="table-action mark-paid" data-id="${esc(b.id)}">Mark Paid</button>` : "—"}</td></tr>`

    ).join("") : emptyRow(6,"No bills found.");

  }



  $("billingTable").addEventListener("click", event => {

    const button = event.target.closest(".mark-paid");

    if (!button) return;

    const bill = data.bills.find(b => b.id === button.dataset.id);

    if (!bill || bill.status !== "Pending") return;

    if (!confirm("Mark this demo bill as paid? No real payment will be processed.")) return;

    bill.status = "Paid";

    save();

    render();

    notify("Demo bill marked as paid.");

  });



  function render() {

    renderProfile();

    renderDashboard();

    renderAppointments();

    renderDoctors();

    renderRecords();

    renderPrescriptions();

    renderBilling();

  }



  function openModal(title, fields, onSave) {

    $("modalTitle").textContent = title;

    $("modalFields").innerHTML = fields.map(f => {

      if (f.type === "select") {

        return `<label>${esc(f.label)}<select name="${esc(f.name)}" ${f.required ? "required" : ""}>

          <option value="">Choose option</option>${f.options.map(o => `<option value="${esc(o)}">${esc(o)}</option>`).join("")}</select></label>`;

      }

      if (f.type === "textarea") {

        return `<label>${esc(f.label)}<textarea name="${esc(f.name)}" rows="3" maxlength="${f.maxlength || 300}" ${f.required ? "required" : ""}></textarea></label>`;

      }

      return `<label>${esc(f.label)}<input name="${esc(f.name)}" type="${esc(f.type || "text")}" ${f.required ? "required" : ""} maxlength="${f.maxlength || 200}"></label>`;

    }).join("");

    $("modalBackdrop").classList.add("open");

    $("modalFields").querySelector("input,select,textarea")?.focus();

    $("modalForm").onsubmit = event => {

      event.preventDefault();

      const formData = Object.fromEntries(new FormData(event.currentTarget).entries());

      if (onSave(formData) !== false) closeModal();

    };

  }



  function closeModal() {

    $("modalBackdrop").classList.remove("open");

    $("modalForm").reset();

    $("modalForm").onsubmit = null;

  }

  $("closeModal").addEventListener("click", closeModal);

  $("cancelModal").addEventListener("click", closeModal);

  $("modalBackdrop").addEventListener("click", event => {

    if (event.target === $("modalBackdrop")) closeModal();

  });

  document.addEventListener("keydown", event => {

    if (event.key === "Escape") closeModal();

  });



  $("addRecordBtn").addEventListener("click", () => openModal("Add Medical Record",[

    {name:"title",label:"Record Title",required:true,maxlength:100},

    {name:"category",label:"Category",type:"select",required:true,options:["Checkup","Lab Test","Imaging","Discharge Summary","Other"]},

    {name:"date",label:"Record Date",type:"date",required:true},

    {name:"notes",label:"Notes (do not include sensitive details)",type:"textarea",maxlength:300}

  ], form => {

    data.records.push({id:makeId("MR"),title:form.title.trim(),category:form.category,date:form.date,notes:form.notes.trim()});

    save();render();notify("Medical record added.");return true;

  }));



  $("addPrescriptionBtn").addEventListener("click", () => openModal("Add Prescription",[

    {name:"doctor",label:"Doctor Name",required:true,maxlength:100},

    {name:"medication",label:"Medication Name",required:true,maxlength:100},

    {name:"instructions",label:"Instructions from your clinician",type:"textarea",required:true,maxlength:300},

    {name:"date",label:"Prescription Date",type:"date",required:true}

  ], form => {

    data.prescriptions.push({id:makeId("RX"),doctor:form.doctor.trim(),medication:form.medication.trim(),instructions:form.instructions.trim(),date:form.date});

    save();render();notify("Prescription record added.");return true;

  }));



  $("recordsTable").addEventListener("click", event => {

    const button = event.target.closest(".delete-record");

    if (!button) return;

    if (!confirm("Delete this medical record?")) return;

    data.records = data.records.filter(r => r.id !== button.dataset.id);

    save();render();notify("Record deleted.");

  });



  $("prescriptionsTable").addEventListener("click", event => {

    const button = event.target.closest(".delete-prescription");

    if (!button) return;

    if (!confirm("Delete this prescription record?")) return;

    data.prescriptions = data.prescriptions.filter(r => r.id !== button.dataset.id);

    save();render();notify("Prescription record deleted.");

  });



  $("profileForm").addEventListener("submit", event => {

    event.preventDefault();

    data.profile = {

      name:$("profileName").value.trim(),

      email:$("profileEmail").value.trim(),

      phone:$("profilePhone").value.trim(),

      dob:$("profileDob").value,

      gender:$("profileGender").value,

      blood:$("profileBlood").value,

      address:$("profileAddress").value.trim()

    };

    save();renderProfile();notify("Profile saved successfully.");

  });



  $("darkMode").checked = !!data.settings.dark;

  $("reminders").checked = !!data.settings.reminders;

  document.body.classList.toggle("dark",!!data.settings.dark);



  $("darkMode").addEventListener("change", () => {

    data.settings.dark = $("darkMode").checked;

    document.body.classList.toggle("dark",data.settings.dark);

    save();notify("Appearance preference saved.");

  });

  $("reminders").addEventListener("change", () => {

    data.settings.reminders = $("reminders").checked;

    save();notify("Reminder preference saved.");

  });



  $("exportData").addEventListener("click", () => {

    const blob = new Blob([JSON.stringify(data,null,2)],{type:"application/json"});

    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");

    a.href = url;

    a.download = "careplus-demo-data.json";

    document.body.appendChild(a);

    a.click();

    a.remove();

    URL.revokeObjectURL(url);

    notify("Demo data export started.");

  });



  $("resetData").addEventListener("click", () => {

    if (!confirm("Reset all Patient Portal demo records and profile? This cannot be undone.")) return;

    data = initialData();

    save();

    $("appointmentForm").reset();

    $("appointmentDate");

    populateDoctorSelect();

    $("darkMode").checked = false;

    $("reminders").checked = true;

    document.body.classList.remove("dark");

    render();

    showPage("dashboard");

    notify("Demo data has been reset.");

  });



  populateDoctorSelect();

  render();

  syncAppointmentsFromDB();

  async function syncAppointmentsFromDB() {

    try {

      const res = await fetch(API_BASE + "get_appointments.php");

      const json = await res.json();

      if (json.success && Array.isArray(json.data) && json.data.length > 0) {

        const dbAppts = json.data.map(item => ({

          id: "APT-" + item.id,

          dbId: item.id,

          name: item.patient_name || "Patient",

          phone: item.patient_phone || "",

          department: item.department,

          doctor: item.doctor_name,

          date: item.appointment_date,

          time: item.appointment_time ? item.appointment_time.slice(0, 5) : "",

          reason: item.reason || "",

          status: item.status || "Pending"

        }));

        data.appointments = dbAppts;

        save();

        renderAppointments();

        renderDashboard();

      }

    } catch (e) {

      console.warn("Could not sync appointments with DB:", e);

    }

  }



});

