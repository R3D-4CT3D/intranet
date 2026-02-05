<?php
/**
 * CSUN Asset Portal - API Status Check
 * Simple endpoint to verify API is available
 */

header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

echo json_encode([
    'status' => 'ok',
    'message' => 'CSUN Asset Portal API is running',
    'timestamp' => date('c'),
    'php_version' => phpversion()
]);
