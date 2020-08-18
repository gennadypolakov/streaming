<?php

function process() {

    include AppDir . '/includes/codes.php';

    header('Content-Type: application/json');

    $user_id = false;
    $data['status'] = 'ok';
    $data['balance'] = 0;
    $data['tariff'] = false;

    $price = 150;
    $discount = 3;
    $max_discount = 51;

    $referrer_bonus = 30;

    $request = new Request();
    $user = new Users();
    $user->token = $request->params['token'] ?: false;

    if($user->CheckJWT()) {
        $user_id = $user->user_id;
        global $db;

        $data['balance'] = $user->user_data['balance'];

        $current_time = time();

        $tariff = new Tariffs();
        $tariff->getTariff($user_id);

        $transactions = new Users();
        $transactions->table_name = 'transactions';
        $transactions->id_name = 'id';
        $transactions->options = ['order' => '`id` ASC'];

        if($request->method == 'POST' and $request->params['amount']) {

            $amount = (int)$request->params['amount'] > 2 ? (int)$request->params['amount'] : 2;
            $total_discount = ($amount - 2) * $discount > $max_discount ? $max_discount : ($amount - 2) * $discount;
            $total_price = $price * (1 + ($amount - 2) * (1 - $total_discount / 100));

            if($tariff->amount == 0) {
                if($user->user_data['balance'] > $total_price) {
                    $insert_data = [
                        'user_id' => $user_id,
                        'amount' => $amount,
                        'price' => $total_price,
                        'start' => $current_time,
                        'end' => mktime(date('H'), date('i'), 0, date('n') + 1, date('j'))
                    ];
                    $tariff->Insert($insert_data);

                    $transactions_insert = [
                        'type' => '-',
                        'sum' => $total_price,
                        'description' => $codes[2],
                        'code' => 2,
                        'user_id' => $user_id,
                        'date' => $current_time
                    ];

                    $transactions->Insert($transactions_insert);

                    $data['balance'] = $user->user_data['balance'] - $total_price;
                    $user->Update(['money' => $data['balance']], $user_id);

                    if($user->user_data['referer_id'] != 0) {

                        $referrer = new Users();
                        $referrer->GetItems(['user_id' => $user->user_data['referer_id'], 'del' => 0]);

                        if($referrer->count == 1) {

                            $transactions_insert = [
                                'type' => '+',
                                'sum' => $total_price * $referrer_bonus / 100,
                                'description' => $codes[4],
                                'code' => 4,
                                'user_id' => $user->user_data['referer_id'],
                                'referral_id' => $user_id,
                                'date' => $current_time
                            ];

                            $transactions->Insert($transactions_insert);

                            $referrer->Update(['money' => $referrer->items[0]['money'] + $total_price * $referrer_bonus / 100], $user->user_data['referer_id']);
                        }
                    }

                    // if($tariff->id != 0) {
                    //     unset($insert_data['user_id']);
                    //     $data['tariff'] = $insert_data;
                    // }
                } else {
                    // $data['status'] = 'error';
                    $data['message'] = 'На балансе недостаточно средств';
                }
            } else if($tariff->amount > 0 and $tariff->amount != $request->params['amount']) {

                $money_back = ($tariff->end - $current_time) / ($tariff->end - $tariff->start) * $tariff->price;

                $new_amount = (int)$request->params['amount'];

                $total_discount = ($new_amount - 2) * $discount > $max_discount ? $max_discount : ($new_amount - 2) * $discount;
                $total_price = $price * (1 + ($new_amount - 2) * (1 - $total_discount / 100));

                if($total_price < $data['balance'] + $money_back) {

                    $end_date = mktime(
                        date('H', $current_time),
                        date('i', $current_time),
                        0,
                        date('n', $current_time) + 1,
                        date('j', $current_time)
                    );

                    $update_data = [
                        'amount' => $new_amount,
                        'price' => $total_price,
                        'start' => $current_time,
                        'end' => $end_date
                    ];
                    $tariff->Update($update_data, $tariff->id);

                    // $data['tariff'] = $update_data;

                    $transactions_insert = [
                        'type' => '+',
                        'sum' => $money_back,
                        'description' => $codes[7],
                        'code' => 7,
                        'user_id' => $user_id,
                        'date' => $current_time
                    ];
                    $transactions->Insert($transactions_insert);

                    $transactions_insert = [
                        'type' => '-',
                        'sum' => $total_price,
                        'description' => $codes[2],
                        'code' => 2,
                        'user_id' => $user_id,
                        'date' => $current_time
                    ];
                    $transactions->Insert($transactions_insert);

                    $data['balance'] = $user->user_data['balance'] + $money_back - $total_price;
                    $user->Update(['money' => $data['balance']], $user_id);

                    if($user->user_data['referer_id'] != 0) {
                        $referrer = new Users();
                        $referrer->GetItems(['user_id' => $user->user_data['referer_id'], 'del' => 0]);
                        if($referrer->count == 1) {

                            $transactions_insert = [
                                'type' => '+',
                                'sum' => $total_price * $referrer_bonus / 100,
                                'description' => $codes[4],
                                'code' => 4,
                                'user_id' => $user->user_data['referer_id'],
                                'referral_id' => $user_id,
                                'date' => $current_time
                            ];

                            $transactions->Insert($transactions_insert);

                            $referrer->Update(['money' => $referrer->items[0]['money'] + $total_price * $referrer_bonus / 100], $user->user_data['referer_id']);
                        }
                    }
                } else {
                    $data['message'] = 'На балансе недостаточно средств';
                }
            }
        } else if($request->method == 'POST' and $request->params['action'] and $request->params['action'] == 'prolong') {
            if($tariff->amount > 0){

                $total_discount = ($tariff->amount - 2) * $discount > $max_discount ? $max_discount : ($tariff->amount - 2) * $discount;
                $total_price = $price * (1 + ($tariff->amount - 2) * (1 - $total_discount / 100));

                if($total_price < $data['balance']) {

                    $end_date = mktime(
                        date('H', $tariff->end),
                        date('i', $tariff->end),
                        0,
                        date('n', $tariff->end) + 1,
                        date('j', $tariff->end)
                    );
                    $prev_price = ($tariff->end - $current_time) / ($tariff->end - $tariff->start) * $tariff->price;


                    $update_data = [
                        'price' => $total_price + $prev_price,
                        'end' => $end_date
                    ];
                    $tariff->Update($update_data, $tariff->id);

                    $transactions_insert = [
                        'type' => '-',
                        'sum' => $total_price,
                        'description' => $codes[6],
                        'code' => 6,
                        'user_id' => $user_id,
                        'date' => $current_time
                    ];

                    $transactions->Insert($transactions_insert);

                    $data['balance'] = $user->user_data['balance'] - $total_price;

                    $user->Update(['money' => $data['balance']], $user_id);

                    if($user->user_data['referer_id'] != 0) {
                        $referrer = new Users();
                        $referrer->GetItems(['user_id' => $user->user_data['referer_id'], 'del' => 0]);
                        if($referrer->count == 1) {
                            $transactions_insert = [
                                'type' => '+',
                                'sum' => $total_price * $referrer_bonus / 100,
                                'description' => $codes[4],
                                'code' => 4,
                                'user_id' => $user->user_data['referer_id'],
                                'referral_id' => $user_id,
                                'date' => $current_time
                            ];

                            $transactions->Insert($transactions_insert);

                            $referrer->Update(['money' => $referrer->items[0]['money'] + $total_price * $referrer_bonus / 100], $user->user_data['referer_id']);
                        }
                    }

                    // $data['tariff']['price'] = $update_data['price'];
                    // $data['tariff']['end'] = $update_data['end'];
                } else {
                    $data['status'] = 'error';
                    $data['message'] = 'На балансе недостаточно средств';
                }
            }
        }

        $tariff->getTariff($user_id);

        if($tariff->amount > 0) {
            $data['tariff'] = [
                'amount' => $tariff->amount,
                'price' => $tariff->price,
                'start' => $tariff->start,
                'end' => $tariff->end
            ];
        } else {
            $data['status'] = 'error';
            if(!$data['message']) $data['message'] = 'Нет активных тарифов';
        }

    }

    return $data;
}
