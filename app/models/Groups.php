<?php
namespace m;

class Groups extends Models{
    public $table_name = 'groups';
    public $id_name = 'group_id';
    public $options = [
        'order' => '`groups`.`group_id` ASC'
    ];
}
