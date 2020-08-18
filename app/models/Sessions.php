<?php
namespace m;

class Sessions extends Models{
    public $table_name = 'sessions';
    public $id_name = 'session_id';
    public $options = [
        'order' => '`sessions`.`session_id` ASC'
    ];
}
