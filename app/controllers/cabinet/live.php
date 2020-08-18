<?php
if($router->urls[2]){
    include AppDir.'/controllers/cabinet/edit_group.php';
}else{
    $groups = new Groups();
    $groups->GetItems(['user_id'=>$user->id,'del'=>0]);
}
