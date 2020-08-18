<?php

use \Firebase\JWT\JWT;

function process() {

    session_start();

    $mime_to_ext = [
        'video/mp4' => '.mp4',
        'video/mpeg' => '.mpeg',
        'video/ogg' => '.ogv',
        'video/vnd.dlna.mpeg-tts' => '.ts',
        'video/webm' => '.webm',
        'video/3gpp' => '.3gp',
        'video/3gpp2' => '.3g2'
    ];

    header('Content-Type: application/json');
    $user_id = false;
    $data['items'] = [];
    $data['status'] = 'error';

    $user = new Users();
    if($user->CheckJWT()) {
        $user_id = $user->user_id;

        $videos = new Videos();

        if(isset($_REQUEST['action']) and $_REQUEST['action'] == 'upload'){
            if(isset($_FILES) and $_FILES['video']['error'] == 0){
                if(isset($_REQUEST['display_name']) and trim($_REQUEST['display_name']) != '') {
                    $display_name = $_REQUEST['display_name'];
                } else {
                    $display_name = preg_replace('/\.\w+$/i' ,'', $_FILES['video']['name']);
                }
                if(isset($_FILES['video']['tmp_name']) and isset($_FILES['video']['type'])){
                    $file_name = md5($_FILES['video']['tmp_name'] . microtime(true)) . $mime_to_ext[$_FILES['video']['type']];
                    $upload_video_dir = __DIR__ . '/../../../public/upload/videos/';
                    $upload_thumbnail_dir = __DIR__ . '/../../../public/upload/thumbnails/';
                    move_uploaded_file($_FILES['video']['tmp_name'], $upload_video_dir . $file_name);
                    $videos->Insert([
                        'name' => cstr($display_name),
                        'file' => $file_name,
                        'user' => $user_id
                    ], true);
                }
            }
        }
        else if(isset($_REQUEST['id']) and isset($_REQUEST['action']) and $_REQUEST['action'] == 'delete'){
            $videos->Delete($_REQUEST['id']);
        }
        else if(isset($_REQUEST['action'])
                and $_REQUEST['action'] == 'update'
                and isset($_REQUEST['id'])
                and isset($_REQUEST['display_name'])
                and isset($_REQUEST['album'])) {
            $videos->id2 = $user_id;
            $videos->id_name2 = 'user';
            $videos->Update(
                [
                    'name' => cstr($_REQUEST['display_name']),
                    'album' => cstr($_REQUEST['album'])
                ],
                $_REQUEST['id']
            );
        }
        else if(isset($_REQUEST['action']) and $_REQUEST['action'] == 'video2stream'){
            if(isset($_REQUEST['videos']) and isset($_REQUEST['streams'])) {
                $video_ids = explode(',', $_REQUEST['videos']);
                $stream_ids = explode(',', $_REQUEST['streams']);
                $stream = new Streams();
                $v2s = new V2s();
                for($i = 0; $i < count($stream_ids); $i++){
                    $stream->GetItems([
                        'id' => $stream_ids[$i],
                        'buyer' => $user_id,
                        //['start', '>=', time()]
                    ]);
                    if($stream->count == 1) {
                        for($j = 0; $j < count($video_ids); $j++){
                            $v2s->GetItems([
                                'video_id' => $video_ids[$j],
                                'stream_id' => $stream_ids[$i]
                            ]);
                            if($v2s->count == 0) {
                                $v2s->Insert([
                                    'video_id' => $video_ids[$j],
                                    'stream_id' => $stream_ids[$i]
                                ]);
                            }
                        }
                    }
                }
            }
        }
        
        $videos->GetItems( ['user' => $user_id ]);
        if($videos->count > 0) {
            $data['items'] = $videos->items2id;
            $data['status'] = 'ok';
        } else $data['message'] = 'No videos available';
    }
    return $data;
}
