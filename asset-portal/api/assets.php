<?php
/**
 * CSUN Asset Portal - Assets API
 * Simple JSON file-based storage
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dataFile = __DIR__ . '/../data/assets.json';

// Ensure data directory exists
$dataDir = dirname($dataFile);
if (!is_dir($dataDir)) {
    mkdir($dataDir, 0755, true);
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    // Read data
    if (file_exists($dataFile)) {
        echo file_get_contents($dataFile);
    } else {
        echo json_encode([
            'assets' => [],
            'categories' => ['Computer', 'Monitor', 'Printer', 'Camera', 'Audio', 'Lighting', 'Accessories', 'Software License', 'Other'],
            'types' => [],
            'statuses' => ['Available', 'Checked Out', 'In Repair', 'Reserved', 'Retired', 'Lost'],
            'conditions' => ['Excellent', 'Good', 'Fair', 'Poor', 'Non-functional'],
            'locations' => []
        ]);
    }
} elseif ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Write data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);

    if ($data === null) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid JSON']);
        exit;
    }

    // Backup before writing
    if (file_exists($dataFile)) {
        $backupFile = $dataFile . '.backup.' . date('Y-m-d-His');
        copy($dataFile, $backupFile);

        // Keep only last 10 backups
        $backups = glob($dataFile . '.backup.*');
        if (count($backups) > 10) {
            usort($backups, function($a, $b) { return filemtime($a) - filemtime($b); });
            for ($i = 0; $i < count($backups) - 10; $i++) {
                unlink($backups[$i]);
            }
        }
    }

    file_put_contents($dataFile, json_encode($data, JSON_PRETTY_PRINT));
    echo json_encode(['success' => true]);
} else {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
}
