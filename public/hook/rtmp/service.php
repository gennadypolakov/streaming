<?php
/**
В скрипте конкретного сервиса
объявите константу CURRENT_SERVICE,
в которой будет записан его индекс
в массиве ответа, пришедшего после авторизации
через auth.php
*/


define('STREAM_NAME_OK', false);

$ts = 'json-'; $tsLen = strlen($ts);

$data = $_GET['name'];
if(STREAM_NAME_OK === strpos($data, $ts))
    redirect();
else {

    $names = json_decode(urldecode(substr($data, $tsLen)), true);
    if(!$names || !key_exists(CURRENT_SERVICE, $names))
    { http_response_code(401); exit; }

    applyName($names[CURRENT_SERVICE]);
}

function applyName($s) {
    $uri = 'rtmp://'.gethostbyname($s['domain']).
        (key_exists('port', $s) ? (':'.$s['port']) : '').
        (key_exists('query', $s) ? $s['query'] : '');

    $redir = 'rtmp://127.0.0.1/live-vk/'.$s['name'].'?uri='.urlencode($uri);

    header('Location: '.$redir);
    http_response_code(301);
    exit();
}

function redirect() {

    $uri = $_GET['uri'];
    header('Location: '.$uri);
    http_response_code(301);
    exit();
}
