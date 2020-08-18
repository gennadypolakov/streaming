<?php
namespace m;

class Channels extends Models{
    public $table_name = 'stream_channels';
    public $id_name = 'id';
    public $options = [];
    public $orders = [];

    public $id = 0;

    function GetByKey($key, $protocol) {

        global $db;

        $res = [];

//        $query = "SELECT r.value FROM `rtmp` AS r
//                    JOIN `groups` AS g ON g.group_id = r.group_id
//                    JOIN `streams` AS s ON s.group_id = r.group_id
//                    JOIN `stream_keys` AS k ON k.user_id = s.buyer
//                    WHERE k.value = ?
//        ";
        // $query = "SELECT r.value AS rtmp, g.type AS alias FROM `rtmp` AS r
        //             JOIN `groups` AS g ON g.group_id = r.group_id
        //             JOIN `streams` AS s ON s.group_id = r.group_id
        //             JOIN `stream_keys` AS k ON k.user_id = s.buyer
        //             WHERE k.value = ? AND s.start <= ? s.end > ?
        // ";

//        $stmt = $db->prepare($query);
//
//        $stmt->bind_param('s', $key);
//        $stmt->execute();
//        $stmt->bind_result($json);
//
//        while($stmt->fetch()) {
//            $res[] = json_decode($json, true);
//            // $res[$alias] = json_decode($json, true);
//        }
//
//        $stmt->close();


        $query = "SELECT `r`.`value`, `r`.`group_id` FROM `rtmp` AS `r`
                    JOIN `user_group` AS `ug` ON `ug`.`group_id` = `r`.`group_id`
                    JOIN `stream_keys` AS `k` ON `k`.`user_id` = `ug`.`user_id`
                    WHERE `ug`.`active` = '1'
                    AND `k`.`value` = ?
        ";
        // $query = "SELECT r.value AS rtmp, g.type AS alias FROM `rtmp` AS r
        //             JOIN `groups` AS g ON g.group_id = r.group_id
        //             JOIN `streams` AS s ON s.group_id = r.group_id
        //             JOIN `stream_keys` AS k ON k.user_id = s.buyer
        //             WHERE k.value = ? AND s.start <= ? s.end > ?
        // ";

        $stmt = $db->prepare($query);

        $stmt->bind_param('s', $key);
        $stmt->execute();
        $stmt->bind_result($json, $group_id);

        while($stmt->fetch()) {
            $tmp_arr = json_decode($json, true);
            $tmp_arr['group_id'] = $group_id;

            $res[] = $tmp_arr;
        }

        $stmt->close();


        return $res ?: false;
    }



    function GetListByUser($user_id) {
        global $db;

        $query = "
        select channel.id id, 
               channel.is_live live, 
               type.alias service, 
               key.value `key`, 
               channel.created_at created_at
        from stream_channels as channel
          join stream_keys as `key` on channel.key_id = `key`.id
          join stream_services as service on channel.current_service_id = service.id
          join stream_service_types as type on service.type_id = type.id
          join stream_protocols as protocol on service.protocol_id = protocol.id
        where channel.owner_id = ?";
        $stmt = $db->prepare($query);

        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $stmt->bind_result($id, $live, $service, $key, $created_at);

        $res = array();
        while($stmt->fetch()) {
            $res[] = array(
                'id' => $id,
                'live' => $live,
                'service' => $service,
                'key' => $key,
                'created_at' => $created_at
            );
        }

        $stmt->close();

        return $res ?: false;
    }
}
