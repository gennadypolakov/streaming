<?php

function process() {
    if(!key_exists('channel_id', $_GET))
        return array('status' => 'error', 'message' => 'Incorrect params');

    return array(
        'list' => array(
            array(
                'user_id' => 1234,
                'date' => '2018-10-12 14:30',
                'duration' => 360
            )
        )
    );
}