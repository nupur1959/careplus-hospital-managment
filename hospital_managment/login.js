
document.addEventListener("DOMContentLoaded", function () {
  const form = document.getElementById("loginForm");

  form.addEventListener("submit", function (event) {
    event.preventDefault();

    const role = document.getElementById("role").value;
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    if (!role || !email || !password) {
      alert("Please fill all fields.");
      return;
    }

    // Demo login only — not secure authentication
    sessionStorage.setItem("careplusRole", role);
    sessionStorage.setItem("careplusEmail", email);

    if (role === "admin") {
      window.location.href = "admin.html";
    } else if (role === "doctor") {
      window.location.href = "doctor.html";
    } else if (role === "patient") {
      window.location.href = "patient.html";
    } else {
      alert("Please select a valid role.");
    }
  });
});
