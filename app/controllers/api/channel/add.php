<?php
use VK\Client\VKApiClient;
use \Firebase\JWT\JWT;

function process() {
    header('Content-Type: application/json');
    $data['items'] = false;
    $data['status'] = 'error';

    $user = new Users();

    if(!$user->CheckJWT()) return $data;
    $user_id = $user->user_id;
    $vk_token = $user->vk_token;
    $vk_user_id = $user->vk_user_id;

    if(isset($_REQUEST['type']) and isset($_REQUEST['channelId'])) {
        //if($_REQUEST['type'] == 'vk'){
            if(trim($_REQUEST['channelId']) == ''){
                try{
                    $vk = new VKApiClient();
                    $own_user_groups = $vk->groups()->get(
                        $vk_token,
                        [
                            'user_id' => $vk_user_id,
                            'extended' => 1,
                            'filter' => 'admin'
                        ]
                    );
                    if(isset($own_user_groups['count']) and $own_user_groups['count'] > 0){
                        $return_data['items'] = $own_user_groups['items'];
                        for ($i = 0; $i < $own_user_groups['count']; $i++){
                            $gr = new Groups();
                            $gr->GetItems([
                                'id' => $return_data['items'][$i]['id'],
                                'user_id' => $user_id
                            ]);
                            if($gr->count == 0) {
                                $data = [
                                    'user_id' => $user_id,
                                    'name' => cstr($return_data['items'][$i]['name']),
                                    'id' => $return_data['items'][$i]['id'],
                                    'type' => 'vk',
                                    'photo_50' => cstr($return_data['items'][$i]['photo_50']),
                                    'photo_100' => cstr($return_data['items'][$i]['photo_100']),
                                    'photo_200' => cstr($return_data['items'][$i]['photo_200']),
                                ];
                                $gr->Insert($data, true);
                            } else if($gr->count == 1){
                                $gr->Update(
                                    [
                                        'name' => cstr($return_data['items'][$i]['name']),
                                        'photo_50' => cstr($return_data['items'][$i]['photo_50']),
                                        'photo_100' => cstr($return_data['items'][$i]['photo_100']),
                                        'photo_200' => cstr($return_data['items'][$i]['photo_200']),
                                        'del' => 0,
                                        'sell' => 0
                                    ],
                                    $gr->items[0]['group_id']
                                );
                            }
                        }
                    }
                    return [];
                } catch(Exception $e) {
                    return [];
                }
            } else {
//                $group_id = trim($_REQUEST['channelId']);

                $gr = new Groups();
                $gr->GetItems([
                    'group_id' => (int)trim($_REQUEST['channelId']),
                    //'user_id' => $user_id
                ]);
                if($gr->count == 1){
                    $gr->Update(
                        [ 'del' => 0 ],
                        $gr->items[0]['group_id']
                    );
                } /*else {
                    try{
                        $vk = new VKApiClient();
                        $group = $vk->groups()->getById(
                            $vk_token,
                            [ 'group_id' => $group_id ]
                        );
                        if($group[0]['is_admin'] != 1) return $data;
                        $group_data = $group[0];
                        $gr = new Groups();
                        $gr->GetItems([
                            'id' => $group_data['id'],
                            'user_id' => $user_id
                        ]);
                        if($gr->count == 0) {
                            $data = [
                                'user_id' => $user_id,
                                'name' => cstr($group_data['name']),
                                'id' => $group_data['id'],
                                'type' => 'vk',
                                'photo_50' => cstr($group_data['photo_50']),
                                'photo_100' => cstr($group_data['photo_100']),
                                'photo_200' => cstr($group_data['photo_200'])
                            ];
                            $gr->Insert($data, true);
                        } else if($gr->count == 1){
                            $gr->Update(
                                [
                                    'name' => cstr($group_data['name']),
                                    'photo_50' => cstr($group_data['photo_50']),
                                    'photo_100' => cstr($group_data['photo_100']),
                                    'photo_200' => cstr($group_data['photo_200']),
                                    'sell' => 0,
                                    'del' => 0
                                ],
                                $gr->items[0]['group_id']
                            );
                        }
                        return [];
                    } catch(Exception $e) {
                        return [$e->getMessage()];
                    }
                }*/
            }
        //}
    }
}
