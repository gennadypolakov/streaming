<?php
if(empty($_SERVER['HTTPS'])) header('Location: https://streamvi.ru' . $_SERVER['REQUEST_URI']);

define('AppDir', __DIR__ .'/../app');
include AppDir . '/includes/init.php';

$router = new Router();
$user = new Users();

// $request = new Request();

// if(count($request->params) > 0) {
//     file_put_contents('vkpay_index.txt', json_encode($request->params, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);
// }

$path = explode('/', $_GET['urls']);

if($user->CheckJWT() and $path[0] !== 'api') $router->load('client');
else if($user->check_vk_sign() and explode('/',$_GET['urls'])[0] !== 'api') {
    $user->create_jwt();
    setcookie('token', $user->token, time() + 60 * 60 * 24 * 30, '/');
    $router->load('client');
}
else if($path[0] == 'p'){
    setcookie('streamvi', $path[1], time() + 60 * 60 * 24 * 365, '/');
    header('Location: https://streamvi.ru/');
} else if($path[0] == 'api') $router->load($_GET['urls']);
else {
    if($_GET['urls'] == '') $router->load('index');
    else header('Location: https://streamvi.ru/');
}
$router->run();
