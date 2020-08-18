<?php

function process() {

    // header('Content-Type: application/json');
    include AppDir . '/includes/codes.php';
    global $db, $yandex_client_secret;

    $user_id = false;
    $data['status'] = 'ok';

    $current_time = time();

    $sha1_string = implode('&', [
        $_REQUEST['notification_type'],
        $_REQUEST['operation_id'],
        $_REQUEST['amount'],
        $_REQUEST['currency'],
        $_REQUEST['datetime'],
        $_REQUEST['sender'],
        $_REQUEST['codepro'],
        $yandex_client_secret,
        $_REQUEST['label'],
    ]);
    $sha1 = sha1($sha1_string);

    if($sha1 == $_REQUEST['sha1_hash']) {
        $user = new Users();
        $user->GetItems(['user_id' => (int)$_REQUEST['label'], 'del' => 0]);
        if($user->count == 1) {
            // file_put_contents('yandexmoney.txt', json_encode([$_REQUEST, $sha1], JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);
            $new_balance = $user->items[0]['money'] + (float)$_REQUEST['amount'];

            $user->Update(['money' => $new_balance], $user->items[0]['user_id']);

            $transactions = new Users();
            $transactions->table_name = 'transactions';
            $transactions->id_name = 'id';
            $transactions->options = ['order' => '`id` ASC'];

            $transactions_insert = [
                'type' => '+',
                'sum' => (float)$_REQUEST['amount'],
                'description' => $codes[8],
                'code' => 8,
                'user_id' => $user->items[0]['user_id'],
                'date' => $current_time
            ];

            $transactions->Insert($transactions_insert);

        }
    }

}
