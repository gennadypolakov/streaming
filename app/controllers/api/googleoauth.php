<?php

use \Firebase\JWT\JWT;

function process() {

    session_start();

    global $db;


    $host = 'http' . (empty($_SERVER['HTTPS']) ? '' : 's') . '://' . $_SERVER['HTTP_HOST'];

    $user = new Users();
    if(!$user->CheckJWT()) return [];
    $user_id = $user->user_id;

    $query = "SELECT `value` FROM `tokens` WHERE `type` = 'youtube' AND `user_id` = ? ";
    $sql = $db->prepare($query);
    $sql->bind_param('i', $user_id);
    $sql->execute();
    $sql->bind_result($token);
    $res = [];
    while($sql->fetch()) $res[] = $token;
    $sql->close();
    if(count($res) == 1) $_SESSION['youtube_access_token'] = json_decode($res[0], true);


    include AppDir.'/../vendor/autoload.php';
    $client = new Google_Client();
    $client->setAuthConfig(AppDir.'/client_secret_584173880942-7cfln6g0kf43gv0n4lkj71hsmcrt65ma.apps.googleusercontent.com.json');
    //$client->setAuthConfig(AppDir.'/client_secret.json');
    $client->addScope("https://www.googleapis.com/auth/youtube.force-ssl");
    //$client->addScope("https://www.googleapis.com/auth/youtube.readonly");
    $client->setAccessType('offline');
    $client->setApprovalPrompt('force');
    
    $client->setRedirectUri($host . '/api/googleoauth');
    //$client->setRedirectUri('http://localhost:10888/api/googleoauth');


    if(isset($_REQUEST['channel'])) {
        $_SESSION['channel'] = $_REQUEST['channel'];
        $_SESSION['request_data'] =  ['id' => $_REQUEST['channel']];
    }
    if(!isset($_SESSION['request_data']['id'])) $_SESSION['request_data'] = ['mine' => true];

    if(isset($_SESSION['youtube_access_token'])){
        $client->setAccessToken($_SESSION['youtube_access_token']);

        $query = "SELECT `value` FROM `tokens` WHERE `type` = 'youtube' AND `user_id` = ? ";
        $sql = $db->prepare($query);
        $sql->bind_param('i', $user_id);
        $sql->execute();
        $sql->bind_result($token);
        $res = [];
        while($sql->fetch()) $res[] = $token;

        if(count($res) == 1) {
            $query = "UPDATE `tokens` SET `value` = ? WHERE `type` = 'youtube' AND `user_id` = ? ";
            $sql = $db->prepare($query);
            $sql->bind_param('si', json_encode($_SESSION['youtube_access_token']), $user_id);
            $sql->execute();
        } else if (count($res) == 0){
            $query = "INSERT INTO `tokens`(`user_id`, `type`, `value`) VALUES (?, 'youtube', ?)";
            $sql = $db->prepare($query);
            $sql->bind_param('is', $user_id, json_encode($_SESSION['youtube_access_token']));
            $sql->execute();
        }
        $sql->close();

            // Refresh the token if it's expired.
        if ($client->isAccessTokenExpired()) {
            $client->refreshToken($client->getRefreshToken());
            $_SESSION['youtube_access_token'] = $client->getAccessToken();

            $query = "SELECT `value` FROM `tokens` WHERE `type` = 'youtube' AND `user_id` = ? ";
            $sql = $db->prepare($query);
            $sql->bind_param('i', $user_id);
            $sql->execute();
            $sql->bind_result($token);
            $res = [];
            while($sql->fetch()) $res[] = $token;
            $sql->close();
            if(count($res) == 1) {
                $query = "UPDATE `tokens` SET `value` = ? WHERE `type` = 'youtube' AND `user_id` = ? ";
                $sql = $db->prepare($query);
                $sql->bind_param('si', json_encode($_SESSION['youtube_access_token']), $user_id);
                $sql->execute();
            } else if (count($res) == 0){
                $query = "INSERT INTO `tokens`(`user_id`, `type`, `value`) VALUES (?, 'youtube', ?)";
                $sql = $db->prepare($query);
                $sql->bind_param('is', $user_id, json_encode($_SESSION['youtube_access_token']));
                $sql->execute();
            }
        }

        $youtube = new Google_Service_YouTube($client);
        $channels = $youtube->channels->listChannels(
            'snippet',
            $_SESSION['request_data']
        );
        if (!empty($channels)){

            $gr = new Groups();
            for($i = 0; $i < count($channels['items']); $i++){

                $query = "SELECT
                    `g`.`group_id` AS `group_id`
                    FROM `groups` AS `g`
                    JOIN `user_group` AS `ug` ON `ug`.`group_id` = `g`.`group_id`
                    WHERE `ug`.`user_id` = `ug`.`owner_id`
                        AND `g`.`id` = ?
                        AND `ug`.`user_id` = ?";
                $sql = $db->prepare($query);
                $sql->bind_param('si', $channels['items'][$i]['id'], $user_id);
                $sql->execute();
                $sql->bind_result($id);
                $ids = [];
                while($sql->fetch()) $ids[] = $id;
                $sql->close();

                // $gr->GetItems([
                //     'id' => $channels['items'][$i]['id'],
                //     'user_id' => $user_id //test
                // ]);
                // if($gr->count == 0) {
                if(count($ids) == 0) {
                    $data = [
                        // 'user_id' => $user_id, //test
                        'name' => cstr($channels['items'][$i]['snippet']['title']),
                        'id' => $channels['items'][$i]['id'],
                        'type' => 'youtube',
                        'photo_default' => cstr($channels['items'][$i]['snippet']['thumbnails']['default']['url']),
                        'photo_medium' => cstr($channels['items'][$i]['snippet']['thumbnails']['medium']['url']),
                        'photo_high' => cstr($channels['items'][$i]['snippet']['thumbnails']['high']['url']),
                        'del' => 1
                    ];
                    $gr->Insert($data);
                    // $group_id = $gr->id;

                    $query = "INSERT INTO `user_group`(`user_id`, `group_id`, `owner_id`) VALUES (?, ?, ?)";
                    $sql = $db->prepare($query);
                    $sql->bind_param('iii', $user_id, $gr->id, $user_id);
                    $sql->execute();

                } /*else if($gr->count == 1){
                    $gr->Update(
                        [
                            'name' => cstr($channels['items'][$i]['snippet']['title']),
                            'photo_default' => cstr($channels['items'][$i]['snippet']['thumbnails']['default']['url']),
                            'photo_medium' => cstr($channels['items'][$i]['snippet']['thumbnails']['medium']['url']),
                            'photo_high' => cstr($channels['items'][$i]['snippet']['thumbnails']['high']['url']),
                            'sell' => 0,
                            'del' => 0
                        ],
                        $gr->items[0]['group_id']
                    );
                }*/
            }

//            $host = 'https://localhost:10888'; // test
            header('Location: ' . $host . '/success.html');
            return [];
        }
    } 
    elseif($_REQUEST['code']){
        $client->authenticate($_REQUEST['code']);
        $_SESSION['youtube_access_token'] = $client->getAccessToken();
        
        $redirect_uri = $host . '/api/googleoauth';
        header('Location: ' . filter_var($redirect_uri, FILTER_SANITIZE_URL));
        return [];
        // }
    }
    else {
        $client->setIncludeGrantedScopes(true);
        $auth_url = filter_var($client->createAuthUrl(), FILTER_SANITIZE_URL);

        $auth_url = $client->createAuthUrl();
        header('Location: ' . filter_var($auth_url, FILTER_SANITIZE_URL));

        return [ "url" => $auth_url ];
    }
}
