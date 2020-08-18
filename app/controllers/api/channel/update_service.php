<?php

function process() {
    if(!key_exists('channel_id', $_POST) || !key_exists('alias', $_POST) || !key_exists('data', $_POST))
        return array('status' => 'error', 'message' => 'Incorrect params');

    
}