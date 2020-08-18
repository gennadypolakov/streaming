<?php

function process() {
    if(!key_exists('channel_id', $_POST))
        return array('status' => 'error', 'message' => 'Incorrect params');

    return array(
        'key' => 'oqhi1uh29839a8sg87asdbwqiub19basob8b382eb'
    );
}