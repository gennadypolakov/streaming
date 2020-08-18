<?php

function process() {

    header('Content-Type: application/json');
    include AppDir . '/includes/codes.php';
    global $db;

    $user_id = false;
    $data['status'] = 'error';

    $request = new Request();
    $user = new Users();
    $user->token = $request->params['token'] ?: false;

    if($user->CheckJWT()) {

        $user_id = $user->user_id;

        $balance = new Balance();
        $balance->get_referrals($user_id);
        $balance->get_balance($user_id);
        $balance->get_history($user_id);

        $data['referrals'] = $balance->referrals;
        $data['profit'] = $balance->profit;
        $data['balance'] = $balance->balance;
        $data['history'] = $balance->history;
        $data['status'] = 'ok';

    }

    return $data;
}
