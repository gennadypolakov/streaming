<?php
/**
В скрипте конкретного сервиса
объявите константу CURRENT_SERVICE,
в которой будет записан его индекс
в массиве ответа, пришедшего после авторизации
через auth.php
*/


define('STREAM_NAME_OK', false);

$ts = 'json-';
$tsLen = strlen($ts);

$data = $_GET['name'];
if(STREAM_NAME_OK === strpos($data, $ts))
    redirect();
else {
    $names = json_decode(urldecode(substr($data, $tsLen)), true);
    if(count($names) > 0) {
        //file_put_contents('names.txt',json_encode($names, JSON_PRETTY_PRINT), FILE_APPEND);
        if(CURRENT_SERVICE === 'connect') {
            applyName($names[count($names) - 1]);
        }
        else if(CURRENT_SERVICE === 'queue') {
            if(count($names) > 1) {
                unset($names[count($names) - 1]);
                $uri = 'rtmp://127.0.0.1/live-router/json-' . urlencode(json_encode($names));

                header('Location: '.$uri);
                http_response_code(301);
                exit();
            }
        }
    } else {
        http_response_code(401);
        exit;
    }
}

function applyName($s) {
    $uri = 'rtmp://'.gethostbyname($s['domain']).
        (key_exists('port', $s) ? (':'.$s['port']) : '').
        (key_exists('query', $s) ? $s['query'] : '');

    $redir = 'rtmp://127.0.0.1/live-connect/' . $s['name'] . '?uri=' . urlencode($uri) . (key_exists('group_id', $s) ? '&group_id=' . $s['group_id'] : '');

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
