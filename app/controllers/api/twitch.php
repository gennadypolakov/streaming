<?php

use TwitchApi\TwitchApi;
use TwitchRequest\TwitchRequest;

// unset($_SESSION['twitch']);

function process() {

    $data['status'] = 'error';
    $redirect_uri = 'https://streamvi.ru/api/twitch';
    $is_token_in_db = false;

    session_start();

    global $db, $twitch_id, $twich_secret;


    $host = 'http' . (empty($_SERVER['HTTPS']) ? '' : 's') . '://' . $_SERVER['HTTP_HOST'];

    $user = new Users();
    if(!$user->CheckJWT()) {
        $data['message'] = 'Authorisation error';
        return $data;
    }

    $user_id = $user->user_id;

    $query = "SELECT `value` FROM `tokens` WHERE `type` = 'twitch' AND `user_id` = ? ";
    $sql = $db->prepare($query);
    $sql->bind_param('i', $user_id);
    $sql->execute();
    $sql->bind_result($token);
    $res = [];
    while($sql->fetch()) $res[] = $token;
    $sql->close();
    if(count($res) == 1) {
        $_SESSION['twitch'] = json_decode($res[0], true);
        $is_token_in_db = true;
    }


    $options = [
        'client_id' => $twitch_id,
        'client_secret' => $twich_secret,
        'redirect_uri' => $redirect_uri,
        'scope' => ['channel_read', 'user_read']
    ];

    $twitchApi = new TwitchApi($options);

    if(isset($_SESSION['twitch'])){

        $refresh_token = $_SESSION['twitch']['refresh_token'];
        $expires_at = $_SESSION['twitch']['expires_at'] ?: 0;

        if($is_token_in_db and $expires_at and $expires_at < time()) {

            $new_token = $twitchApi->refreshToken($refresh_token);

            if(isset($new_token['access_token'], $new_token['refresh_token'], $new_token['expires_in'])) {
                $new_token['expires_at'] = time() + $new_token['expires_in'];
                $_SESSION['twitch'] = $new_token;
            }

            $query = "UPDATE `tokens` SET `value` = ? WHERE `type` = 'twitch' AND `user_id` = ? ";
            $sql = $db->prepare($query);
            $sql->bind_param('si', json_encode($_SESSION['twitch']), $user_id);
            $sql->execute();
            $sql->close();
        }

        if(!$is_token_in_db) {
            $query = "INSERT INTO `tokens`(`user_id`, `type`, `value`) VALUES (?, 'twitch', ?)";
            $sql = $db->prepare($query);
            $sql->bind_param('is', $user_id, json_encode($_SESSION['twitch']));
            $sql->execute();
            $sql->close();
        }

        $twitch_channel = $twitchApi->getAuthenticatedChannel($_SESSION['twitch']['access_token']);

        if(isset(
            $twitch_channel['_id'],
            $twitch_channel['stream_key'],
            $twitch_channel['logo'],
            $twitch_channel['display_name']
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
            $sql->bind_param('si', $twitch_channel['_id'], $user_id);
            $sql->execute();
            $sql->bind_result($id);
            $ids = [];
            while($sql->fetch()) $ids[] = $id;
            $sql->close();

            if(count($ids) == 0) {
                $data = [
                    'name' => cstr($twitch_channel['display_name']),
                    'id' => $twitch_channel['_id'],
                    'type' => 'twitch',
                    'photo_default' => cstr($twitch_channel['logo']),
                    'del' => 1
                ];
                $gr->Insert($data);

                $query = "INSERT INTO `user_group`(`user_id`, `group_id`, `owner_id`) VALUES (?, ?, ?)";
                $sql = $db->prepare($query);
                $sql->bind_param('iii', $user_id, $gr->id, $user_id);
                $sql->execute();
                $sql->close();

                // rtmp://live-vie.twitch.tv/app/{stream_key}
                $rtmp = [
                    'domain' => 'live-vie.twitch.tv',
                    'query' => '/app/',
                    'name' => $twitch_channel['stream_key']
                ];

                $query = "INSERT INTO `rtmp`(`group_id`, `value`) VALUES (?, ?)";
                $sql = $db->prepare($query);
                $sql->bind_param('is', $gr->id, json_encode($rtmp));
                $sql->execute();
                $sql->close();

            }

//            $host = 'https://localhost:10888'; // test
            header('Location: ' . $host . '/success.html');

        }
    } elseif($_GET['code']) {

        $token_data = $twitchApi->getAccessCredentials($_GET['code']);

        if(isset($token_data['access_token'], $token_data['refresh_token'], $token_data['expires_in'])) {
            $token_data['expires_at'] = time() + $token_data['expires_in'];
            $_SESSION['twitch'] = $token_data;
        }

        header('Location: ' . filter_var($redirect_uri, FILTER_SANITIZE_URL));

    } else {

        $auth_url = $twitchApi->getAuthenticationUrl();

        header('Location: ' . filter_var($auth_url, FILTER_SANITIZE_URL));

    }
}
