<?php
$group_id = intval($router->urls[2]);
$group = new Groups($group_id);
if($group->data['user_id'] !=$user->id){
    $page = new Pages();
    $router->page = $page->GetByUrl('403', 0);
    $router->pages = [$router->page];
}

