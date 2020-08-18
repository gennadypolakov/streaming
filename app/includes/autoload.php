<?php
spl_autoload_register(function ($class) {
    if(strpos($class,'m\\') === 0){
        $file = AppDir . "/models/" .explode('\\',$class)[1].'.php';
        if (file_exists($file)) {
            require_once $file;
        }
    } elseif(strpos($class,'VK\\') === 0) {
        $class = implode(DIRECTORY_SEPARATOR, explode('\\', $class));
        $file = AppDir . "/services/" . $class .'.php';
        if (file_exists($file)) {
            require_once $file;
        }
    } else {
        $file = AppDir . "/services/" . $class . '.php';
        if (file_exists($file)) {
            require_once $file;
        }
    }
});