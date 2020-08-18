<?php

class Balance extends \m\Models {

    public $amount = 0;
    public $price = 0;
    public $start = false;
    public $end = false;
    public $balance = 0;
    public $history = [];
    public $referrals = [];
    public $profit = 0;

    function get_referrals($user_id){

        global $db;

        $query = "SELECT
                    `t`.`sum` AS `sum`,
                    `t`.`description` AS `description`,
                    `t`.`date` AS `date`,
                    `u`.`name` AS `name`,
                    `u`.`fename` AS `fename`
                FROM `transactions` AS `t`
                JOIN `users` AS `u` ON `u`.`user_id` = `t`.`referral_id`
                WHERE `t`.`type` = '+'
                    AND `t`.`referral_id` IS NOT NULL
                    AND `t`.`user_id` = ?";

        $sql = $db->prepare($query);
        $sql->bind_param('i', $user_id);
        $sql->execute();
        $result = $sql->get_result();
        $referrals = [];
        $profit = 0;
        while($row = $result->fetch_assoc()) {
            $profit += $row['sum'];
            $referrals[] = $row;
        }
        $sql->close();
        $this->profit = $profit;
        $this->referrals = $referrals;

    }

    function get_balance($user_id){

        $user = new Users();
        $user->GetItems(['user_id' => $user_id]);

        if($user->count == 1) {
            $this->balance = $user->items[0]['money'];
        }
    }

    function get_history($user_id){


        global $db;

        $query = "SELECT `id`, `type`, `sum`, `description`, `date`
                FROM `transactions`
                WHERE `user_id` = ?";

        $sql = $db->prepare($query);
        $sql->bind_param('i', $user_id);
        $sql->execute();
        $result = $sql->get_result();
        $history = [];
        $profit = 0;
        while($row = $result->fetch_assoc()) {
            $history[] = $row;
        }
        $sql->close();
        $this->history = $history;

    }

}
