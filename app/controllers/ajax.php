<?php
function run_ajax($file) {
    global $db, $user, $global;
    $arr = ['status'=>'ok'];
    include $file;
    return $arr;
}
$arr = ['status'=>'ok'];
$urls = explode('/', $_GET['urls']);
if (($router->urls[1])&&($router->urls[2])&&(Functions::CheckAjaxFilename($router->urls[1]))&&(Functions::CheckAjaxFilename($router->urls[2]))) {
    $file = AppDir . '/controllers/ajax/' . $router->urls[1] . '/' . $router->urls[2] . '.php';
    if (file_exists($file)) {
        $arr = run_ajax($file);
    } else {
        $arr['status']='error';
        $arr['message']='Wrong URL';
    }
} else {
    $arr['status']='error';
    $arr['message']='Wrong URL';
}
echo json_encode_x($arr);