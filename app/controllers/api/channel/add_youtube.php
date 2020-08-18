<?php
use VK\Client\VKApiClient;
use \Firebase\JWT\JWT;

function getUserByVkId($user_vk_id){
    $user = new Users();
    $user->GetItems([ 'vk_user_id' => $user_vk_id ]);
    if ($user->count>0){
        $data = $user->GetOne([ 'vk_user_id' => $user_vk_id ]);
        $user_data = [
            'id' => $data['result']['user_id'],
            'user_id' => $data['result']['vk_user_id'],
            'access_token' => $data['result']['access_token_vk'],
            'first_name' => $data['result']['name'],
            'last_name' => $data['result']['fename'],
            'photo' => $data['result']['photo_50'],
        ];
        return $user_data;
    } else return false;
}


function process() {
    header('Content-Type: application/json');
    $headers = apache_request_headers();
    $user_data = false;
    

    if(isset($_SERVER['REQUEST_METHOD']) and $_SERVER['REQUEST_METHOD'] == 'POST'){

        if(key_exists('type', $_POST) and key_exists('url', $_POST)) {
            
            $user_data['type'] = $_POST['type'];
            $user_data['url'] = $_POST['url'];
            
            if(isset($headers['Authorization'])){
                
                $header_jwt = str_replace('Bearer ', '', $headers['Authorization']);
                try{
                    $jwt_key = "v7szbc6prvbbp52hpfqrof6xnqye5o";
                    $decoded = JWT::decode($header_jwt, $jwt_key, array('HS256'));
                    if(isset($decoded->user_id) and isset($decoded->exp) and $decoded->exp > time()){
                        $user_data['vk'] = getUserByVkId($decoded->user_id);
                    } else {
                        return ["error" => "expired token"];
                    }
                } catch(Exception $e) {
                    return ["error" => 'Некорректный токен'];
                }
            }
            if(key_exists('vk_id', $_POST)) {
                $user_data['vk'] = getUserByVkId($_POST['vk_id']);
            }
        }
    }
    if($user_data and $user_data['type'] == 'vk'){
        if(trim($user_data['url']) == ''){
            try{
                $vk = new VKApiClient();
                $own_user_groups = $vk->groups()->get(
                    $user_data['vk']['access_token'],
                    [ 
                        'user_id' => $user_data['vk']['user_id'],
                        'extended' => 1,
                        'filter' => 'admin',
                        'fields' => 'id,name,photo_50,photo_100,photo_200'
                    ]
                );
                $return_data['user'] = $user_data['vk'];
                if(isset($own_user_groups['count']) and $own_user_groups['count'] > 0){
                    $return_data['items'] = $own_user_groups['items'];
                    for ($i = 0; $i < $own_user_groups['count']; $i++){
                        $gr = new Groups();
                        $gr->GetItems([
                            'id' => $return_data['items'][$i]['id'],
                            'user_id' => $user_data['vk']['id']
                        ]);
                        if($gr->count == 0) {
                            $data = [
                                'user_id' => $user_data['vk']['id'],
                                'name' => cstr($return_data['items'][$i]['name']),
                                'id' => $return_data['items'][$i]['id'],
                                'token' => '',
                                'type' => 'vk',
                                'photo_50' => cstr($return_data['items'][$i]['photo_50']),
                                'photo_100' => cstr($return_data['items'][$i]['photo_100']),
                                'photo_200' => cstr($return_data['items'][$i]['photo_200']),
                                'photo_default' => '',
                                'photo_medium' => '',
                                'photo_high' => '',
                                'del' => 0
                            ];
                            $gr->Insert($data, true);
                            $return_data['data_to_db'][] = $data;
                        }  else $return_data['items'] = false;
                    }
                }
                return ['data' => $return_data];
            } catch(Exception $e) {
                return ['data' => $e->getMessage()];
            }
        } else {
            $group_url_arr = explode('/',$user_data['url']);
            $count_part = count($group_url_arr);
            $group_id = trim($group_url_arr[$count_part-1]);

            try{
                $vk = new VKApiClient();
                $group = $vk->groups()->getById(
                    $user_data['vk']['access_token'],
                    [ 
                        'group_id' => $group_id,
                        'fields' => 'id,name,photo_50,photo_100,photo_200'
                    ]
                );
                $return_data['items'] = isset($group[0]) ? $group : false;

                $gr = new Groups();
                $gr->GetItems([
                    'id' => $return_data['items'][0]['id'],
                    'user_id' => $user_data['vk']['id']
                ]);
                if($gr->count == 0) {
                    $data = [
                        'user_id' => $user_data['vk']['id'],
                        'name' => cstr($return_data['items'][0]['name']),
                        'id' => $return_data['items'][0]['id'],
                        'token' => '',
                        'type' => 'vk',
                        'photo_50' => cstr($return_data['items'][0]['photo_50']),
                        'photo_100' => cstr($return_data['items'][0]['photo_100']),
                        'photo_200' => cstr($return_data['items'][0]['photo_200']),
                        'photo_default' => '',
                        'photo_medium' => '',
                        'photo_high' => '',
                        'del' => 0
                    ];
                    $gr->Insert($data, true);
                } else $return_data['items'] = false;

                $return_data['user'] = $return_data['items'] ? $user_data['vk'] : false;
                return ['data' => $return_data];
            } catch(Exception $e) {
                return ['data' => $e->getMessage()];
            }
        }
    }
    $return_data['items'] = false;
    return ['data' => $return_data];

}
