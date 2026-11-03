
const API_URL = "./api/index.php";

async function apiRequest(entity, method = "GET", id = null, body = null) {
  const url = `${API_URL}?entity=${encodeURIComponent(entity)}${
    id !== null ? `&id=${encodeURIComponent(id)}` : ""
  }`;

  const response = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    ...(body !== null ? { body: JSON.stringify(body) } : {})
  });

  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "Database request failed");
  }

  return result;
}

window.CarePlusDB = {
  getPatients: () => apiRequest("patients"),
  getDoctors: () => apiRequest("doctors"),
  getAppointments: () => apiRequest("appointments"),
  getBills: () => apiRequest("bills")
};

console.log("CarePlus database helper loaded.");
window.addEventListener("load", async () => {
  try {
    const patients = await CarePlusDB.getPatients();
    console.log("MySQL Patients:", patients);
  } catch (error) {
    alert("Database error: " + error.message);
  }
});
