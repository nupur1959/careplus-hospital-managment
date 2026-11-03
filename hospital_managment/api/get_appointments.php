<?php
require_once __DIR__ . '/db.php';

try {
    $stmt = $pdo->query(
        "SELECT a.id, a.user_id, a.doctor_name, a.department, a.appointment_date, a.appointment_time, 
                a.reason, a.status, a.created_at, u.full_name AS patient_name, u.phone AS patient_phone
         FROM appointments a
         LEFT JOIN users u ON a.user_id = u.id
         ORDER BY a.id DESC"
    );
    $appointments = $stmt->fetchAll();
    respond([
        'success' => true,
        'data' => $appointments
    ]);
} catch (Exception $e) {
    respond(['success' => false, 'error' => $e->getMessage()], 500);
}

