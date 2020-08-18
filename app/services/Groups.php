<?php
class Groups extends \m\Groups {
    function VkGet($code,$group_id){
        global $user;
        $arr = ['status' => 'ok'];

        $redirect_uri = request_url(true, false);
        $arr['redirect_uri']=$redirect_uri;
        $uri='';
        $uri1='';
        $hash='';
        $arr['redirect_uri'] .= $uri1.$hash;
        $arr['redirect_uri'] .= $uri1.$hash;
        $url="https://oauth.vk.com/access_token";
        $params = [
            'client_id'=> 6665818,
            'client_secret'=>'49KeYmpeld97g7IbOny1',
            'code'=>$code,
            'redirect_uri'=>$redirect_uri
        ];
        $vk = new Vk();
        $get_token = $vk->Send($url,$params,['assoc'=>true]);
        if ($get_token->error) {
            $arr['status']='error';
            $arr['message']='Токен не получен: '.$get_token->error.' '.$get_token->error_description;

        }
        elseif ($get_token['access_token_'.$group_id]) {
            $params=Array(
                'group_id'=>$group_id,
                'access_token'=>$get_token['access_token_'.$group_id]
            );
            $vk->Send('groups.getById',$params);
            $params = [
                'name'=>$vk->items->response[0]->name,
                'user_id'=>$user->id,
                'id'=>$group_id,
                'token'=>$get_token['access_token_'.$group_id],
                'type'=>'vk',
                'photo_50'=>$vk->items->response[0]->photo_50,
                'photo_100'=>$vk->items->response[0]->photo_100,
                'photo_200'=>$vk->items->response[0]->photo_200
            ];
            $this->Insert($params);
        }
        else{
            $arr['status'] = 'error';
            $arr['message'] = 'Неизвестная ошибка';
        }
        return $arr;
    }
    function YoutubeGet($youtube_token){
        global $user;
        $redirect_uri = "/cabinet/live";
        $arr['redirect_uri']=$redirect_uri;
        include AppDir.'\..\vendor\autoload.php';
        $client = new Google_Client();
        $client->setAuthConfig(AppDir.'/client_secret.json');
        $client->setAccessToken($youtube_token);
        $service = new Google_Service_YouTube($client);
        $r =$service->channels->listChannels('snippet',['mine'=>true]);
        $canal =$r['modelData']['items'][0];
        $params = [
            'name'=>$canal['snippet']['title'],
            'user_id'=>$user->id,
            'id'=>$canal['id'],
            'token'=>$youtube_token,
            'type'=>'youtube',
            'photo_default'=>$canal['snippet']['thumbnails']['default']['url'],
            'photo_medium'=>$canal['snippet']['thumbnails']['medium']['url'],
            'photo_high'=>$canal['snippet']['thumbnails']['high']['url']
        ];
        $r = $this->Insert($params);
        return $arr;
    }
}