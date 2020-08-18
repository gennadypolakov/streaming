<?php
include AppDir.'\..\vendor\autoload.php';
$client = new Google_Client();
$client->setAuthConfig(AppDir.'/client_secret.json');
$client->addScope("https://www.googleapis.com/auth/youtube.force-ssl");
$client->setRedirectUri('http://' . $_SERVER['HTTP_HOST'] . '/oauth2callback');
$client->setAccessType('offline');
$client->setIncludeGrantedScopes(true);
$auth_url = $client->createAuthUrl();
header('Location: ' . filter_var($auth_url, FILTER_SANITIZE_URL));