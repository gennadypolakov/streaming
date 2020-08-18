<?php
namespace m;

class Videos extends Models{
    public $table_name = 'videos';
    public $id_name = 'id';
    public $options = [
        'order' => '`videos`.`id` ASC'
    ];
}
