<?php
namespace m;

class Albums extends Models{
    public $table_name = 'albums';
    public $id_name = 'id';
    public $options = [
        'order' => '`albums`.`id` ASC'
    ];
}
