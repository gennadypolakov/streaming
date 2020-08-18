<?php
$user = new Users();
$user->CheckAuth();
if ($user->auth) {
    $user->data;
    $user->id;
}
if ((!in_array($_GET['urls'], ['api/vk_login', 'api/auth', 'api/googleoauth', 'vk_group_token'])) && ($_GET['code'])) {
    if (isset($_GET['state'])) {
        $group = new Groups();
        $arr = $group->VkGet($_GET['code'], $_GET['state']);
    } elseif (isset($_GET['scope'])) {

        include AppDir . '\..\vendor\autoload.php';
        $client = new Google_Client();
        $client->setAuthConfig(AppDir.'/client_secret.json');
        $client->setRedirectUri('http://' . $_SERVER['HTTP_HOST'] . '/oauth2callback');
        $client->addScope("https://www.googleapis.com/auth/youtube.force-ssl");
        $r = $client->authenticate($_GET['code']);
        $access_token = $client->getAccessToken();
        $group = new Groups();
        $arr = $group->YoutubeGet($access_token['access_token']);
    } else {
        $arr = $user->VkLogin($_GET['code']);
    }
    header('Location: ' . $arr['redirect_uri']);
    exit();
}
if ($_GET['action'] == 'logout') {
    $user->logout();
    header('Location: /');
    exit();
}