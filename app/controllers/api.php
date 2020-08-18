<?php

if(count($router->urls) < 2) {
    response_error('Empty request');
    exit;
}

$url = implode('/', array_splice($router->urls, 1));

if(!Functions::CheckAjaxFilename($url)) {
    response_error('Wrong URL');
    exit;
}

$path = getPath($url);

if(!$path) {
    response_error('Incorrect request');
    exit;
}

response_data(run_ajax($path));

function response_data($data) {

    if(!$data)
        $data = array('status' => 'ok');
    else if(!key_exists('status', $data))
        $data['status'] = 'ok';
    else if($data['status'] == 'error' && !key_exists('message', $data))
        $data['message'] = 'An error occured';

    echo json_encode_x($data);
}

function response_error($msg = 'An error occured') {
    echo json_encode_x(array(
        'status' => 'error',
        'message' => $msg,
    ));
}

function getPath($url) {
    $url_parts = explode('/', $url);
    $c = count($url_parts);
    for($i = $c - 1; $i >= 0; $i--) {
        $path = AppDir . '/controllers/api/' . implode('/', $url_parts) . '.php';
        if(file_exists($path))
            return $path;
        unset($url_parts[$i]);
    }
    return null;
}

function run_ajax($file) {
    global $db, $user, $global, $vk_callback_api_secret;
    include $file;
    return process();
}