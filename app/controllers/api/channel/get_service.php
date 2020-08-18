<?php

function process() {
    if(!key_exists('channel_id', $_GET))
        return array('status' => 'error', 'message' => 'Incorrect params');

    return array(
        'alias' => 'vk',
        'url' => 'rtmp://stream3.vkuserlive.com:443//live?srv=625624&s=aWQ9MklEQjZXcEFmM1kmc2lnb222a1o2a0RVMnlWczFWQ09RUG5DaW5RPT0=',
        'name' => '2IDBsAwAf3Y'
    );
}