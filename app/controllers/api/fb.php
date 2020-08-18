<?php

use TwitchApi\TwitchApi;
use TwitchRequest\TwitchRequest;
use Facebook\Facebook;

function process() {

    $data['status'] = 'error';
    $redirect_uri = 'https://streamvi.ru/api/fb';
    $is_token_in_db = false;

    session_start();

    global $db, $fb_id, $fb_secret;


    $host = 'http' . (empty($_SERVER['HTTPS']) ? '' : 's') . '://' . $_SERVER['HTTP_HOST'];

    $user = new Users();
    if(!$user->CheckJWT()) {
        $data['message'] = 'Authorisation error';
        return $data;
    }

    $user_id = $user->user_id;

    $query = "SELECT `value` FROM `tokens` WHERE `type` = 'fb' AND `user_id` = ? ";
    $sql = $db->prepare($query);
    $sql->bind_param('i', $user_id);
    $sql->execute();
    $sql->bind_result($token);
    $res = [];
    while($sql->fetch()) $res[] = $token;
    $sql->close();
    if(count($res) == 1) {
        $_SESSION['fb_access_token'] = json_decode($res[0], true);
        $is_token_in_db = true;
    }

    $options = [
        'app_id' => $fb_id,
        'app_secret' => $fb_secret
    ];

    $fbApi = new Facebook($options);

    if(isset($_SESSION['fb_access_token'])){

        $access_token = $_SESSION['fb_access_token']['access_token'];
        $refresh_token = $_SESSION['fb_access_token']['refresh_token'];
        $expire_at = $_SESSION['fb_access_token']['expire_at'] ?: false;

        if($is_token_in_db and $expire_at and $expire_at < time()) {

            $new_token = $fbApi->refreshToken($refresh_token);

            if(isset($new_token['access_token'], $new_token['refresh_token'], $new_token['expires_in'])) {
                $_SESSION['fb_access_token'] = $new_token;
                $_SESSION['fb_access_token']['expire_at'] = $new_token['expires_in'] + time();
            }

            $query = "UPDATE `tokens` SET `value` = ? WHERE `type` = 'fb' AND `user_id` = ? ";
            $sql = $db->prepare($query);
            $sql->bind_param('si', json_encode($_SESSION['fb_access_token']), $user_id);
            $sql->execute();
            $sql->close();
        }

        if(!$is_token_in_db) {
            $query = "INSERT INTO `tokens`(`user_id`, `type`, `value`) VALUES (?, 'fb', ?)";
            $sql = $db->prepare($query);
            $sql->bind_param('is', $user_id, json_encode($_SESSION['fb_access_token']));
            $sql->execute();
            $sql->close();
        }

        $twich_channel = $fbApi->getAuthenticatedChannel($_SESSION['fb_access_token']['access_token']);

        if(isset(
            $twich_channel['_id'],
            $twich_channel['stream_key'],
            $twich_channel['logo'],
            $twich_channel['display_name']
            )) {

            $gr = new Groups();

            $query = "SELECT
                `g`.`group_id` AS `group_id`
                FROM `groups` AS `g`
                JOIN `user_group` AS `ug` ON `ug`.`group_id` = `g`.`group_id`
                WHERE `ug`.`user_id` = `ug`.`owner_id`
                    AND `g`.`id` = ?
                    AND `ug`.`user_id` = ?";
            $sql = $db->prepare($query);
            $sql->bind_param('si', $twich_channel['_id'], $user_id);
            $sql->execute();
            $sql->bind_result($id);
            $ids = [];
            while($sql->fetch()) $ids[] = $id;
            $sql->close();

            if(count($ids) == 0) {
                $data = [
                    'name' => cstr($twich_channel['display_name']),
                    'id' => $twich_channel['_id'],
                    'type' => 'fb',
                    'photo_default' => cstr($twich_channel['logo']),
                    'del' => 1
                ];
                $gr->Insert($data);

                $query = "INSERT INTO `user_group`(`user_id`, `group_id`, `owner_id`) VALUES (?, ?, ?)";
                $sql = $db->prepare($query);
                $sql->bind_param('iii', $user_id, $gr->id, $user_id);
                $sql->execute();
                $sql->close();

                // rtmp://live-vie.fb.tv/app/{stream_key}
                $rtmp = [
                    'domain' => 'live-vie.fb.tv',
                    'query' => '/app/',
                    'name' => $twich_channel['stream_key']
                ];
 
                $query = "INSERT INTO `rtmp`(`group_id`, `value`) VALUES (?, ?)";
                $sql = $db->prepare($query);
                $sql->bind_param('is', $gr->id, json_encode($rtmp));
                $sql->execute();
                $sql->close();

            }
            
            header('Location: ' . $host . '/success.html');

        }
    } elseif($_GET['code']) {

        return [ 'token' => $fbApi->getOAuth2Client()->getAccessTokenFromCode($_GET['code'], $redirect_uri)->getValue() ];
        
        // $access_token = $fbApi->getAccessCredentials($_GET['code']);

        // if(isset($access_token['access_token'], $access_token['refresh_token'], $access_token['expires_in'])) {
        //     $_SESSION['fb_access_token'] = $access_token;
        //     $_SESSION['fb_access_token']['expire_at'] = $access_token['expires_in'] + time();
        // }

        // header('Location: ' . filter_var($redirect_uri, FILTER_SANITIZE_URL));

    } else {

        // $auth_url = $fbApi->getAuthenticationUrl();

        $_SESSION['fb_state'] = md5('facebook' . microtime());

        // $auth_url = $fbApi->getOAuth2Client()->getAuthorizationUrl($redirect_uri, $_SESSION['fb_state'], ['default','pages_show_list']);
        $auth_url = $fbApi->getOAuth2Client()->getAuthorizationUrl($redirect_uri, $_SESSION['fb_state'], ['pages_show_list']);

        // return ['url' => $auth_url];

        header('Location: ' . filter_var($auth_url, FILTER_SANITIZE_URL));

    }
}

// https://streamvi.ru/api/fb?token=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpYXQiOjE1NTc2MjY5ODUsIm5iZiI6MTU1NzYyNjk4NSwiZXhwIjoxNTYwMjE4OTg1LCJ2a191c2VyX2lkIjozMzgyMzM5MTh9.JlBGA5G88IdNDjr8h9H71BdOsS18HAMVd5rK06922Q8
