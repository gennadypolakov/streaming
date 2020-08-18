<?php
namespace m;

class Users extends Models{
    public $table_name = 'users';
    public $id_name = 'user_id';
    public $options = [
        'order' => '`users`.`user_id` ASC'
    ];
    public $orders = ['Все польователи','Авторизованые пользователи','Администраторы'];

    public $user_id=0;

    function GetByVk($vk_user_id) {
        global $db;

        $result=mysqli_query($db, "SELECT * FROM `{$this->table_name}` WHERE `vk_user_id`=".intval($vk_user_id)." LIMIT 1");
        $myrow = mysqli_fetch_array($result);
        $this->GetFromRow($myrow);
        return $this->data;
    }
}