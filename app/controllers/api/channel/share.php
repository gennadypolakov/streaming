<?php

function process() {
    if(!key_exists('channel_id', $_POST) || !key_exists('user_id', $_POST) || !key_exists('date', $_POST) || !key_exists('duration', $_POST))
        return array('status' => 'error', 'message' => 'Incorrect params');
}