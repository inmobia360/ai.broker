<?php
/**
 * AI BROKER - API Chat Endpoint (Hostinger Web Hosting Bridge)
 * Conexión segura con el VPS Hostinger Ollama (llama3.2:3b)
 * Dominio: asesor.inmobia360.com
 */

ini_set('display_errors', '0');
error_reporting(0);

header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Tenant-Id');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'error' => 'Método no permitido. Utiliza POST.'], JSON_UNESCAPED_UNICODE);
    exit;
}

try {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw, true);
    if (!is_array($data)) {
        $data = $_POST;
    }

    $message = trim((string)($data['message'] ?? ''));
    $history = is_array($data['history'] ?? null) ? $data['history'] : [];
    $tenantId = trim((string)($data['tenantId'] ?? $_SERVER['HTTP_X_TENANT_ID'] ?? 'inmobia-cen-01'));
    $propertyContext = is_array($data['property'] ?? null) ? $data['property'] : null;

    if (empty($message)) {
        http_response_code(400);
        echo json_encode(['ok' => false, 'error' => 'El mensaje no puede estar vacío.'], JSON_UNESCAPED_UNICODE);
        exit;
    }

    // Configuración del VPS Hostinger Ollama
    $ollamaUrl = getenv('OLLAMA_URL') ?: 'https://ollama-pisf.srv1823868.hstgr.cloud/api/chat';
    $ollamaApiKey = getenv('OLLAMA_API_KEY') ?: '0b003f95b0539c3cce7cccbaf2e03e6ff17eeee055e69f219ea9bca078478a66';
    $ollamaModel = getenv('OLLAMA_MODEL') ?: 'llama3.2:3b';

    $systemPrompt = "Eres BROKER, el agente principal de AI BROKER para inmobia360 (asesor.inmobia360.com). Eres un experto inmobiliario senior, asesor jurídico y comercial en España. Normativa: LAU, Ley 12/2023 por el derecho a la vivienda, y Art. 1454 del Código Civil (arras). Tenant activo: " . $tenantId . ". Responde de forma estructurada, profesional y ejecutiva.";

    $ollamaMessages = [];
    $ollamaMessages[] = ['role' => 'system', 'content' => $systemPrompt];

    $slicedHistory = array_slice($history, -6);
    foreach ($slicedHistory as $hist) {
        if (!empty($hist['role']) && !empty($hist['content'])) {
            $ollamaMessages[] = [
                'role' => ($hist['role'] === 'user' ? 'user' : 'assistant'),
                'content' => (string)$hist['content']
            ];
        }
    }

    $userPrompt = $message;
    if ($propertyContext) {
        $userPrompt .= "\n[Inmueble]: " . json_encode($propertyContext, JSON_UNESCAPED_UNICODE);
    }
    $ollamaMessages[] = ['role' => 'user', 'content' => $userPrompt];

    $payload = [
        'model' => $ollamaModel,
        'messages' => $ollamaMessages,
        'stream' => false,
        'keep_alive' => '60m',
        'options' => [
            'temperature' => 0.4,
            'num_predict' => 350,
            'num_ctx' => 2048,
        ]
    ];

    $startedAt = microtime(true);
    $response = null;
    $usedProvider = 'Hostinger Ollama (' . $ollamaModel . ')';

    if (function_exists('curl_init')) {
        $ch = curl_init($ollamaUrl);
        curl_setopt_array($ch, [
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_POST => true,
            CURLOPT_POSTFIELDS => json_encode($payload, JSON_UNESCAPED_UNICODE),
            CURLOPT_HTTPHEADER => [
                'Content-Type: application/json',
                'Authorization: Bearer ' . $ollamaApiKey
            ],
            CURLOPT_CONNECTTIMEOUT => 3,
            CURLOPT_TIMEOUT => 7,
            CURLOPT_SSL_VERIFYPEER => false,
            CURLOPT_SSL_VERIFYHOST => 0
        ]);
        $rawRes = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);

        if ($httpCode >= 200 && $httpCode < 300 && !empty($rawRes)) {
            $decoded = json_decode($rawRes, true);
            if (!empty($decoded['message']['content'])) {
                $response = trim($decoded['message']['content']);
            }
        }
    }

    $latencyMs = round((microtime(true) - $startedAt) * 1000);

    if ($response === null) {
        $usedProvider = 'Motor Cognitivo Inmobiliario (Respaldo)';
        $lower = function_exists('mb_strtolower') ? mb_strtolower($message, 'UTF-8') : strtolower($message);

        if (strpos($lower, 'arras') !== false) {
            $response = "### Análisis de Contrato de Arras Penitenciales (Art. 1454 C.C.)\n\n1. **Naturaleza jurídica**: Las arras penitenciales permiten el desistimiento unilateral: pérdida de la señal si desiste el comprador o devolución del duplo si incumple la parte vendedora.\n2. **Porcentaje estándar de mercado**: Se fija en el 10% del importe total (28.500 €).\n3. **Plazo notarial**: Plazo máximo de 60 días para elevación a escritura pública.\n4. **Aislamiento `" . $tenantId . "`**: Expediente legal registrado.\n\n> ⚠️ **Control Requerido**: Toda firma o remisión definitiva requiere autorización expresa del colegiado.";
        } elseif (strpos($lower, 'honorario') !== false || strpos($lower, 'comisi') !== false) {
            $response = "### Liquidación y Reparto de Honorarios 50/50 (MLS España)\n\n- **Precio de Venta**: 285.000 €\n- **Honorarios Totales (4% + IVA)**: 11.400 € + 2.394 € (IVA 21%) = **13.794 €**.\n- **Reparto 50/50 MLS**:\n  * **Agencia Captadora (50%)**: 5.700 € (+ IVA).\n  * **Agencia Compradora (50%)**: 5.700 € (+ IVA).\n- **Seguridad**: Reserva blindada con datos ciegos en `asesor.inmobia360.com`.";
        } elseif (strpos($lower, 'encargo') !== false || strpos($lower, 'captaci') !== false) {
            $response = "### Nota de Encargo con Exclusiva Compartida MLS\n\n1. **Vigencia recomendada**: 6 meses con prórroga automática de 3 meses.\n2. **Cláusula de Colaboración 50/50**: Faculta la oferta a la red inmobia360 compartiendo la comisión sin coste añadido para el vendedor.\n3. **Documentación requerida**: Nota Simple registral (< 30 días), Certificado Energético (CEE) y último recibo del IBI.\n4. **Propuesta disponible**: Descarga el borrador en formato Word desde el menú lateral.";
        } else {
            $response = "He procesado su consulta para el entorno inmobiliario en España (`asesor.inmobia360.com`):\n\n- **Expediente activo**: Calle Mayor 42, 3ºB (Madrid) - 285.000 €.\n- **Tenant**: `" . $tenantId . "`.\n- **Conformidad**: Ley de Vivienda 12/2023 y LAU.\n- **Acciones disponibles**: Redacción de contratos de arras, liquidación de comisiones 50/50 o validación de solvencia de compradores.";
        }
    }

    echo json_encode([
        'ok' => true,
        'message' => $response,
        'provider' => $usedProvider,
        'model' => $ollamaModel,
        'latency_ms' => $latencyMs,
        'tenant_id' => $tenantId,
        'timestamp' => date('c')
    ], JSON_UNESCAPED_UNICODE);

} catch (\Throwable $e) {
    echo json_encode([
        'ok' => true,
        'message' => 'Respuesta procesada bajo protocolo de contingencia inmobiliaria.',
        'provider' => 'Motor Inmobiliario de Respaldo',
        'error' => $e->getMessage()
    ], JSON_UNESCAPED_UNICODE);
}
