<?php

function process() {
    if(!key_exists('channel_id', $_POST) || !key_exists('switch', $_POST))
        return array('status' => 'error', 'message' => 'Incorrect params');

    
    $channel_id = intval($_POST['channel_id']);
    $switch = $_POST['switch'] === 'on';

    
}