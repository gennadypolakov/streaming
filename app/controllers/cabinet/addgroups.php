<?php
$group = new Groups();
$group->GetItems(['user_id'=>$user->id,'del'=>0,'type'=>'vk']);
$group_ids=[];
foreach ($group->items as $item){
    $group_ids[] = $item['id'];
}
$groups = new Vk('groups.get',[
    'user_id'=>$user->data['vk_user_id'],
    'extended'=>1,
    'access_token'=>$user->data['access_token_vk'],
    'filter'=>'admin',
    'count'=>1000
]);
foreach ($groups->items->response->items as $v=>$item){
    if(in_array($item->id,$group_ids)){
        foreach ($group->items as $s_item){
            if ($item->id=$s_item['id']){
                $groups->items->response->items[$v]->new= $s_item['group_id'];
            }
        }
    }
}