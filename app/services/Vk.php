<?php

class Vk extends \m\Vk {
    /**
     * @var \s\Users
     */
    public $user;
    /**
     * @var \s\Group
     */
    public $group;
    public $version = '5.80';
    public $lang = 'ru';
    public $service_token = 'e6532b9fe6532b9fe6532b9f6ee6369dc5ee653e6532b9fbd2b4cc9bb2bb4aec45953b2';
    public $items;


    function SendError($arr, $method, $params=[], $settings=[]) {
        if (($this->user) &&
            (
                ((!$this->group) && ($this->user->data['alert_auth'] == 0)) ||
                (($this->group) && ($this->group->data['token_ok'] != 2))
            )
        ) {
            if ($this->user->id != 1755) {
                $message = "Вас приветствует бонусная система YouCarta.ru." . PHP_EOL;
                if ($this->group) {
                    $attachment = '';
                    $message .= 'У ваша группа "' . $this->group->data['name'] . '" не подкелючена к сайту.' . PHP_EOL .
                        'Из за этого подписчики группы не собираются в вашей базе для рассылки.' . PHP_EOL .
                        'Чтобы это исправить - перейдите в настройки группы и нажмите кнопку "Подключить".';
                } else {
                    $groups = new \s\Group();
                    $groups->GetItems(['user_id'=>$this->user->id, 'del'=>0]);
                    if ($groups->count) {
                        if ($groups->count > 1) {
                            $message .= "Ваши сайты: ";
                            $m2 = 'могут';
                        } else {
                            $message .= "Ваш сайт: ";
                            $m2 = 'может';
                        }
                        foreach ($groups->items as $i=>$group) {
                            $site = '';
                            $site .= $group['name'];
                            if ($i > 0) {
                                $message .= ', ';
                            }
                            $message .= $site;
                        }
                        $message .= ' не ' . $m2 . ' подключиться к группе.' . PHP_EOL .
                            'Чтобы это исправить - нажмите "Выдать доступ" в разделе Настройки';
                        $attachment = 'photo86941601_438118196';
                    }
                }

                $vk = new Vk();
                $vk->user = new Users(1755);
                $rez = $vk->Send('friends.areFriends', [
                    'token'=>1,
                    'user_ids'=>$this->user->data['vk_user_id']
                ]);
                if (isset($rez->response->friend_status[0])&&(in_array($rez->response->friend_status[0], [0,2]))) {
                    $vk->Send('friends.add', [
                        'user_id'=>$this->user->data['vk_user_id'],
                        'token'=>2
                    ], ['proxy'=>true]);
                }

                $vk->Send('messages.send', [
                    'user_id'=>$this->user->data['vk_user_id'],
                    'message' => $message,
                    'attachment' => $attachment,
                    'token'=>2
                ], ['proxy' => true]);
                if ($this->group) {
                    $this->group->Update([
                        'token_ok'=>2
                    ]);
                } else {
                    $this->user->Update([
                        'alert_auth'=>1,
                        'alert_auth_error'=>json_encode_x($arr)
                    ]);
                    $this->user->DeleteSession();
                }
            }
        }
    }
    public function __construct($method='', $params=[], $settings=[])
    {
       if ($method) {
           $this->Send($method, $params, $settings);
       }
    }
    function Send($method, $params=[], $settings=[]) {
        global $lastVKAccesses;
        $arr = [];
        if (mb_strpos($method, '/'))
            $url = $method;
        else
            $url = "https://api.vk.com/method/$method";
        $ch = curl_init();
        $i=0;
        $ok = false;
        if ($settings['service_token']) {
            $params['access_token'] = $this->service_token;
        }
        elseif (!$params['access_token']) {
            if ($this->group) {
                $params['access_token'] = $this->group->data['token'];
            } elseif ($this->user) {
                $params['access_token'] = $this->user->data['access_token_vk' . ($settings['token'] ? $settings['token'] : '')];
                if ((!isset($settings['proxy']))&&($settings['token']==2)) {
                    $settings['proxy'] = true;
                }
            }
        }

        if ($settings['proxy']) {
            $url = "http://sadaki.info/api/api.php?proxy_url=" . urlencode($url);
        }

        $params['v'] = $this->version;
        while ((!$ok)&&($i<3)) {
            if ($lastVKAccesses) {
                usleep(500000);
            }
            curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, 30);
            curl_setopt($ch, CURLOPT_TIMEOUT, 30);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $response = curl_exec($ch);
            if (curl_errno($ch)) {
                error_log($url.'?'.json_encode_x($params).' = connect error: '.curl_error($ch).' №'.curl_errno($ch));
            } else {
                if ($arr = json_decode($response,$settings['assoc'])) {
                    $ok = true;
                    if ($arr->error) {
                        if (in_array($arr->error->error_code, [5,203])) {
                            $this->SendError($arr, $method, $params=[], $settings=[]);
                        }
                        elseif (in_array($arr->error->error_code, [1,10,603])) { // Необходимо повторить запрос
                            $ok = false;
                        }
                    } else {
                        $ok = true;
                    }
                } else {
                    error_log($url.'?'.json_encode_x($params).' Wrong request');
                }
            }
            $lastVKAccesses = true;
            $i++;
        }
        curl_close($ch);
        if(isset($this)){
            $this->items = $arr;
        }

        return $arr;
    }
}