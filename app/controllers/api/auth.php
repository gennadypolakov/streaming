<?php

use VK\Client\VKApiClient;
use VK\OAuth\VKOAuth;
use VK\OAuth\VKOAuthDisplay;
use VK\OAuth\VKOAuthResponseType;
use VK\OAuth\Scopes\VKOAuthUserScope;
use \Firebase\JWT\JWT;
use Hashids\Hashids;

function stream_keys($user_id){

    global $db, $rtmp_host;

    $query = "SELECT `value` FROM `stream_keys` WHERE `user_id` = ? ";
    $sql = $db->prepare($query);
    $sql->bind_param('i', $user_id);
    $sql->execute();
    $sql->bind_result($k);
    $res = [];
    while($sql->fetch()) $res[] = $k;

    $key = md5(microtime(true) . $user_id);
    if(count($res) == 1) $key = $res[0];
    else if (count($res) == 0){
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

function token_types($user_id) {

    global $db;

    $query = "SELECT `type` FROM `tokens` WHERE `user_id` = ?";
    $sql = $db->prepare($query);
    $sql->bind_param('i', $user_id);
    $sql->execute();
    $sql->bind_result($type);
    $token = [];
    while($sql->fetch()) $token[$type] = true;
    $sql->close();

    return $token;
}

function num_partners($user_id) {

    global $db;

    $query = "SELECT * FROM `users` WHERE `referer_id` = ?";
    $sql = $db->prepare($query);
    $sql->bind_param('i', $user->user_id);
    $sql->execute();
    $sql->store_result();

    return $sql->num_rows;
}

function user_groups($vk_user_id, $user_id, $vk_access_token){

    global $db;

    try{
        $vk = new VKApiClient();
        $user_groups = $vk->groups()->get(
            $vk_access_token,
            [
                'user_id' => $vk_user_id,
                'extended' => 1,
                'filter' => 'admin'
            ]
        );

        if(isset($user_groups['count']) and $user_groups['count'] > 0){
            for ($i = 0; $i < $user_groups['count']; $i++){

                $query = "SELECT `group_id` FROM `groups` WHERE `id` = ?";
                $groups = $db->prepare($query);
                $groups->bind_param('s', $user_groups['items'][$i]['id']);
                $groups->execute();
                $groups->bind_result($id);
                $group_ids = array();
                while($groups->fetch()) {
                    $group_ids[] = $id;
                }
                $groups->close();

                $group = new Groups();
                if(count($group_ids) == 0) {
                    $group->Insert([
                            'user_id' => $user_id,
                            'name' => cstr($user_groups['items'][$i]['name']),
                            'id' => $user_groups['items'][$i]['id'],
                            'type' => 'vk',
                            'photo_50' => cstr($user_groups['items'][$i]['photo_50']),
                            'photo_100' => cstr($user_groups['items'][$i]['photo_100']),
                            'photo_200' => cstr($user_groups['items'][$i]['photo_200']),
                            'del' => 1
                        ]);
                    if($group->id != 0){
                        $id = $group->id;
                        $group->table_name = 'user_group';
                        $group->Insert([
                                'user_id' => $user_id,
                                'group_id' => $id,
                                'owner_id' => $user_id
                            ]);
                    }
                } else if(count($group_ids) == 1){
                    $group->Update(
                        [
                            'name' => cstr($user_groups['items'][$i]['name']),
                            'photo_50' => cstr($user_groups['items'][$i]['photo_50']),
                            'photo_100' => cstr($user_groups['items'][$i]['photo_100']),
                            'photo_200' => cstr($user_groups['items'][$i]['photo_200'])
                        ],
                        $group_ids[0]
                    );
                }
            }
        }
    } catch(Exception $e) {
        // return [];
    }

}


function process() {

    global $db, $jwt_key, $vk_group_client_id, $vk_group_client_secret;

    include AppDir . '/includes/codes.php';

    header('Content-Type: application/json');
    session_start();

    $oauth = new VKOAuth();

    $host = 'http' . (empty($_SERVER['HTTPS']) ? '' : 's') . '://' . $_SERVER['HTTP_HOST'];
    $redirect_uri = $host . '/api/auth';

    $curent_time = time();
    $data2token = [
        'iat' => $curent_time,
        'nbf' => $curent_time,
        'exp' => $curent_time + 60 * 60 * 24 * 30,
        // 'agent' => md5($_SERVER['HTTP_USER_AGENT'])
    ];

    $request = new Request();

    $user = new Users();
    $user->token = $request->params['token'] ?: false;

    if($user->CheckJWT()){

        $user_data = $user->user_data;

        $user_data['rtmp'] = stream_keys($user->user_id);

        $user_data['token'] = token_types($user->user_id);

        $user_data['partners'] = num_partners($user->user_id);

        return $user_data;

    } else if($user->check_vk_sign()){

        if($user->count == 1) {
            $user_data = $user->user_data;

            $user_data['jwt'] = false;
            if(!$user->token) {
                $user->create_jwt();
                $user_data['jwt'] = $user->token;
            }

            $user_data['rtmp'] = stream_keys($user->user_id);

            $user_data['token'] = token_types($user->user_id);

            $user_data['partners'] = num_partners($user->user_id);

            return $user_data;
        }

    } else if($request->params['vk_access_token']){
        // file_put_contents('login.txt', json_encode($request->params, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);

        $user_data = $request->params['user'];
        $user->vk_user_id = $user_data['id'];

        $data2token['vk_user_id'] = $user_data['id'];
        $jwt = JWT::encode($data2token, $jwt_key);

        $user_data['jwt'] = $jwt;

        $user->GetItems([ 'vk_user_id' => $user_data['id'] ]);

        $hashids = new Hashids($jwt_key, 6);

        if($user->count == 0) {

            $referer_id = 0;
            $money = 0;
            $bonus = 300;
            if(isset($_COOKIE['streamvi'])) {
                try{
                    $r_id = $hashids->decode($_COOKIE['streamvi']);
                    if(is_array($r_id) and count($r_id) == 1) {
                        $ref = new Users();
                        $ref->GetItems([
                            'user_id' => (int)$r_id[0],
                            'del' => 0
                        ]);
                        if($ref->count == 1) {
                            $referer_id = $r_id[0];
                            $money = $bonus;
                        }
                    }
                } catch (Exception $e) {}
            }

            $data = [
                'vk_user_id'      => $user_data['id'],
                'name'            => cstr($user_data['first_name']),
                'fename'          => cstr($user_data['last_name']),
                'photo_50'        => cstr($user_data['photo_100']),
                'photo_100'       => cstr($user_data['photo_100']),
                'photo_200'       => cstr($user_data['photo_200']),
                'photo_max'       => cstr($user_data['photo_200']),
                'date'            => date("Y-m-d H:i:s"),
                'mail'            => '',
                'pone'            => 0,
                'role'            => 0,
                'del'             => 0,
                'money'           => $money,
                'referer_id'      => $referer_id
            ];
            $user->Insert($data);
            if($user->id != 0) {

                if($money != 0){
                    $query = "INSERT INTO `transactions` (`type`, `sum`, `description`, `code`, `user_id`, `date`)
                        VALUES ('+', ".$money.", '".$codes[1]."', 1, ".$user->id.", ".time().")";
                    $sql = $db->prepare($query);
                    $sql->execute();
                    $sql->close();
                }

                $user->Update(['ref_id' => $hashids->encode($user->id)], $user->id);

                $user->user_id = $user->id;
                $query = "INSERT INTO `tokens`(`user_id`, `type`, `value`) VALUES (?, 'vk', ?)";
                $sql = $db->prepare($query);
                $sql->bind_param('is', $user->id, $request->params['vk_access_token']);
                $sql->execute();

                $query = "INSERT INTO `stream_keys`(`user_id`, `value`) VALUES (?, ?)";
                $sql = $db->prepare($query);
                $sql->bind_param('is', $user->id, md5(microtime(true) . $user->id));
                $sql->execute();

                $sql->close();
            }
        } else {
            $user->user_id = $user->items[0]['user_id'];
            $user->Update(
                [
                    'name'            => cstr($user_data['first_name']),
                    'fename'          => cstr($user_data['last_name']),
                    'photo_50'        => cstr($user_data['photo_100']),
                    'photo_100'       => cstr($user_data['photo_100']),
                    'photo_200'       => cstr($user_data['photo_200']),
                    'photo_max'       => cstr($user_data['photo_200'])
                ],
                $user->items[0]['user_id']
            );

            $query = "UPDATE `users` SET `ref_id` = ? WHERE `user_id` = ? AND (`ref_id` = '' OR `ref_id` IS NULL)";
            $sql = $db->prepare($query);
            $sql->bind_param('si', $hashids->encode($user->user_id), $user->user_id);
            $sql->execute();
            $sql->close();

            $query = "SELECT `value` FROM `tokens` WHERE `type` = 'vk' AND `user_id` = ? ";
            $sql = $db->prepare($query);
            $sql->bind_param('i', $user->items[0]['user_id']);
            $sql->execute();
            $sql->bind_result($token);
            $res = [];
            while($sql->fetch()) $res[] = $token;
            $sql->close();
            $query = false;
            if(count($res) == 1) {
                $query = "UPDATE `tokens` SET `value` = ? WHERE `type` = 'vk' AND `user_id` = ?";
            } else if (count($res) == 0){
                $query = "INSERT INTO `tokens`(`value`, `type`, `user_id`) VALUES (?, 'vk', ?)";
            }
            if($query){
                $sql = $db->prepare($query);
                $sql->bind_param('si', $request->params['vk_access_token'], $user->items[0]['user_id']);
                $sql->execute();
                $sql->close();
            }
            $user_data['update'] = true;
        }

        user_groups($request->params['user']['id'], $user->user_id, $request->params['vk_access_token']);

        $user_data['user_id'] = $user->user_id;
        // $user_data = $user->user_data;

        $user_data['rtmp'] = stream_keys($user->user_id);

        $user_data['token'] = token_types($user->user_id);

        $user_data['partners'] = num_partners($user->user_id);

        return $user_data;

    } else if(isset($_SESSION['user_auth_data'])){
        $user_data = $_SESSION['user_auth_data'];

        $data2token['vk_user_id'] = $user_data['id'];
        $jwt = JWT::encode($data2token, $jwt_key);

        $user->GetItems([ 'vk_user_id' => $user_data['id'] ]);

        $hashids = new Hashids($jwt_key, 6);

        if($user->count == 0) {

            $referer_id = 0;
            $money = 0;
            $bonus = 300;
            if(isset($_SESSION['referer_id'])) {
                try{
                    $r_id = $hashids->decode($_SESSION['referer_id']);
                    if(is_array($r_id) and count($r_id) == 1) {
                        $ref = new Users();
                        $ref->GetItems([
                            'user_id' => (int)$r_id[0],
                            'del' => 0
                        ]);
                        if($ref->count == 1) {
                            $referer_id = $r_id[0];
                            $money = $bonus;
                        }
                    }
                } catch (Exception $e) {}
            }

            $data = [
                'vk_user_id'      => $user_data['id'],
                'name'            => cstr($user_data['first_name']),
                'fename'          => cstr($user_data['last_name']),
                'photo_50'        => cstr($user_data['photo_50']),
                'photo_100'       => cstr($user_data['photo_100']),
                'photo_200'       => cstr(($user_data['photo_200'] ?: $user_data['photo_max'])),
                'photo_max'       => cstr($user_data['photo_max']),
                'date'            => date("Y-m-d H:i:s"),
                'mail'            => '',
                'pone'            => 0,
                'role'            => 0,
                'del'             => 0,
                'money'           => $money,
                'referer_id'      => $referer_id
            ];
            $user->Insert($data);
            if($user->id != 0) {

                if($money != 0){
                    $query = "INSERT INTO `transactions`(`type`, `sum`, `description`, `code`, `user_id`, `date`)
                        VALUES ('+', ".$money.", '".$codes[1]."', 1, ".$user->id.", ".time().")";
                    $sql = $db->prepare($query);
                    $sql->execute();
                    $sql->close();
                }

                $user->Update(['ref_id' => $hashids->encode($user->id)], $user->id);

                $user->user_id = $user->id;
                $query = "INSERT INTO `tokens`(`user_id`, `type`, `value`) VALUES (?, 'vk', ?)";
                $sql = $db->prepare($query);
                $sql->bind_param('is', $user->id, $user_data['access_token']);
                $sql->execute();

                $query = "INSERT INTO `stream_keys`(`user_id`, `value`) VALUES (?, ?)";
                $sql = $db->prepare($query);
                $sql->bind_param('is', $user->id, md5(microtime(true) . $user->id));
                $sql->execute();

                $sql->close();
            }
        } else {
            $user->user_id = $user->items[0]['user_id'];
            $user->Update(
                [
                    'name'            => cstr($user_data['first_name']),
                    'fename'          => cstr($user_data['last_name']),
                    'photo_50'        => cstr($user_data['photo_50']),
                    'photo_100'       => cstr($user_data['photo_100']),
                    'photo_200'       => cstr(($user_data['photo_200'] ?: $user_data['photo_max'])),
                    'photo_max'       => cstr($user_data['photo_max'])
                ],
                $user->items[0]['user_id']
            );

            $query = "UPDATE `users` SET `ref_id` = ? WHERE `user_id` = ? AND (`ref_id` = '' OR `ref_id` IS NULL)";
            $sql = $db->prepare($query);
            $sql->bind_param('si', $hashids->encode($user->user_id), $user->user_id);
            $sql->execute();
            $sql->close();

            $query = "SELECT `value` FROM `tokens` WHERE `type` = 'vk' AND `user_id` = ? ";
            $sql = $db->prepare($query);
            $sql->bind_param('i', $user->items[0]['user_id']);
            $sql->execute();
            $sql->bind_result($token);
            $res = [];
            while($sql->fetch()) $res[] = $token;
            $sql->close();
            $query = false;
            if(count($res) == 1) {
                $query = "UPDATE `tokens` SET `value` = ? WHERE `type` = 'vk' AND `user_id` = ?";
            } else if (count($res) == 0){
                $query = "INSERT INTO `tokens`(`value`, `type`, `user_id`) VALUES (?, 'vk', ?)";
            }
            if($query){
                $sql = $db->prepare($query);
                $sql->bind_param('si', $user_data['access_token'], $user->items[0]['user_id']);
                $sql->execute();
                $sql->close();
            }
            $user_data['update'] = true;
        }

        user_groups($user_data['id'], $user->user_id, $user_data['access_token']);

        unset($_SESSION['user_auth_data']);
        setcookie('token', $jwt, time() + 60 * 60 * 24 * 30, '/');
        header('Location: ' . $host . '/success.html');
        return [];
    }
    else if(isset($_GET['code'])){

        try{
            $response = $oauth->getAccessToken($vk_group_client_id, $vk_group_client_secret, $redirect_uri, $_GET['code']);
            $access_token = $response['access_token'];
            $user_id = $response['user_id'];

            if(isset($response['access_token']) and isset($response['user_id'])){
                $vk = new VKApiClient();
                $response_user_info = $vk->users()->get($access_token, [
                    'user_ids' => [$response['user_id']],
                    'fields' => ['photo_50','photo_max','photo_100','photo_200']
                ]);

                $response_user_info[0]['access_token'] = $access_token;
                $response_user_info[0]['expires_in'] = $response['expires_in'];

                $_SESSION['user_auth_data'] = $response_user_info[0];
                header('Location: ' . filter_var($redirect_uri, FILTER_SANITIZE_URL));
                return [];
            }
            header('Location: ' . filter_var($redirect_uri, FILTER_SANITIZE_URL));
            return [];
        } catch (Exception $e){
            header('Location: ' . $host . '/success.html');
            return [];
        }

    }
    else {
        if(isset($_COOKIE['streamvi'])) {
            $_SESSION['referer_id'] = $_COOKIE['streamvi'];
        }

        $display = VKOAuthDisplay::POPUP;
        $scope = [ VKOAuthUserScope::WALL, VKOAuthUserScope::VIDEO, VKOAuthUserScope::GROUPS, VKOAuthUserScope::OFFLINE ];
        $state = 'secret_state_code';

        $auth_url = $oauth->getAuthorizeUrl(VKOAuthResponseType::CODE, $vk_group_client_id, $redirect_uri, $display, $scope, $state);

        header('Location: ' . filter_var($auth_url, FILTER_SANITIZE_URL));
        return [];
    }
}
?>
