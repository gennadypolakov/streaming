<?php

function process() {
    exec("cd  /var/www/www-root/data/www/streamvi.ru && git pull", $result);
    return array(
        'success' => 1,
        'result' => $result,
    );
}

    