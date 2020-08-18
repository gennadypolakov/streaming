<?php
define('AppDir', __DIR__ .'/../../app');
include AppDir . '/includes/init.php';

$request = new Request();

if($request->params){

//    $params['on_publish'] = [
//        'request_uri' => $_SERVER['REQUEST_URI'],
//        $request->params
//    ];
//
//    file_put_contents('rtmp_callback.json', json_encode($params, JSON_PRETTY_PRINT) . "\n", FILE_APPEND);

    if($request->params['group_id']){

        $query = "UPDATE `groups` SET `live` = '1' WHERE `group_id` = ?";
        $sql = $db->prepare($query);
        $sql->bind_param('i', $request->params['group_id']);
        $sql->execute();
        $sql->close();

    }

}



define('CURRENT_SERVICE', 'connect');
include('service.php');
