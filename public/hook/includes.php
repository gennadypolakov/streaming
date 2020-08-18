<?php

define('AppDir', __DIR__.'/../../app');
define('Local', (mb_strpos($_SERVER['HTTP_HOST'], '.loc')));
include AppDir.'/includes/autoload.php';

$dbc = new \db();
$db = $dbc->connect();