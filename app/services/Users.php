<?php

include AppDir . '/../vendor/autoload.php';

use \Firebase\JWT\JWT;

class Users extends \m\Users {
    /**
     * @var Sessions $session
     */
    public $session;
    public $auth = false;
    public $vk_user_id = false;
    public $user_data = false;
    public $token = false;
    public $vk_token = false;

    public static function LogoutCookie() {
        setcookie('uid', '');
        setcookie('sid', '');
        setcookie('ucode', '');
    }
    function GetByVkLogin($login) {
        $arr = ['status'=>'ok'];
        $vk = new Vk();
        $res = $vk->Send('users.get', ['user_ids'=>$login], ['service_token'=>true]);
        if ($res->error) {
            $arr['status'] = 'error';
            $arr['message'] = $res->error->error_msg;
            $arr['error_code'] = $res->error->error_code;
        } else {
            $this->GetByVk($res->response[0]->id);
        }
        return $arr;
    }
    function Logout() {
        if ($this->auth) {
            $userlogins = new Sessions();
            $userlogins->Insert([
                'user_id' => $this->id,
                'ip' => $_SERVER['REMOTE_ADDR'],
                'start_time' => $this->session->data['start_time'],
                'last_time' => $this->session->data['last_time'],
                'ses_pass' => $this->session->data['ses_pass']
            ]);
            $this->session->Delete();
            self::LogoutCookie();
        }
    }

    function CheckAuth()
    {
        $user_id = (isset($_COOKIE['uid']) ? $_COOKIE['uid'] : '');
        $ses_pass = (isset($_COOKIE['ucode']) ? $_COOKIE['ucode'] : '');
        $session_id = (isset($_COOKIE["sid"]) ? $_COOKIE["sid"] : '');
        if (($user_id)&&($ses_pass)&&($session_id)) {
            $session = new Sessions($session_id);
            if (($session->data['user_id']==$user_id)&&($session->data['ses_pass']==$ses_pass)) {
                //if ($user_id==1684) $user_id = 7283;
                $this->Get($user_id);
                $this->session = $session;
                $this->auth = true;
            } else {
                self::LogoutCookie();
            }
        }
    }

    function create_jwt() {
        global $jwt_key;
        if(!$this->vk_user_id) return false;

        $curent_time = time();
        $data2token = [
            'iat' => $curent_time,
            'nbf' => $curent_time,
            'exp' => $curent_time + 60 * 60 * 24 * 30,
            'vk_user_id' => $this->vk_user_id,
            // 'agent' => md5($_SERVER['HTTP_USER_AGENT'])
        ];
        $this->token = JWT::encode($data2token, $jwt_key);
        return true;
    }

    function GetJWT(){
        if($this->token) return true;
        if(function_exists('apache_request_headers')){
            $headers = apache_request_headers();
            if(isset($headers['Authorization'])) {
                $this->token = str_replace('Bearer ', '', $headers['Authorization']);
                return true;
            }
        }
        $this->token = $_COOKIE['token'] ?: $_GET['token'] ?: $_POST['token'] ?: false;
        if($this->token) return true;
        return false;
    }

    function CheckJWT(){
        global $jwt_key;
        if(!$this->GetJWT()) return false;
        try{
            $decoded = JWT::decode(
                $this->token,
                $jwt_key,
                ['HS256']
            );

            if(isset($decoded->vk_user_id)){

            // if(isset($decoded->vk_user_id, $decoded->agent)
            // and $decoded->agent == md5($_SERVER['HTTP_USER_AGENT'])){
                $this->vk_user_id = $decoded->vk_user_id;
                return $this->getUserInfoByVkId($this->vk_user_id);
            }
        } catch(Exception $e) {
            // echo $e->getMessage();
            // return $e->getMessage();
            return false;
        }
        return false;
    }

    function getUserInfoByVkId(){
        if(!$this->vk_user_id) return false;
        $this->GetItems([ 'vk_user_id' => $this->vk_user_id ]);
        $count_user = $this->count;
        if ($this->count == 1){
            $this->user_id = $this->items[0]['user_id'];
            $this->user_data = [
                'user_id' => $this->items[0]['user_id'],
                'first_name' => $this->items[0]['name'],
                'last_name' => $this->items[0]['fename'],
                'photo' => $this->items[0]['photo_50'],
                'ref_id' => $this->items[0]['ref_id'],
                'balance' => $this->items[0]['money'],
                'referer_id' => $this->items[0]['referer_id']
            ];
            $this->table_name = 'tokens';
            $this->GetItems(
                [
                    'user_id' => $this->user_id,
                    'type' => 'vk'
                ],
                [ 'order' => '`id` ASC' ]
            );
            if ($this->count == 1) $this->vk_token = $this->items[0]['value'];
            $this->table_name = 'users';
            $this->count = $count_user;
            return true;
        } else return false;
    }

    function check_vk_sign() {

        global $vk_app_client_secret;

        $sign_params = [];
        foreach ($_GET as $name => $value) { 
            if (strpos($name, 'vk_') !== 0) continue;
            $sign_params[$name] = $value; 
        } 

        ksort($sign_params);
        $sign_params_query = http_build_query($sign_params);
        $sign = rtrim(strtr(base64_encode(hash_hmac('sha256', $sign_params_query, $vk_app_client_secret, true)), '+/', '-_'), '=');
        // return $sign;
        if($sign === $_GET['sign']) {
            $this->vk_user_id = $_GET['vk_user_id'];
            $this->getUserInfoByVkId();
            return true;
        }
        return false;
    }
    
    function VkLogin($code, $enter = true) {
        $arr = ['status' => 'ok'];

        $redirect_uri = request_url(true, false);
        $arr['redirect_uri']=$redirect_uri;
        $uri='';
        $uri1='';
        $hash='';
        foreach ($_GET as $index=>$value) {

            if (($index!='')&&($index!='urls')&&($index!='code')&&($index!='secret_auth')&&($index!='secret_auth')) {
                if ($uri == '') $uri .= '?';
                else $uri .= '&';
                if ($uri1 == '') $uri1 .= '?';
                else $uri1 .= '&';
                $uri .= $index . '=' . $value;

                if ($index=='hash') {
                    $hash = '#'.$value;
                } else {
                    $uri1 .= $index . '=' . $value;
                }

            }
        }
        $redirect_uri.=$uri;
        $arr['redirect_uri'] .= $uri1.$hash;
        $url="https://oauth.vk.com/access_token";
        $params = [
            'client_id'=> 6665818,
            'client_secret'=>'49KeYmpeld97g7IbOny1',
            'code'=>$code,
            'redirect_uri'=>$redirect_uri
        ];
        $vk = new Vk();
        $get_token = $vk->Send($url,$params);

        if ($get_token->error) {
            $arr['status']='error';
            $arr['message']='Токен не получен: '.$get_token->error.' '.$get_token->error_description;
        }
        elseif ((isset($get_token->user_id))&&($get_token->user_id>0)) {
            $params=Array(
                'fields'=>'photo_50,photo_100,photo_200,photo_max,photo_max_orig',
                'user_ids'=>$get_token->user_id,
                'access_token'=>$get_token->access_token
            );
            $vk_user = $vk->Send('users.get', $params);
            $this->GetItems(['vk_user_id'=>$get_token->user_id]);
            $data = ["photo_50"=>cstr($vk_user->response[0]->photo_50),
                "photo_100"=>cstr($vk_user->response[0]->photo_100),
                "photo_200"=>cstr(($vk_user->response[0]->photo_200 ? $vk_user->response[0]->photo_200 : $vk_user->response[0]->photo_max)),
                "photo_max"=>cstr($vk_user->response[0]->photo_max_orig),
                "name"=>cstr($vk_user->response[0]->first_name),
                "fename"=>cstr($vk_user->response[0]->last_name)
               ];

                $data['access_token_vk']=cstr($get_token->access_token);
            if ($this->count>0){
               $this->Get($this->items[0]['user_id']);
               $this->Update($data);
            }
            else {
                $data['vk_user_id'] = $get_token->user_id;
                $data['date'] = date("Y-m-d H:i:s");
                $this->Insert($data, true);
                if ($_GET['reg_uid']>0) {
                   $referer = new Users($_GET['reg_uid']);
                    if($referer->id){
                        $data['referer_id'] = $referer->id;
                    }
                }
            }

        }
        else{
            $arr['status'] = 'error';
            $arr['message'] = 'Неизвестная ошибка';
        }
        if (($arr['status']=='ok')&&($enter)) {
            $session = new Sessions();
            $params = [];
            $params['user_id'] = $this->id;
            $params['last_time'] = date("Y-m-d H:i:s");
            $params['ip'] = $_SERVER['REMOTE_ADDR'];
            $params['vk_user_id'] = $get_token->user_id;
            $params['ses_pass'] = md5('azsxdcfvt'.$this->id.time().rand(1,999999));
            $params['start_time'] = date("Y-m-d H:i:s");
            $session->Insert($params,true);
            setcookie('uid',$this->id,time() + 27 * 24 * 60 * 60,'/', '.' . $_SERVER['HTTP_HOST'], false, true);
            setcookie('sid',$session->id,time() + 27 * 24 * 60 * 60,'/', '.' . $_SERVER['HTTP_HOST'], false, true);
            setcookie('ucode',$session->data['ses_pass'],time() + 27 * 24 * 60 * 60,'/', '.' . $_SERVER['HTTP_HOST'], false, true);
        }
        return $arr;
    }
}