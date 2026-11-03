<?php
require_once __DIR__ . '/db.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(['success' => false, 'error' => 'Method not allowed. Use POST.'], 405);
}

$input = jsonInput();

$patientName = trim($input['patient_name'] ?? $input['name'] ?? '');
$phone = trim($input['phone'] ?? '');
$doctorName = trim($input['doctor_name'] ?? $input['doctor'] ?? '');
$department = trim($input['department'] ?? '');
$appointmentDate = trim($input['appointment_date'] ?? $input['date'] ?? '');
$appointmentTime = trim($input['appointment_time'] ?? $input['time'] ?? '');
$reason = trim($input['reason'] ?? '');
$email = trim($input['email'] ?? '');

if (empty($patientName) || empty($phone) || empty($doctorName) || empty($appointmentDate) || empty($appointmentTime)) {
    respond(['success' => false, 'error' => 'All required fields must be filled (Patient Name, Phone, Doctor, Date, Time).'], 400);
}

// Convert 12-hour time (e.g. "02:00 PM") to 24-hour time ("14:00:00") for MySQL TIME type
$parsedTime = strtotime($appointmentTime);
$time24 = $parsedTime ? date('H:i:s', $parsedTime) : $appointmentTime;

try {
    $pdo->beginTransaction();

    // 1. Ensure user exists in users table (required by foreign key fk_appointments_user)
    $userStmt = $pdo->prepare("SELECT id FROM users WHERE phone = ? OR (email != '' AND email = ?) LIMIT 1");
    $userStmt->execute([$phone, $email]);
    $user = $userStmt->fetch();

    if ($user) {
        $userId = (int)$user['id'];
    } else {
        $cleanPhone = preg_replace('/[^0-9]/', '', $phone);
        $userEmail = !empty($email) ? $email : ($cleanPhone . '@patient.careplus');
        $dummyPasswordHash = password_hash('Patient@123', PASSWORD_DEFAULT);
        $defaultGender = 'Prefer not to say';

        $insertUser = $pdo->prepare(
            "INSERT INTO users (full_name, email, phone, gender, password_hash, role) 
             VALUES (?, ?, ?, ?, ?, 'patient')"
        );
        $insertUser->execute([$patientName, $userEmail, $phone, $defaultGender, $dummyPasswordHash]);
        $userId = (int)$pdo->lastInsertId();
    }

    // 2. Insert into appointments table
    $stmt = $pdo->prepare(
        "INSERT INTO appointments (user_id, doctor_name, department, appointment_date, appointment_time, reason, status) 
         VALUES (?, ?, ?, ?, ?, ?, 'Pending')"
    );
    $stmt->execute([$userId, $doctorName, $department, $appointmentDate, $time24, $reason]);
    $appointmentId = (int)$pdo->lastInsertId();

    $pdo->commit();

    respond([
        'success' => true,
        'message' => 'Appointment database me successfully save ho gaya!',
        'appointment_id' => $appointmentId,
        'user_id' => $userId
    ], 201);

} catch (Exception $e) {
    if ($pdo->inTransaction()) {
        $pdo->rollBack();
    }
    respond([
        'success' => false,
        'error' => 'Database error: ' . $e->getMessage()
    ], 500);
}

