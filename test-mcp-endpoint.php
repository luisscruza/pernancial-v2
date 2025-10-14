<?php

/**
 * Test script to verify MCP endpoint is working correctly
 * Run with: php test-mcp-endpoint.php
 */

$url = 'https://pernancial.com/mcp/pernancial';
$token = 'YOUR_BEARER_TOKEN_HERE'; // Replace with your actual token

// Test 1: List tools
echo "🔧 Testing MCP Endpoint: List Tools\n";
echo "=====================================\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token,
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'jsonrpc' => '2.0',
    'id' => 1,
    'method' => 'tools/list',
    'params' => [],
]));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";
echo "Response:\n";
echo json_encode(json_decode($response), JSON_PRETTY_PRINT);
echo "\n\n";

// Test 2: Call GetAccountsTool
echo "🏦 Testing MCP Endpoint: Get Accounts\n";
echo "=====================================\n\n";

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, $url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token,
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
    'jsonrpc' => '2.0',
    'id' => 2,
    'method' => 'tools/call',
    'params' => [
        'name' => 'get-accounts-tool',
        'arguments' => [],
    ],
]));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Status: $httpCode\n";
echo "Response:\n";
echo json_encode(json_decode($response), JSON_PRETTY_PRINT);
echo "\n";
