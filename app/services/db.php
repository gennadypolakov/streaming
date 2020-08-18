<?php

class db {
    private $data = [
        'main'=> [
            'host' => "localhost",
            'user' => "streamvi",
            'pass' => "U0u8S3r4",
            'db_name' => "streamvi.ru"
        ],
        'local'=> [
            'host' => "localhost",
            'user' => "root",
            'pass' => "",
            'db_name' => "streamvi"
        ]
    ];
    public function connect() {

        $type = (Local ? 'local' : 'main');
        $data = $this->data[$type];
        $db = mysqli_connect($data['host'], $data['user'], $data['pass'], $data['db_name']);
        mysqli_query($db, "set character_set_client='utf8mb4'");
        mysqli_query($db, "set character_set_results='utf8mb4'");
        mysqli_query($db, "set collation_connection='utf8mb4_unicode_ci'");
        return $db;
    }
}
