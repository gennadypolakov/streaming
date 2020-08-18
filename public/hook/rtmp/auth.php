<?php
if(!key_exists('name', $_GET))
{http_response_code(404); exit;}

require_once('../includes.php');
require_once(AppDir.'/services/Streamer.php');

$token_min = 4;

$token = $_GET['name'];
$token_len = strlen($token);

if($token_len < $token_min)
{http_response_code(404);exit;}

$names = \Services\Streamer::auth('rtmp://', $token);
if(!$names)
{http_response_code(404);exit;}

$uri = 'rtmp://127.0.0.1/live-router/json-'.
    urlencode(json_encode($names));

header('Location: '.$uri);
http_response_code(301);
exit();