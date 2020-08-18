<?php

function process() {

    $vk_callback_api_secret = 'em8rp6sd6v67t7695ob7pye7ikbm5c76';

    $current_time = time();

    $request = new Request();

    if($request->params['type'] == 'confirmation' and $request->params['group_id'] == '158819144') {
        exit('a329ddb2');
    }
    if($request->params['secret'] == $vk_callback_api_secret and $request->params['type'] == 'vkpay_transaction') {

        // file_put_contents('vkpay.txt', json_encode($request->params, JSON_PRETTY_PRINT) . "\n\n", FILE_APPEND);

        $user = new Users();
        $user->GetItems(['vk_user_id' => $request->params['object']['from_id'], 'del' => 0]);
        if($user->count == 1 and isset($request->params['object']['amount'])) {
            $amount = $request->params['object']['amount'] / 1000;
            $new_balance = $user->items[0]['money'] + $amount;

            $user->Update(['money' => $new_balance], $user->items[0]['user_id']);

            $transactions = new Users();
            $transactions->table_name = 'transactions';
            $transactions->id_name = 'id';
            $transactions->options = ['order' => '`id` ASC'];

            $transactions_insert = [
                'type' => '+',
                'sum' => $amount,
                'description' => $codes[8],
                'code' => 8,
                'user_id' => $user->items[0]['user_id'],
                'date' => $current_time
            ];

            $transactions->Insert($transactions_insert);

        }
    }
    exit('ok');
}
// {"type": "group_join", "object"

// vkpay_transaction 
// платёж через VK Pay	Объект, содержащий поля:
// from_id — идентификатор пользователя-отправителя перевода;
// amount — сумма перевода в тысячных рубля;
// description — комментарий к переводу;
// date — время отправки перевода в Unixtime.


?>