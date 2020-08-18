<?php
class Functions {
    public static function CheckAjaxFilename($name) {
        return preg_match('/[^a-zA-Z0-9_\/]/', $name) !== 1;
    }
}