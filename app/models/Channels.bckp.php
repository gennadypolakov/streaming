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

        $query = "
        select type.alias as alias, service.data_json as json
        from stream_channels as channel
          join stream_keys as `key` on channel.key_id = `key`.id
          join stream_services as service on channel.current_service_id = service.id
          join stream_service_types as type on service.type_id = type.id
          join stream_protocols as protocol on service.protocol_id = protocol.id
        where key.value = ? and protocol.name = ? and channel.is_live";
        $stmt = $db->prepare($query);

        $stmt->bind_param('ss', $key, $protocol);
        $stmt->execute();
        $stmt->bind_result($alias, $json);

        $res = array();
        while($stmt->fetch()) {
            $res[$alias] = json_decode($json, true);
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