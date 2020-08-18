<?php
namespace m;

class Streams extends Models{
    public $table_name = 'streams';
    public $id_name = 'id';
    public $options = [
        'order' => '`streams`.`id` ASC'
    ];
}
