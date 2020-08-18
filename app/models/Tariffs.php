<?php
namespace m;

class Tariffs extends Models{
    public $table_name = 'tariffs';
    public $id_name = 'id';
    public $options = [
        'order' => '`tariffs`.`id` ASC'
    ];
  
}
