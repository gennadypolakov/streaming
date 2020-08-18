<?php
namespace m;
/**
 * Работа со страницами
 * Class Pages
 */
class Pages extends Models {
    public $table_name='pages';
    public $id_name='page_id';
    public $options = [
        'order'=>'`pages`.`index` ASC'
    ];
}