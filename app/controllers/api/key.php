<?php

function update_stream_key($user_id){

    global $db, $rtmp_host;

    $query = "SELECT `value` FROM `stream_keys` WHERE `user_id` = ? ";
    $sql = $db->prepare($query);
    $sql->bind_param('i', $user_id);
    $sql->execute();
    $sql->bind_result($k);
    $res = [];
    while($sql->fetch()) $res[] = $k;

    $key = md5(microtime(true) . rand(1, 100) . $user_id);

    if(count($res) == 1) {
        $query = "UPDATE `stream_keys` SET `value`=? WHERE `user_id`=?";
        $sql = $db->prepare($query);
        $sql->bind_param('si', $key, $user_id);
        $sql->execute();
    } else if (count($res) == 0){
        $query = "INSERT INTO `stream_keys`(`value`, `user_id`) VALUES (?, ?)";
        $sql = $db->prepare($query);
        $sql->bind_param('si', $key, $user_id);
        $sql->execute();
    }
    $sql->close();
    return [
        'url' => 'rtmp://' . $rtmp_host . '/live',
        'name' => $key
    ];
}

function process() {

    header('Content-Type: application/json');

    $data['status'] = 'error';

    $request = new Request();
    $user = new Users();
    $user->token = $request->params['token'] ?: false;

    if($user->CheckJWT()) {

        $data['rtmp'] = update_stream_key($user->user_id);
        $data['status'] = 'ok';

    }

    return $data;
}
