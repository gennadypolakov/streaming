<?php

use \Firebase\JWT\JWT;

function process() {
    global $db;
    header('Content-Type: application/json');
    $user_id = false;
    $data['items'] = false;
    $data['status'] = 'error';

    $user = new Users();

    if($user->CheckJWT()) {
        $user_id = $user->user_id;
        if(isset($_REQUEST['action']) and $_REQUEST['action'] == 'search'){

            $like = (isset($_REQUEST['name']) and $_REQUEST['name'] != '') ? 'AND `g`.`name` LIKE "%' . $_REQUEST['name'] . '%"' : '';
            $query = "SELECT
                `g`.`group_id` AS `group_id`,
                `g`.`name` AS `name`,
                `g`.`id` AS `id`,
                `g`.`price` AS `price`,
                `g`.`type` AS `type`,
                `g`.`photo_50` AS `photo_50`,
                `g`.`photo_default` AS `photo_default`
                FROM `groups` AS `g`
                JOIN `user_group` AS `ug` ON `ug`.`group_id` = `g`.`group_id`
                WHERE `g`.`sell` = 1
                    AND `g`.`del` = 0
                    AND `ug`.`user_id` = `ug`.`owner_id`
                    AND `ug`.`user_id` <> ? "
                    . $like;
                    // echo $query;
            $groups = $db->prepare($query);
            $groups->bind_param('i', $user_id);
            $groups->execute();
            $result = $groups->get_result();
            $group_ids = [];
            while($row = $result->fetch_assoc()) $group_ids[$row['group_id']] = $row;
            $groups->close();

            // $where = [
            //     [ 'user_id', '<>', $user_id ],
            //     'sell' => 1,
            //     'del' => 0
            // ];
            // if(isset($_REQUEST['name'])) $where[] = [ 'name','LIKE', '%' . $_REQUEST['name'] . '%' ];

            // $groups = new Groups();
            // $groups->GetItems($where);
            // if($groups->count > 0) {
            //     $gr = $groups->items2id;

            if(count($group_ids) > 0) {
                $gr = $group_ids;
                foreach($gr as $id => $item){
                    unset(
                        $gr[$id]['token'],
                        $gr[$id]['youtube_token'],
                        $gr[$id]['sell'],
                        $gr[$id]['del']
                    );
                    $streams = new Streams();
                    $st_where = [
                        'group_id' => $id,
                        ['start', '>=', time()]
                    ];
                    if(isset($_REQUEST['time_start']) and isset($_REQUEST['time_end'])) {
                        $st_where[] = [
                            ['start', '>=', $_REQUEST['time_start']],
                            ['end', '<=', $_REQUEST['time_end']]
                        ];
                    }
                    $streams->GetItems($st_where);
                    if($streams->count > 0) {
                        $st = $streams->items;
                        for($i = 0; $i < $streams->count; $i++){
                            $gr[$id]['time'][] =
                            [
                                'id' => $st[$i]['id'],
                                'start' => $st[$i]['start'],
                                'end' => $st[$i]['end']
                            ];
                        }
                    }
                }
                $data['status'] = 'ok';
                $data['items'] = $gr;
            } else {
                $data['message'] = 'No channels available';
                return $data;
            }
        }
        else if(isset($_REQUEST['action']) and $_REQUEST['action'] == 'buy'){
            if(!isset($_REQUEST['group_id']) or !isset($_REQUEST['time_start']) or !isset($_REQUEST['time_end'])){
                $data['message'] = 'invalid data';
                return $data;
            }
            // if((int)$_REQUEST['time_start'] < time() or (int)$_REQUEST['time_start'] > (int)$_REQUEST['time_end']){
            //     $data['message'] = 'incorrect time';
            //     return $data;
            // }
            $group_id = (int) $_REQUEST['group_id'];
            $groups = new Groups();
            $groups->GetItems([
                'group_id' => $group_id,
                'sell' => 1
            ]);
            if($groups->count == 1) {
                $price = $groups->items[0]['price'];
                $seller = $groups->items[0]['user_id'];
                $type = $groups->items[0]['type'];
                $streams = new Streams();
                $streams->GetItems([
                    'group_id' => $group_id,
                    [ 'start', '<=', $_REQUEST['time_start'] ],
                    [ 'end', '>=', $_REQUEST['time_start'] ]
                ]);
                $start = $streams->count;
                $streams->GetItems([
                    'group_id' => $group_id,
                    ['start', '<=', $_REQUEST['time_end']],
                    ['end', '>=', $_REQUEST['time_end']]
                ]);
                $end = $streams->count;
                if($start == 0 and $end == 0){
                    $insert_result = $streams->Insert([
                        'seller' => $seller,
                        'buyer' => $user_id,
                        'group_id' => $group_id,
                        'start' => $_REQUEST['time_start'],
                        'end' => $_REQUEST['time_end'],
                        'price' => $price
                    ], true);

                    if($type == 'youtube' and $insert_result['status'] == 'ok'){
                        $query = "SELECT `value` FROM `tokens` WHERE `type` = 'youtube' AND `user_id` = ? ";
                        $sql = $db->prepare($query);
                        $sql->bind_param('i', $seller);
                        $sql->execute();
                        $sql->bind_result($token);
                        $res = [];
                        while($sql->fetch()) $res[] = $token;
                        $sql->close();
                        if(count($res) == 1) {
                            $token = json_decode($res[0], true);

                            include AppDir.'/../vendor/autoload.php';
                            $client = new Google_Client();
                            $client->setAuthConfig(AppDir.'/client_secret_584173880942-7cfln6g0kf43gv0n4lkj71hsmcrt65ma.apps.googleusercontent.com.json');
                            $client->addScope("https://www.googleapis.com/auth/youtube.force-ssl");
                            $client->setAccessType('offline');
                            $client->setApprovalPrompt('force');
                            // $client->setRedirectUri('http://' . $_SERVER['HTTP_HOST'] . '/api/googleoauth');
                            $client->setAccessToken($token);

                            if ($client->isAccessTokenExpired()) {
                                $client->refreshToken($client->getRefreshToken());
                                $token = $client->getAccessToken();

                                $query = "UPDATE `tokens` SET `value` = ? WHERE `type` = 'youtube' AND `user_id` = ? ";
                                $sql = $db->prepare($query);
                                $sql->bind_param('si', json_encode($token), $seller);
                                $sql->execute();
                            }

                            $ts = $_REQUEST['time_start'];
                            $dt = new DateTime("@$ts");
                            $utc = new DateTimeZone("UTC");
                            $dt->setTimezone($utc);

                            $te = $_REQUEST['time_end'];
                            $dt_e = new DateTime("@$te");
                            $utc_e = new DateTimeZone("UTC");
                            $dt_e->setTimezone($utc_e);


                            // Check to ensure that the access token was successfully acquired.
                            if ($client->getAccessToken()) {
                                try {
                                    $youtube = new Google_Service_YouTube($client);

                                    // Create an object for the liveBroadcast resource's snippet. Specify values
                                    // for the snippet's title, scheduled start time, and scheduled end time.
                                    
                                    $broadcastSnippet = new Google_Service_YouTube_LiveBroadcastSnippet();
                                    $broadcastSnippet->setTitle('New Broadcast from Streamvi');
                                    $broadcastSnippet->setScheduledStartTime($dt->format('c'));
                                    $broadcastSnippet->setScheduledEndTime($dt_e->format('c'));

                                    $broadcastContentDetails = new Google_Service_YouTube_LiveBroadcastContentDetails();
                                    $broadcastContentDetails->setEnableAutoStart(true);
                                    // Create an object for the liveBroadcast resource's status, and set the
                                    // broadcast's status to "private".
                                    $status = new Google_Service_YouTube_LiveBroadcastStatus();
                                    $status->setPrivacyStatus('public');

                                    // Create the API request that inserts the liveBroadcast resource.
                                    $broadcastInsert = new Google_Service_YouTube_LiveBroadcast();
                                    $broadcastInsert->setSnippet($broadcastSnippet);
                                    $broadcastInsert->setStatus($status);
                                    $broadcastInsert->setKind('youtube#liveBroadcast');
                                    $broadcastInsert->setContentDetails($broadcastContentDetails);

                                    // Execute the request and return an object that contains information
                                    // about the new broadcast.
                                    $broadcastsResponse = $youtube->liveBroadcasts->insert('snippet,status,contentDetails',
                                        $broadcastInsert, array());

                                    // Create an object for the liveStream resource's snippet. Specify a value
                                    // for the snippet's title.
                                    $streamSnippet = new Google_Service_YouTube_LiveStreamSnippet();
                                    $streamSnippet->setTitle('New Stream from Streamvi');

                                    // Create an object for content distribution network details for the live
                                    // stream and specify the stream's format and ingestion type.
                                    $cdn = new Google_Service_YouTube_CdnSettings();
                                    $cdn->setFormat("1080p");
                                    $cdn->setIngestionType('rtmp');

                                    // Create the API request that inserts the liveStream resource.
                                    $streamInsert = new Google_Service_YouTube_LiveStream();
                                    $streamInsert->setSnippet($streamSnippet);
                                    $streamInsert->setCdn($cdn);
                                    $streamInsert->setKind('youtube#liveStream');

                                    // Execute the request and return an object that contains information
                                    // about the new stream.
                                    $streamsResponse = $youtube->liveStreams->insert(
                                        'snippet,cdn',
                                        $streamInsert,
                                        array()
                                    );

                                    // Bind the broadcast to the live stream.
                                    $bindBroadcastResponse = $youtube->liveBroadcasts->bind(
                                        $broadcastsResponse['id'],
                                        'id,contentDetails',
                                        [ 'streamId' => $streamsResponse['id'] ]
                                    );
                                    //file_put_contents('market.txt', json_encode([$broadcastsResponse, $streamsResponse], JSON_PRETTY_PRINT));



                                    if(isset($streamsResponse['cdn']['ingestionInfo']['ingestionAddress']) &&
                                    isset($streamsResponse['cdn']['ingestionInfo']['streamName'])){
                                        
                                        $urlParts = parse_url($streamsResponse['cdn']['ingestionInfo']['ingestionAddress']);

                                        $rtpm = [
                                            "name" => $streamsResponse['cdn']['ingestionInfo']['streamName'],
                                            "domain" => isset($urlParts['host']) ? $urlParts['host'] : 'a.rtmp.youtube.com'
                                        ];
                                        if(isset($urlParts['port'])) $rtpm['port'] = $urlParts['port'];
                                        if(isset($urlParts['path'])) $rtpm['query'] = $urlParts['path'];
                                        
                                        $stream = new \m\Channels();
                                        $stream->table_name = 'rtmp';

                                        $res = $stream->Insert([
                                            'group_id' => $group_id,
                                            'stream_id' => $insert_result['id'],
                                            'value' => json_encode($rtpm)
                                        ], true);

                                    }


                                } catch (Google_Service_Exception $e) {
                                        //file_put_contents('broadcastsResponse_error.json', json_encode($e->getMessage()));
                                } catch (Google_Exception $e) {
                                        //file_put_contents('broadcastsResponse_error.json', json_encode($e->getMessage()));
                                }
                            }

                        }
                    }

                    if($insert_result['status'] == 'ok') $data['status'] = 'ok';
                } else {
                    $data['message'] = 'Выбранное время недоступно ☹';
                }
            }
        }
        else if(isset($_REQUEST['group_id']) and isset($_REQUEST['date'])){
            $streams = new Streams();
            $streams->GetItems([
                'group_id' => $_REQUEST['group_id'],
                'date' => $_REQUEST['date'],
                //['user_id', '<>', $user_data['vk']['id']]
            ]);
            if($streams->count > 0) {
                $data['items'] = $streams->items2id;
                for($i = 0; $i < $streams->count; $i++){
                    $data['items'][$key]['time'][$i][$streams->items[$i]['date']][] =
                    [
                        'id' => $streams->items[$i]['id'],
                        'start' => $streams->items[$i]['start'],
                        'end' => $streams->items[$i]['end']
                    ];
                }
                $data['status'] = 'ok';
            }
        }
        else{
            $streams = new Streams();
            $streams->GetItems([
                'buyer' => $user_id,
                ['end', '>=', time()]//date('Y-m-d')]
            ]);
            if($streams->count > 0) {
                $groups = new Groups();
                $data['purchased'] = [];
                $data['purchased_index'] = [];
                for($i = 0; $i < $streams->count; $i++){

                    $v2s = new V2s();
                    $v2s->GetItems([
                        'stream_id' => $streams->items[$i]['id']
                    ]);
                    $videos = [];
                    if($v2s->count > 0) {
                        for($j = 0; $j < $v2s->count; $j++){
                            $video = new Videos();
                            $video->GetItems([
                                'id' => $v2s->items[$j]['video_id']
                            ]);
                            if($video->count == 1) {
                                $videos[] = [
                                    'id' => $video->items[0]['id'],
                                    'name' => $video->items[0]['name']
                                ];
                            }
                        }
                    }

                    $group_id = $streams->items[$i]['group_id'];
                    $groups->GetItems([
                        'group_id' => $group_id,
                        'sell' => 1
                    ]);
                    if($groups->count == 1){
                        if(!isset($data['purchased'][$group_id])) $data['purchased'] += $groups->items2id;
                        if(!in_array($group_id, $data['purchased_index'])) $data['purchased_index'][] = (int)$group_id;
                        if(count($videos) > 0) {
                            $data['purchased'][$group_id]['time'][] = 
                                [
                                    'id' => $streams->items[$i]['id'],
                                    'start' => $streams->items[$i]['start'],
                                    'end' => $streams->items[$i]['end'],
                                    'video' => $videos
                                ];
                        } else {
                            $data['purchased'][$group_id]['time'][] = 
                                [
                                    'id' => $streams->items[$i]['id'],
                                    'start' => $streams->items[$i]['start'],
                                    'end' => $streams->items[$i]['end']
                                ];
                        }

                    }
                }
            $data['status'] = 'ok';
            }
        }
    }


    return $data;
}
