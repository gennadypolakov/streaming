<?php

class Request {

  public $method = 'GET';
  public $params = [];
  public $name = [];
  public $id = [];

  function __construct() {

    if(isset($_SERVER['REQUEST_METHOD'])) $this->method = $_SERVER['REQUEST_METHOD'];

    if($this->method === 'GET') $this->params = $_GET;
    else if ($this->method === 'POST') {
//      if(count($_POST) > 0){
//        $this->params = $_POST;
//      } else {
//      $this->params = json_decode(file_get_contents('php://input'),true) ?: [];
//      }
      $this->params = array_merge($_POST, json_decode(file_get_contents('php://input'),true) ?: []);
//      $this->params = json_decode(file_get_contents('php://input'),true) ?: [];
    }

    if(isset($_GET['urls'])) {
      $api_array = explode('/', $_GET['urls']);
      if(count($api_array) >= 2 and $api_array[0] === 'api') {
        for($i = 1; $i < count($api_array); $i += 2) {
          $this->name[] = $api_array[$i];
          $this->id[] = $api_array[$i + 1] ?: false;
        }
      }
    }
  }

}
