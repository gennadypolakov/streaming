<?php
namespace Services;

class Streamer {

    static function auth($protocol, $key) {
        global $db;

        $channel = new \m\Channels;
        return $channel->GetByKey($key, $protocol);
    }

}