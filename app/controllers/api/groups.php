<?php
use VK\Client\VKApiClient;

function getUsers($user_id, $group_id) {
  global $db;
  $query = "SELECT
        `u`.`user_id` AS `user_id`,
        `u`.`name` AS `name`,
        `u`.`fename` AS `surname`,
        `u`.`photo_50` AS `photo`,
        `ug`.`start` AS `time_start`,
        `ug`.`end` AS `time_end`
        FROM `user_group` AS `ug`
        JOIN `users` AS `u` ON `u`.`user_id` = `ug`.`user_id`
        WHERE `ug`.`user_id` <> ?
            AND `ug`.`owner_id` = ?
            AND `ug`.`group_id` = ?";
  $sql = $db->prepare($query);

  $sql->bind_param('iii', $user_id, $user_id, $group_id);
  $sql->execute();
  $result = $sql->get_result();
  $users = [];
  while($row = $result->fetch_assoc()) $users[] = $row;
  $sql->close();
  return $users;
}


function process() {
  global $db, $default_youtube_video_title;

  $mime_to_ext = [
    'image/jpeg' => '.jpg',
    'image/png' => '.png'
  ];

  header('Content-Type: application/json');

  $data['items'] = [];
  $data['status'] = 'error';

  $req = new Request();

//  $request = json_decode(file_get_contents('php://input'),true) ?: [];
  $request = $req->params;

  $user = new Users();
  $user->token = $request['token'] ?: false;
  if($user->CheckJWT()) {
    $user_id = $user->user_id;

    if(isset($request['action'], $request['rtmp']) and $request['action'] === 'add_rtmp') {

      $channel_type = $request['type'] ?: 'custom';

      if(isset($request['name'])) $name = $request['name'];
      else {
        if(isset($request['type'])) {
          if($request['type'] === 'ok') {$name = 'Одноклассники';}
          if($request['type'] === 'custom') {$name = 'Свой rtmp-сервер';}
        }
      }

      $insert_rtmp_data = [
        'user_id' => $user_id,
        'name' => cstr($name),
        'id' => cstr($channel_type),
        'type' => cstr($channel_type),
        'del' => 0
      ];

      $group = new Groups();
      $group->Insert($insert_rtmp_data);
      if($group->id != 0){
        $id = $group->id;
        $data['addedChannelId'] = $group->id;
        $group->table_name = 'user_group';
        $group->Insert([
          'user_id' => $user_id,
          'group_id' => $id,
          'owner_id' => $user_id
        ]);

        $group->table_name = 'rtmp';

        $group->Insert([
          'group_id' => $id,
          'value' => json_encode($request['rtmp'])
        ]);
        // if($res['status'] == 'ok') $rtmp_status = true;
      }

    }

    if(isset($request['group_id'], $request['broadcast'])) {

      $query = "SELECT `value` FROM `rtmp` WHERE `group_id` = ?";
      $stmt = $db->prepare($query);
      $stmt->bind_param('i', $request['group_id']);
      $stmt->execute();
      $stmt->bind_result($value);
      $rtmp = [];
      while($stmt->fetch()) $rtmp[] = $value;
      $stmt->close();
      if(count($rtmp) == 1) $rtmp = json_decode($rtmp[0], true);
      else $rtmp = false;
      $need_new_rtmp = false;

      $query = "SELECT
                `t`.`id` AS `id`,
                `t`.`type` AS `type`,
                `t`.`value` AS `token`
                FROM `tokens` AS `t`
                JOIN `user_group` AS `ug` ON `ug`.`owner_id` = `t`.`user_id`
                JOIN `groups` AS `g` ON `g`.`group_id` = `ug`.`group_id`
                WHERE `t`.`type` = `g`.`type`
                    AND `ug`.`user_id` = `ug`.`owner_id`
                    AND `g`.`group_id` = ?";
      $stmt = $db->prepare($query);
      $stmt->bind_param('i', $request['group_id']);
      $stmt->execute();
      $stmt->bind_result($id, $type, $token);
      $tokens = [];
      while($stmt->fetch()) $tokens[] = ['id' => $id, 'type' => $type, 'token' => $token];
      $stmt->close();

      if(count($tokens) == 1) {
        if($tokens[0]['type'] == 'vk' and !$rtmp) {
          $data['message'] = 'Владелец канала не настроил подключение ☹';
        } else if($tokens[0]['type'] == 'youtube' and $request['broadcast'] == 1) {
          $token = json_decode($tokens[0]['token'], true);

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

            $query = "UPDATE `tokens` SET `value` = ? WHERE `id` = ? ";
            $sql = $db->prepare($query);
            $sql->bind_param('si', json_encode($token), $tokens[0]['id']);
            $sql->execute();
          }

          $ts = time();
          $dt = new DateTime("@$ts");
          $utc = new DateTimeZone("UTC");
          $dt->setTimezone($utc);

          // $te = $_REQUEST['time_end'];
          // $dt_e = new DateTime("@$te");
          // $utc_e = new DateTimeZone("UTC");
          // $dt_e->setTimezone($utc_e);


          // Check to ensure that the access token was successfully acquired.
          if ($client->getAccessToken()) {
            try {
              $youtube = new Google_Service_YouTube($client);

              if($rtmp and isset($rtmp['stream_id'], $rtmp['broadcast_id'])) {
                $listLiveBroadcasts = $youtube->liveBroadcasts->listLiveBroadcasts(
                  'status',
                  [ 'id' => $rtmp['broadcast_id'] ]
                );

                $listLiveStreams = $youtube->liveStreams->listLiveStreams(
                  'status',
                  [ 'id' => $rtmp['stream_id'] ]
                );

                if(!(
                  isset($listLiveBroadcasts['items'], $listLiveStreams['items']) and
                  count($listLiveBroadcasts['items']) == 1 and
                  count($listLiveStreams['items']) == 1 and
                  isset(
                    $listLiveBroadcasts['items'][0]['status']['lifeCycleStatus'],
                    $listLiveStreams['items'][0]['status']['streamStatus']
                  ) and
                  $listLiveBroadcasts['items'][0]['status']['lifeCycleStatus'] == 'ready' and
                  $listLiveStreams['items'][0]['status']['streamStatus'] == 'ready'
                )) $need_new_rtmp = true;

                // file_put_contents(
                //     'listLiveStreams.json',
                //     json_encode([$listLiveBroadcasts, $listLiveStreams], JSON_PRETTY_PRINT),
                //     FILE_APPEND
                // );
              } else $need_new_rtmp = true;


              if($need_new_rtmp) {

                $query = "SELECT `title` FROM `user_group` WHERE `user_id` = ? AND `group_id` = ?";
                $stmt = $db->prepare($query);
                $stmt->bind_param('ii', $user_id, $request['group_id']);
                $stmt->execute();
                $stmt->bind_result($title);
                $titles = [];
                while($stmt->fetch()) $titles[] = $title;
                $stmt->close();

                $video_title = 'Трансляция Streamvi';
                if(count($titles) === 1 and $titles[0] !== null){
                  $default_youtube_video_title = $titles[0];
                }

                // Create an object for the liveBroadcast resource's snippet. Specify values
                // for the snippet's title, scheduled start time, and scheduled end time.

                $broadcastSnippet = new Google_Service_YouTube_LiveBroadcastSnippet();
                $broadcastSnippet->setTitle($default_youtube_video_title);
                $broadcastSnippet->setScheduledStartTime($dt->format('c'));

//                $thumbnailDetails = new Google_Service_YouTube_ThumbnailDetails();
//
//                $thumbnail = new Google_Service_YouTube_Thumbnail();
//                $thumbnail->setUrl("https://streamvi.ru/upload/thumbnails/120x90.png");
//                $thumbnail->setHeight(90);
//                $thumbnail->setWidth(120);
//                $thumbnailDetails->setDefault($thumbnail);
//                $thumbnail = new Google_Service_YouTube_Thumbnail();
//                $thumbnail->setUrl("https://streamvi.ru/upload/thumbnails/320x180.png");
//                $thumbnail->setHeight(180);
//                $thumbnail->setWidth(320);
//                $thumbnailDetails->setMedium($thumbnail);
//                $thumbnail = new Google_Service_YouTube_Thumbnail();
//                $thumbnail->setUrl("https://streamvi.ru/upload/thumbnails/480x360.png");
//                $thumbnail->setHeight(360);
//                $thumbnail->setWidth(480);
//                $thumbnailDetails->setHigh($thumbnail);
////                $thumbnailDetails->setStandard($thumbnail);
////                $thumbnailDetails->setMaxres($thumbnail);
//
//                file_put_contents(
//                  'youtube.json',
//                  "\n" . json_encode($thumbnailDetails, JSON_PRETTY_PRINT) . "\n",
//                  FILE_APPEND
//                );
//
//
//                $broadcastSnippet->setThumbnails($thumbnailDetails);

                // $broadcastSnippet->setScheduledEndTime($dt_e->format('c'));

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
                $broadcastsResponse = $youtube->liveBroadcasts->insert(
                  'snippet,status,contentDetails',
                  $broadcastInsert,
                  []
                );

//                file_put_contents(
//                  'youtube.json',
//                  "\n" . json_encode($broadcastsResponse, JSON_PRETTY_PRINT) . "\n",
//                  FILE_APPEND
//                );

                // Create an object for the liveStream resource's snippet. Specify a value
                // for the snippet's title.
                $streamSnippet = new Google_Service_YouTube_LiveStreamSnippet();
                $streamSnippet->setTitle('New stream by Streamvi');

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



                if(isset(
                  $broadcastsResponse['id'],
                  $streamsResponse['id'],
                  $streamsResponse['cdn']['ingestionInfo']['ingestionAddress'],
                  $streamsResponse['cdn']['ingestionInfo']['streamName']
                )
                ) {

                  $urlParts = parse_url($streamsResponse['cdn']['ingestionInfo']['ingestionAddress']);

                  $rtpm = [
                    'name' => $streamsResponse['cdn']['ingestionInfo']['streamName'],
                    'domain' => isset($urlParts['host']) ? $urlParts['host'] : 'a.rtmp.youtube.com',
                    'stream_id' => $streamsResponse['id'],
                    'broadcast_id' => $broadcastsResponse['id']
                  ];
                  if(isset($urlParts['port'])) $rtpm['port'] = $urlParts['port'];
                  if(isset($urlParts['path'])) $rtpm['query'] = $urlParts['path'];

                  $stream = new \m\Channels();
                  $stream->table_name = 'rtmp';

                  $res = $stream->Insert([
                    'group_id' => $request['group_id'],
                    'value' => json_encode($rtpm)
                  ]);
                  if($res['status'] == 'ok') $rtmp_status = true;
                }
              }
            } catch (Google_Service_Exception $e) {
//               return [$e->getMessage()];
              //  file_put_contents(
              //      'youtube_error.json',
              //      "\n" . json_encode($e->getMessage(), JSON_PRETTY_PRINT) . "\n",
              //      FILE_APPEND
              //  );
            } catch (Google_Exception $e) {
              //  file_put_contents(
              //      'youtube_error.json',
              //      "\n" . json_encode($e->getMessage(), JSON_PRETTY_PRINT) . "\n",
              //      FILE_APPEND
              //  );
            }
          }
        }
      }
      // }

      $query = 'UPDATE `user_group`
            SET `active` = ?
            WHERE `user_id` = ? AND `group_id` = ? ';
      $sql = $db->prepare($query);
      $sql->bind_param('sii', $request['broadcast'], $user_id, $request['group_id']);
      if($sql->execute()) $data['status'] = 'ok';
      $sql->close();

      // if($rtmp){
      //     $query = 'UPDATE `user_group`
      //     SET `active` = ?
      //     WHERE `user_id` = ? AND `group_id` = ? ';
      //     $sql = $db->prepare($query);
      //     $sql->bind_param('sii', $request['broadcast'], $user_id, $request['group_id']);
      //     if($sql->execute()) $data['status'] = 'ok';
      //     $sql->close();
      // } else $data['status'] = 'ok';
    }
    else if(isset($request['action']) and $request['action'] == 'update') {
      if(isset($request['group_id'])){
        if(isset($request['price'], $request['sell'])){

          $query = "SELECT
                    `ug`.`id` AS `id`
                    FROM `groups` AS `g`
                    JOIN `user_group` AS `ug` ON `ug`.`group_id` = `g`.`group_id`
                    WHERE `ug`.`owner_id` = `ug`.`user_id`
                        AND `g`.`del` = 0
                        AND `g`.`group_id` = ?
                        AND `ug`.`owner_id` = ?";
          $groups = $db->prepare($query);
          $groups->bind_param('ii', $request['group_id'], $user_id);
          $groups->execute();
          $result = $groups->get_result();
          $group_ids = [];
          while($row = $result->fetch_assoc()) $group_ids[] = $row['id'];
          $groups->close();

          if(count($group_ids) ==1){

            if(isset($request['rtmp'])){
              $rtmp = new \m\Channels();
              $rtmp->table_name = 'rtmp';

              $rtmp->GetItems(
                [ 'group_id' => $request['group_id'] ],
                [ 'order' => '`id` ASC' ]
              );

              if($rtmp->count == 0) {
                $res = $rtmp->Insert([
                  'group_id' => (int) $request['group_id'],
                  'value' => cstr($request['rtmp'])
                ], true);
              } else if($rtmp->count == 1){
                $query = 'UPDATE `rtmp` SET `value` = ? WHERE `group_id` = ?';
                $sql = $db->prepare($query);
                $sql->bind_param('si', $request['rtmp'], $request['group_id']);
                $sql->execute();
                $sql->close();
              }
            }

            $groups = new Groups();
            if(isset($request['name']) and $request['name'] !== ''){
              return $groups->Update(
                [
                  'name' => cstr($request['name']),
                  'price' => cstr($request['price']),
                  'sell' => (int)$request['sell']
                ],
                $request['group_id']
              );
            } else {
              return $groups->Update(
                [
                  'price' => cstr($request['price']),
                  'sell' => (int)$request['sell']
                ],
                $request['group_id']
              );
            }
          }
        }
        if(isset($request['title']) and trim($request['title']) !== ''){

          $query = 'UPDATE `user_group` SET `title` = ? WHERE `group_id` = ? AND `user_id` = ?';
          $sql = $db->prepare($query);
          $sql->bind_param('sii', $request['title'], $request['group_id'], $user_id);
          $sql->execute();
          $sql->close();

          $data['status'] = 'ok';
        }
        if(isset($_FILES, $_FILES['preview']) and $_FILES['preview']['error'] == 0){
          if(isset($_FILES['preview']['tmp_name']) and isset($_FILES['preview']['type'])){
            $file_name = 'preview_' . $user_id . '_' . $request['group_id'] . $mime_to_ext[$_FILES['preview']['type']];
            $upload_thumbnail_dir = __DIR__ . '/../../../public/upload/thumbnails/';
            move_uploaded_file($_FILES['preview']['tmp_name'], $upload_thumbnail_dir . $file_name);

            $query = 'UPDATE `user_group` SET `preview` = ? WHERE `group_id` = ? AND `user_id` = ?';
            $sql = $db->prepare($query);
            $sql->bind_param('sii', $file_name, $request['group_id'], $user_id);
            $sql->execute();
            $sql->close();

            $data['status'] = 'ok';
          }
        }
      }
    }

    else if(isset($request['action'], $request['group_id']) and $request['action'] == 'deletePreview') {

      $query = 'UPDATE `user_group` SET `preview` = NULL WHERE `group_id` = ? AND `user_id` = ?';
      $sql = $db->prepare($query);
      $sql->bind_param('ii', $request['group_id'], $user_id);
      $sql->execute();
      $data['sql_error'] = $sql->error;
      $sql->close();

      $data['status'] = 'ok';
      $data['request'] = $request;

    }

    else if(isset($_REQUEST['action'], $_REQUEST['group_id']) and $_REQUEST['action'] == 'delete') {

      $query = "SELECT
                `g`.`group_id` AS `group_id`
                FROM `groups` AS `g`
                JOIN `user_group` AS `ug` ON `ug`.`group_id` = `g`.`group_id`
                WHERE `ug`.`user_id` = `ug`.`owner_id`
                    AND `g`.`group_id` = ? ";
      $sql = $db->prepare($query);
      $sql->bind_param('i', $_REQUEST['group_id']);
      $sql->execute();
      $sql->bind_result($id);
      $ids = [];
      while($sql->fetch()) $ids[] = $id;
      $sql->close();



      $groups = new Groups();

      if(count($ids) == 1){
        return $groups->Update(
          [
            'del' => 1
          ],
          $ids[0]
        );
      }
    }

    else if(isset($_REQUEST['channels']) and $_REQUEST['channels'] == 'available'){

      $query = "SELECT
                `ug`.`user_id` AS `user_id`,
                `ug`.`owner_id` AS `owner_id`,
                `g`.`group_id` AS `group_id`,
                `g`.`name` AS `name`,
                `g`.`id` AS `id`,
                `g`.`sell` AS `sell`,
                `g`.`price` AS `price`,
                `g`.`type` AS `type`,
                `g`.`photo_50` AS `photo_50`,
                `g`.`photo_default` AS `photo_default`,
                `g`.`del` AS `del`
                FROM `groups` AS `g`
                JOIN `user_group` AS `ug` ON `ug`.`group_id` = `g`.`group_id`
                WHERE `ug`.`owner_id` = `ug`.`user_id`
                    AND `g`.`del` = 0
                    AND `g`.`sell` = 1
                    AND `ug`.`owner_id` <> ?";
      $groups = $db->prepare($query);
      $groups->bind_param('i', $user_id);
      $groups->execute();
      $result = $groups->get_result();
      $group_ids = [];
      while($row = $result->fetch_assoc()) $group_ids[$row['group_id']] = $row;
      $groups->close();

      if(count($group_ids) > 0){
        $available = $group_ids;

        foreach($available as $key => $value){

          $streams = new Streams();
          $streams->GetItems([
            'group_id' => $key,
            ['start', '>=', time()]
          ]);
          if($streams->count > 0) {
            for($i = 0; $i < $streams->count; $i++){
              $available[$key]['time'][] = [
                'id' => $streams->items[$i]['id'],
                'start' => $streams->items[$i]['start'],
                'end' => $streams->items[$i]['end']
              ];
            }
          }
        }
        $data['status'] = 'ok';
        $data['items'] = $available;
      } else $data['message'] = 'No channels available';

    }

    else if(
      isset($_REQUEST['broadcast'], $_REQUEST['group_id']) and
      $_REQUEST['broadcast'] != '' and
      $_REQUEST['group_id'] != ''
    ) {

      $user2group = new Users();
      $user2group->table_name = 'user_group';
      $user2group->id_name = 'id';
      $user2group->options = ['order' => '`id` ASC'];
      $user2group->GetItems([
        'user_id' => $user_id,
        'group_id' => (int)$_REQUEST['group_id']
      ]);
      if($user2group->count == 1) {
        $data = $user2group->Update(
          ['active' => (int)$_REQUEST['broadcast']],
          $user2group->items[0]['id']
        );
      }

    }

    else if(
      isset($request['access'], $request['user_id'], $request['group_id']) and
      $request['user_id'] != '' and
      $request['group_id'] != '' and
      $request['access'] == 'delete'
    ) {

      $query = "DELETE FROM `user_group`
                        WHERE `user_id` = ?
                        AND `owner_id` = ?
                        AND `group_id` = ?";
      $groups = $db->prepare($query);
      $groups->bind_param('iii', $request['user_id'], $user_id, $request['group_id']);
      $groups->execute();
      $groups->close();

      $data['status'] = 'ok';
      // $data['items'] = getUsers($user_id, $request['group_id']);
      $data += [
        'users' => getUsers($user_id, $request['group_id']),
        'group_id' => $request['group_id']
      ];
    }

    else if(
      isset($request['access'], $request['group_id'], $request['vk_id']) and
      $request['access'] = 'add' and
      $request['group_id'] != '' and
      $request['vk_id'] != ''
    ) {
      try{
        $vk = new VKApiClient();
        $user_vk_info = $vk->users()->get('f79ddd2af79ddd2af79ddd2aa8f7f5f35fff79df79ddd2aabd87cd6e2d2bdc698584987', [
          'user_ids' => $request['vk_id'],
          'fields' => ['photo_50','photo_max','photo_100','photo_200']
        ]);
        if(count($user_vk_info) == 1) {
          $new_user = new Users();
          $new_user->GetItems([
            'vk_user_id' => $user_vk_info[0]['id']
          ]);
          $access_user_id = false;
          if($new_user->count == 0){
            $new_user->Insert([
              'vk_user_id'      => (int)$user_vk_info[0]['id'],
              'name'            => cstr($user_vk_info[0]['first_name']),
              'fename'          => cstr($user_vk_info[0]['last_name']),
              'photo_50'        => cstr($user_vk_info[0]['photo_50']),
              'photo_100'       => cstr($user_vk_info[0]['photo_100']),
              'photo_200'       => cstr(($user_vk_info[0]['photo_200'] ?: $user_vk_info[0]['photo_max'])),
              'photo_max'       => cstr($user_vk_info[0]['photo_max']),
              'date'            => date("Y-m-d H:i:s"),
              'mail'            => '',
              'pone'            => 0,
              'role'            => 0,
              'del'             => 0,
              'money'           => 0,
              'referer_id'      => 0
            ]);
            $access_user_id = $new_user->id;
          }
          if($new_user->count == 1){
            $access_user_id = $new_user->items[0]['user_id'];
          }
          $user2group = new Users();
          $user2group->table_name = 'user_group';
          $user2group->id_name = 'id';
          $user2group->options = ['order' => '`id` ASC'];
          $user2group->GetItems([
            'owner_id' => $user_id,
            'user_id' => $access_user_id,
            'group_id' => (int)$request['group_id']
          ]);
          $insert_data = [];
          if(isset($request['time_start'], $request['time_end']) and $request['time_start'] != '' and $request['time_end'] != '') {
            $insert_data['start'] = (int)$request['time_start'];
            $insert_data['end'] = (int)$request['time_end'];
            $insert_data['unlim'] = 0;
          } else $insert_data['unlim'] = 1;
          if($user2group->count == 0) {
            $insert_data += [
              'user_id'  => $access_user_id,
              'group_id' => (int)$request['group_id'],
              'owner_id' => $user_id
            ];
            $user2group->Insert($insert_data);
          } else if($user2group->count == 1) {
            $user2group->Update($insert_data, $user2group->items[0]['id']);
          }

          $data['status'] = 'ok';
          $data += [
            'users' => getUsers($user_id, $request['group_id']),
            'group_id' => $request['group_id']
          ];
        }
      } catch(Exception $e) {}
    }

    else {
      $query = "SELECT
                `ug`.`user_id` AS `user_id`,
                `ug`.`owner_id` AS `owner_id`,
                `ug`.`active` AS `active`,
                `ug`.`unlim` AS `unlim`,
                `ug`.`start` AS `start`,
                `ug`.`end` AS `end`,
                `ug`.`title` AS `title`,
                `ug`.`preview` AS `preview`,
                `g`.`group_id` AS `group_id`,
                `g`.`name` AS `name`,
                `g`.`id` AS `id`,
                `g`.`sell` AS `sell`,
                `g`.`price` AS `price`,
                `g`.`type` AS `type`,
                `g`.`photo_50` AS `photo_50`,
                `g`.`photo_default` AS `photo_default`,
                `g`.`del` AS `del`,
                `g`.`live` AS `live`
                FROM `groups` AS `g`
                JOIN `user_group` AS `ug` ON `ug`.`group_id` = `g`.`group_id`
                WHERE `ug`.`user_id` = ?";
      $groups = $db->prepare($query);
      $groups->bind_param('i', $user_id);
      $groups->execute();
      $result = $groups->get_result();
      $group_ids = [];
      while($row = $result->fetch_assoc()) $group_ids[$row['group_id']] = $row;
      $groups->close();

      // file_put_contents('groups.php.txt', json_encode([$group_ids, count($group_ids)], JSON_PRETTY_PRINT));

      // $gr = new Groups();
      // $gr->GetItems([
      //     'user_id' => $user_id
      // ]);

      // if($gr->count > 0){
      //     $owner = $gr->items2id;

      if(count($group_ids) > 0){
        $owner = $group_ids;
        foreach($owner as $key => $value){

          if($user_id == $owner[$key]['owner_id']) {
            $owner[$key]['owner'] = true;
          }

          $owner[$key]['users'] = getUsers($user_id, $key);

          // unset(
          //     $owner[$key]['token'],
          //     $owner[$key]['youtube_token']
          //     // $owner[$key]['del']
          // );

          $query = 'SELECT `value` FROM `rtmp` WHERE `group_id` = ?';
          $sql = $db->prepare($query);
          $sql->bind_param('i', $key);
          $sql->execute();
          $sql->bind_result($rtmp);
          $res = [];
          while($sql->fetch()) $res[] = json_decode($rtmp, true);
          $sql->close();

          if(count($res) == 1) {
            if($user_id == $owner[$key]['owner_id']){
              $owner[$key]['rtmp'] = $res[0];
            } else $owner[$key]['rtmp'] = true;
          }

          $streams = new Streams();
          $streams->GetItems(['group_id' => $key]);
          if($streams->count > 0) {
            //return [$streams->count, $streams->items];
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
              if(count($videos) > 0) {
                $owner[$key]['time'][] = [
                  'id' => $streams->items[$i]['id'],
                  'start' => $streams->items[$i]['start'],
                  'end' => $streams->items[$i]['end'],
                  'video' => $videos
                ];
              } else {
                $owner[$key]['time'][] = [
                  'id' => $streams->items[$i]['id'],
                  'start' => $streams->items[$i]['start'],
                  'end' => $streams->items[$i]['end']
                ];
              }
            }
          }
        }
        $data['status'] = 'ok';
        $data['items'] = $owner;
      } else $data['message'] = 'No channels available';
      // $data['user'] = $user->user_data;
    }
  }
  $data['request'] = $request;

  return $data;
}
