<?php
/**
 * AI BROKER - Health Check Endpoint
 * Diagnóstico del VPS Hostinger Ollama y del servicio web
 */

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Access-Control-Allow-Origin: *');

$startedAt = microtime(true);
$ollamaUrl = getenv('OLLAMA_URL') ?: 'https://ollama-pisf.srv1823868.hstgr.cloud/api/chat';
$ollamaApiKey = getenv('OLLAMA_API_KEY') ?: '0b003f95b0539c3cce7cccbaf2e03e6ff17eeee055e69f219ea9bca078478a66';
$ollamaModel = getenv('OLLAMA_MODEL') ?: 'llama3.2:3b';

$ollamaReachable = false;
$diagnostic = 'No comprobado';

if (function_exists('curl_init')) {
    $payload = [
        'model' => $ollamaModel,
        'messages' => [['role' => 'user', 'content' => 'PING']],
        'stream' => false,
        'options' => ['num_predict' => 2]
    ];
    $ch = curl_init($ollamaUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_POSTFIELDS => json_encode($payload),
        CURLOPT_HTTPHEADER => [
            'Content-Type: application/json',
            'Authorization: Bearer ' . $ollamaApiKey
        ],
        CURLOPT_CONNECTTIMEOUT => 3,
        CURLOPT_TIMEOUT => 6,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_SSL_VERIFYHOST => 0
    ]);
    $res = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);

    if ($httpCode >= 200 && $httpCode < 300) {
        $ollamaReachable = true;
        $diagnostic = 'Ollama en VPS Hostinger respondiendo correctamente.';
    } else {
        $diagnostic = "Ollama respondió con código HTTP {$httpCode}. Fallback cognitivo activo.";
    }
}

$latencyMs = round((microtime(true) - $startedAt) * 1000);

echo json_encode([
    'status' => 'healthy',
    'domain' => 'asesor.inmobia360.com',
    'service' => 'AI BROKER White-Label Real Estate Platform',
    'php_version' => PHP_VERSION,
    'ollama_connected' => $ollamaReachable,
    'ollama_model' => $ollamaModel,
    'latency_ms' => $latencyMs,
    'diagnostic' => $diagnostic,
    'server_time' => date('c')
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
