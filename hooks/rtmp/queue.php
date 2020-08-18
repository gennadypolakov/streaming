<?php

//$request = new Request();
//
//if($request->params){
//
//    $params['on_publish'] = [
//        'request_uri' => $_SERVER['REQUEST_URI'],
//        $request->params
//    ];
//
//    file_put_contents('rtmp_callback.json', json_encode($params, JSON_PRETTY_PRINT) . "\n", FILE_APPEND);
//
//}


define('CURRENT_SERVICE', 'queue');
include('service.php');
