<?php
require_once __DIR__ . '/db.php';

$allowed = [
    'patients' => [
        'table' => 'patients',
        'fields' => [
            'full_name', 'email', 'phone', 'dob',
            'gender', 'blood_group', 'address'
        ],
        'required' => ['full_name']
    ],
    'doctors' => [
        'table' => 'doctors',
        'fields' => [
            'full_name', 'department', 'phone', 'email', 'fee'
        ],
        'required' => ['full_name', 'department']
    ],
    'appointments' => [
        'table' => 'appointments',
        'fields' => [
            'patient_id', 'doctor_id', 'appointment_date',
            'appointment_time', 'reason', 'status'
        ],
        'required' => [
            'patient_id', 'doctor_id',
            'appointment_date', 'appointment_time'
        ]
    ],
    'records' => [
        'table' => 'medical_records',
        'fields' => [
            'patient_id', 'title', 'category', 'record_date', 'notes'
        ],
        'required' => ['patient_id', 'title']
    ],
    'prescriptions' => [
        'table' => 'prescriptions',
        'fields' => [
            'patient_id', 'doctor_id', 'medication',
            'instructions', 'prescription_date'
        ],
        'required' => [
            'patient_id', 'medication', 'instructions'
        ]
    ],
    'bills' => [
        'table' => 'bills',
        'fields' => [
            'patient_id', 'appointment_id', 'description',
            'amount', 'bill_date', 'status'
        ],
        'required' => [
            'patient_id', 'description', 'amount', 'bill_date'
        ]
    ]
];

function fail(string $message, int $status = 400): void
{
    respond(['error' => $message], $status);
}

function getPayload(array $config): array
{
    $input = jsonInput();
    $data = [];

    foreach ($config['fields'] as $field) {
        if (array_key_exists($field, $input)) {
            $data[$field] = $input[$field];
        }
    }

    return $data;
}

function validateData(array &$data, array $config, bool $creating): void
{
    if ($creating) {
        foreach ($config['required'] as $field) {
            if (
                !array_key_exists($field, $data) ||
                $data[$field] === '' ||
                $data[$field] === null
            ) {
                fail("Required field missing: $field");
            }
        }
    }

    foreach ($data as $field => $value) {
        if ($value === '') {
            $data[$field] = null;
        }
    }

    foreach (['patient_id', 'doctor_id', 'appointment_id'] as $field) {
        if (
            array_key_exists($field, $data) &&
            $data[$field] !== null &&
            (
                filter_var($data[$field], FILTER_VALIDATE_INT) === false ||
                (int)$data[$field] < 1
            )
        ) {
            fail("Invalid ID: $field");
        }
    }

    foreach (['fee', 'amount'] as $field) {
        if (
            isset($data[$field]) &&
            (!is_numeric($data[$field]) || $data[$field] < 0)
        ) {
            fail(ucfirst($field) . ' must be a non-negative number');
        }
    }

    if (isset($data['status'])) {
        if (
            $config['table'] === 'appointments' &&
            !in_array(
                $data['status'],
                ['Scheduled', 'Completed', 'Cancelled'],
                true
            )
        ) {
            fail('Invalid appointment status');
        }

        if (
            $config['table'] === 'bills' &&
            !in_array($data['status'], ['Pending', 'Paid'], true)
        ) {
            fail('Invalid bill status');
        }
    }

    foreach ([
        'dob', 'appointment_date', 'record_date',
        'prescription_date', 'bill_date'
    ] as $field) {
        if (
            isset($data[$field]) &&
            $data[$field] !== ''
        ) {
            $value = (string)$data[$field];
            $date = DateTime::createFromFormat('!Y-m-d', $value);

            if (!$date || $date->format('Y-m-d') !== $value) {
                fail("Invalid date format for $field. Use YYYY-MM-DD.");
            }
        }
    }

    if (
        isset($data['appointment_time']) &&
        $data['appointment_time'] !== null
    ) {
        if (!preg_match(
            '/^(?:[01]\d|2[0-3]):[0-5]\d(?::[0-5]\d)?$/',
            (string)$data['appointment_time']
        )) {
            fail('Invalid appointment time. Use HH:MM.');
        }
    }
}

try {
    $entity = $_GET['entity'] ?? '';

    if (!isset($allowed[$entity])) {
        fail(
            'Invalid entity. Use patients, doctors, appointments, records, prescriptions or bills.'
        );
    }

    $config = $allowed[$entity];
    $table = $config['table'];
    $method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

    $id = isset($_GET['id'])
        ? filter_var(
            $_GET['id'],
            FILTER_VALIDATE_INT,
            ['options' => ['min_range' => 1]]
        )
        : null;

    if (isset($_GET['id']) && $id === false) {
        fail('Invalid record ID');
    }

    if ($method === 'GET') {
        if ($id !== null) {
            $stmt = $pdo->prepare(
                "SELECT * FROM `$table` WHERE id = ?"
            );
            $stmt->execute([$id]);
            $record = $stmt->fetch(PDO::FETCH_ASSOC);

            if (!$record) {
                fail('Record not found', 404);
            }

            respond($record);
        }

        $stmt = $pdo->query(
            "SELECT * FROM `$table` ORDER BY id DESC"
        );

        respond($stmt->fetchAll(PDO::FETCH_ASSOC));
    }

    if ($method === 'POST') {
        $data = getPayload($config);
        validateData($data, $config, true);

        $columns = array_keys($data);

        if (!$columns) {
            fail('No data provided');
        }

        $columnSql = implode(', ', array_map(
            fn($column) => "`$column`",
            $columns
        ));

        $placeholders = implode(
            ', ',
            array_fill(0, count($columns), '?')
        );

        $stmt = $pdo->prepare(
            "INSERT INTO `$table` ($columnSql) VALUES ($placeholders)"
        );

        $stmt->execute(array_values($data));

        respond([
            'success' => true,
            'message' => 'Record added successfully',
            'id' => (int)$pdo->lastInsertId()
        ], 201);
    }

    if ($method === 'PUT') {
        if ($id === null) {
            fail('Record ID is required for update');
        }

        $data = getPayload($config);
        validateData($data, $config, false);

        if (!$data) {
            fail('No fields provided for update');
        }

        $sets = [];

        foreach (array_keys($data) as $field) {
            $sets[] = "`$field` = ?";
        }

        $values = array_values($data);
        $values[] = $id;

        $stmt = $pdo->prepare(
            "UPDATE `$table` SET " .
            implode(', ', $sets) .
            " WHERE id = ?"
        );

        $stmt->execute($values);

        respond([
            'success' => true,
            'message' => 'Update request completed',
            'id' => (int)$id
        ]);
    }

    if ($method === 'DELETE') {
        if ($id === null) {
            fail('Record ID is required for delete');
        }

        $stmt = $pdo->prepare(
            "DELETE FROM `$table` WHERE id = ?"
        );

        $stmt->execute([$id]);

        if ($stmt->rowCount() === 0) {
            fail('Record not found', 404);
        }

        respond([
            'success' => true,
            'message' => 'Record deleted successfully'
        ]);
    }

    header('Allow: GET, POST, PUT, DELETE');
    fail('Method not allowed', 405);

} catch (PDOException $e) {
    error_log($e->getMessage());
    fail(
        'Database operation failed. Check database tables and field names.',
        500
    );
} catch (Throwable $e) {
    error_log($e->getMessage());
    fail('Server error', 500);
}
