<?php

use \Firebase\JWT\JWT;

function process() {
    header('Content-Type: application/json');
    $user_id = false;
    $data['items'] = [];
    $data['status'] = 'error';

    $user = new Users();
    if($user->CheckJWT()) {
        $user_id = $user->user_id;
        $albums = new Albums();

        if(isset($_REQUEST['name'])){
            if(isset($_REQUEST['id'])){
                $albums->Update(
                    [
                        'name' => cstr($_REQUEST['name'])
                    ],
                    $_REQUEST['id']
                );
            } else {
                $albums->Insert([
                    'name' => cstr($_REQUEST['name']),
                    'user' => $user_id
                ], true);
            }
        } else if(isset($_REQUEST['action']) and $_REQUEST['action'] == 'delete' and isset($_REQUEST['id'])){
            $videos = new Videos();
            $videos->id_name = 'album';
            $videos->id2 = $user_id;
            $videos->id_name2 = 'user';
            $videos->Update(
                [
                    'album' => 0
                ],
                $_REQUEST['id']
            );
            $albums->Delete($_REQUEST['id']);
        }

        $albums->GetItems([ 'user' => $user_id ]);
        if($albums->count > 0) {
            $items = $albums->items2id;
            foreach($items as $id => $item){
                $videos = new Videos();
                $videos->GetItems([
                    'user' => $user_id,
                    'album' => $id
                    ]);
                $items[$id]['countVideo'] = $videos->count;
            }
            $data['items'] = $items;
            $data['status'] = 'ok';
        } else $data['message'] = 'No albums available';
    }
    return $data;
}
