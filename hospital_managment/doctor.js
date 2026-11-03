
const registerForm = document.getElementById("registerForm");

if (registerForm) {
  registerForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const doctor = {
      id: "DOC" + Date.now(),
      name: document.getElementById("name").value.trim(),
      email: document.getElementById("email").value.trim().toLowerCase(),
      phone: document.getElementById("phone").value.trim(),
      specialization: document.getElementById("specialization").value.trim(),
      qualification: document.getElementById("qualification").value.trim(),
      password: document.getElementById("password").value
    };

    const doctors = JSON.parse(
      localStorage.getItem("doctors") || "[]"
    );

    const exists = doctors.some(
      d => d.email === doctor.email
    );

    if (exists) {
      document.getElementById("message").textContent =
        "This email is already registered.";
      return;
    }

    doctors.push(doctor);
    localStorage.setItem("doctors", JSON.stringify(doctors));

    alert("Registration successful! Please login.");
    window.location.href = "login.html";
  });
}


const dashboard = document.getElementById("doctorDashboard");

if (dashboard) {
  const email = sessionStorage.getItem("doctorEmail");

  const doctors = JSON.parse(
    localStorage.getItem("doctors") || "[]"
  );

  const doctor = doctors.find(d => d.email === email);

  if (!doctor) {
    dashboard.innerHTML = `
      <h1>Doctor Login Required</h1>
      <p>Please login using your registered doctor account.</p>
      <a href="login.html">Go to Login</a>
    `;
  } else {
    document.getElementById("doctorName").textContent = doctor.name;
    document.getElementById("doctorId").textContent = doctor.id;
    document.getElementById("doctorSpecialization").textContent =
      doctor.specialization;
    document.getElementById("doctorQualification").textContent =
      doctor.qualification;
    document.getElementById("doctorEmail").textContent = doctor.email;
    document.getElementById("doctorPhone").textContent = doctor.phone;
  }
}

function doctorLogout() {
  sessionStorage.removeItem("doctorEmail");
  window.location.href = "login.html";
}
