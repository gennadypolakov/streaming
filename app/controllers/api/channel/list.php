<?php

function process() {
    global $db, $user;
    
    $channel = new \m\Channels;
    return array(
        'channels' => $channel->GetListByUser($user->id),
    );
}
