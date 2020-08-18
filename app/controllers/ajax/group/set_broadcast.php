<?php
if(!$user->auth){
    $arr['status']='error';
    $arr['message']= 'Вы не авторизованы';
}
if($arr['status']=='ok'){
    if(!isset($_GET['status'])){
        $arr['status']='error';
        $arr['message']= 'Нет данные не полные';
    }
}
if($arr['status']=='ok'){
    $group_id = intval($_GET['group_id']);
    $group = new Groups($group_id);
    if($group->data['user_id'] !=$user->id){
        $arr['status']='error';
        $arr['message']= 'Нет прав';
    }
}
if($arr['status']=='ok'){
    if(!isset($_GET['status'])){
        $arr['status']='error';
        $arr['message']= 'Нет данные не полные';
    }
}
if($arr['status']=='ok'){
    $status = intval($_GET['status']);
    $group->Update(['broadcast'=>$status]);
}