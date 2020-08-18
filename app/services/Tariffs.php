<?php
class Tariffs extends \m\Tariffs {

    public $amount = 0;
    public $price = 0;
    public $start = false;
    public $end = false;
    public $balance = 0;

    function getTariff($user_id){

        $this->GetItems([
            'user_id' => $user_id,
            ['end', '>=', time()]
            ]);

        if($this->count == 1) {
            $this->id = $this->items[0]['id'];
            $this->amount = $this->items[0]['amount'];
            $this->price = $this->items[0]['price'];
            $this->start = $this->items[0]['start'];
            $this->end = $this->items[0]['end'];
        }
    }

    function getBalance($user_id){

        $user = new Users();
        $user->GetItems(['user_id' => $user_id]);

        if($user->count == 1) {
            $this->balance = $user->items[0]['money'];
        }
    }

}
