<?php
define('Local', (mb_strpos($_SERVER['HTTP_HOST'], '.loc')));
include AppDir . '/includes/autoload.php';
$dbc = new db();
$db = $dbc->connect();
$global = [
    'month'=>[1=>'Января','Февраля','Марта','Апреля','Мая','Июня','Июля','Августа','Сентября','Октября','Ноября','Декабря'],
    'month2'=>[1=>'Январь','Февраль','Март','Апрель','Май','Июнь','Июль','Август','Сентябрь','Октябрь','Ноябрь','Декабрь'],
    'mail' => 'admin@strimshop.ru'
];
include AppDir . '/includes/functions.php';
// include AppDir . '/includes/check.php';
include AppDir . '/includes/setting.php';
