<?php
namespace m;

class V2s extends Models{
    public $table_name = 'video2stream';
    public $id_name = 'id';
    public $options = [
        'order' => '`video2stream`.`id` ASC'
    ];
}
