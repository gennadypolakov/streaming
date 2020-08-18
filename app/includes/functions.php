<?php
function transform_HTMLs($string,  $length = null) { // защита от XSS атак
    $string = htmlentities(strip_tags(strval($string)), ENT_QUOTES, "UTF-8");
    $length = intval($length);
    if ($length > 0)
    {
	    $string = substr($string,  0,  $length);
    }
    return $string;
}
function cstr($s) {
    global $db;
    return mysqli_real_escape_string($db,transform_HTMLs(trim(strval($s))));
}
function cs($s) {
    return transform_HTMLs(trim(strval($s)));
}
function lstr($s) {
    global $db;
    return mysqli_real_escape_string($db,trim(strval($s)));
}
function strto1up($str) {
    $enc = mb_detect_encoding($str);
    $str=mb_strtoupper(mb_substr($str, 0, 1 , $enc), $enc).mb_substr($str, 1, mb_strlen($str, $enc)-1, $enc);
    return $str;
}
function json_encode_x($in) {
   return json_encode($in, JSON_UNESCAPED_UNICODE);
}
function RandomPassword() {
    $RU='A'; $RD='a'; //RU - RegistrUp , RD - RegistrDown
    for ($i=1;$i<=26;$i++)
    {
        $RegistrUp[$i] = $RU;
        $RegistrDown[$i] = $RD;
        $RU++;
        $RD++;
    }
    for ($i=0;$i<10;$i++)
    {
       $Number[$i]=$i;
    }
    $RandomPassword='';
    for ($n=1;$n<9;$n++)
    { 
        $i=rand(1,3);
        $Symbol='';
        switch ($i)
        {
            case 1:
            {
                $j=rand(1,26);
                $Symbol=$RegistrUp[$j];
                break;
            }
            case 2:
            {
                $j=rand(1,26);
                $Symbol=$RegistrDown[$j];
                break;
            }
            case 3:
            {
                $j=rand(1,10);
                $Symbol=$Number[$j];
                break;
            }
        }
        $RandomPassword .= $Symbol;
    }
    return strtolower($RandomPassword);
}
function request_url($patch=true, $get = true) {
    $result = ''; // Пока результат пуст
    $default_port = 80; // Порт по-умолчанию

    // А не в защищенном-ли мы соединении?
    if (isset($_SERVER['HTTPS']) && ($_SERVER['HTTPS']=='on')) {
        // В защищенном! Добавим протокол...
        $result .= 'https://';
        // ...и переназначим значение порта по-умолчанию
        $default_port = 443;
    } else {
        // Обычное соединение, обычный протокол
        $result .= 'http://';
    }
    // Имя сервера, напр. site.com или www.site.com
    $result .= $_SERVER['SERVER_NAME'];

    // А порт у нас по-умолчанию?
    if ($_SERVER['SERVER_PORT'] != $default_port) {
        // Если нет, то добавим порт в URL
        $result .= ':'.$_SERVER['SERVER_PORT'];
    }
    if ($_SERVER['PHP_SELF']!='/index.php')
        $result.=$_SERVER['PHP_SELF'];
    // Последняя часть запроса (путь и GET-параметры).
    if ($patch){
        $r = $_SERVER['REQUEST_URI'];
        if ($get) {
            $result .= $r;
        } else {
            $result .= explode('?', $r)[0];
        }
    }
    // Уфф, вроде получилось!
    return $result;
}
function recognize(
        $filename,
        $apikey,
        $is_verbose = false,
        $domain="antigate.com",
        $rtimeout = 5,
        $mtimeout = 120,
        $is_phrase = 0,
        $is_regsense = 0,
        $is_numeric = 0,
        $min_len = 0,
        $max_len = 0,
        $is_russian = 0
    ) {
    if (!file_exists($filename)) {
        //if ($is_verbose) echo "file $filename not found\n";
        return false;
    }
    $postdata = array(
        'method'    => 'post',
        'key'       => $apikey,
        'file'      => new \CURLFile($filename),
        'phrase'	=> $is_phrase,
        'regsense'	=> $is_regsense,
        'numeric'	=> $is_numeric,
        'min_len'	=> $min_len,
        'max_len'	=> $max_len,
        'is_russian'	=> $is_russian

    );
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_URL,             "http://$domain/in.php");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER,     1);
    curl_setopt($ch, CURLOPT_TIMEOUT,             60);
    curl_setopt($ch, CURLOPT_POST,                 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS,         $postdata);
    $result = curl_exec($ch);
    if (curl_errno($ch)) {
        if ($is_verbose) echo "CURL returned error: ".curl_error($ch)."\n";
        return false;
    }
    curl_close($ch);
    if (strpos($result, "ERROR")!==false) {
        if ($is_verbose) echo "server returned error: $result\n";
        return false;
    } else {
        $ex = explode("|", $result);
        $captcha_id = $ex[1];
        //if ($is_verbose) echo "captcha sent, got captcha ID $captcha_id\n";
        $waittime = 0;
        //if ($is_verbose) echo "waiting for $rtimeout seconds\n";
        sleep($rtimeout);
        while(true) {
            $result = file_get_contents("http://$domain/res.php?key=".$apikey.'&action=get&id='.$captcha_id);
            if (strpos($result, 'ERROR')!==false) {
                //if ($is_verbose) echo "server returned error: $result\n";
                return false;
            }
            if ($result=="CAPCHA_NOT_READY") {
                //if ($is_verbose) echo "captcha is not ready yet\n";
                $waittime += $rtimeout;
                if ($waittime>$mtimeout) {
                    //if ($is_verbose) echo "timelimit ($mtimeout) hit\n";
                    break;
                }
                //if ($is_verbose) echo "waiting for $rtimeout seconds\n";
                sleep($rtimeout);
            } else {
                $ex = explode('|', $result);
                if (trim($ex[0])=='OK') {
                    return trim($ex[1]);
                }
            }
        }
        return false;
    }
}
function Get_controller($include_dir, $controller) {
    if (file_exists(AppDir.'/controllers/'.$include_dir.$controller.'.php'))
        return AppDir.'/controllers/'.$include_dir.$controller.'.php';
    elseif (file_exists(AppDir.'/controllers/'.$controller.'.php'))
        return AppDir.'/controllers/'.$controller.'.php';
    else return false;
}
function object2Array($d) {
    if (is_object($d)) {
        $d = get_object_vars($d);
    }
    if (is_array($d)) {
        return array_map(__FUNCTION__, $d);
    } else {
        return $d;
    }
}
function html2rgb($color)
{
    if ($color[0] == '#')
        $color = substr($color, 1);

    if (strlen($color) == 6)
        list($r, $g, $b) = array($color[0].$color[1],
            $color[2].$color[3],
            $color[4].$color[5]);
    elseif (strlen($color) == 3)
        list($r, $g, $b) = array($color[0].$color[0], $color[1].$color[1], $color[2].$color[2]);
    else
        return false;

    $r = hexdec($r); $g = hexdec($g); $b = hexdec($b);

    return array($r, $g, $b);
}
function urlvkencode($value) {
    $value=str_replace('&','|uuu92833|',$value);
    $value=str_replace('?','|uuu23453|',$value);
    $value=urlencode($value);
    return $value;
}
function urlvkdecode($value) {
    $value=str_replace('|uuu92833|','&',$value);
    $value=str_replace('|uuu23453|','?',$value);
    return $value;
}
function rus2translit($string) {
    $converter = array(
        'а' => 'a',   'б' => 'b',   'в' => 'v',
        'г' => 'g',   'д' => 'd',   'е' => 'e',
        'ё' => 'e',   'ж' => 'zh',  'з' => 'z',
        'и' => 'i',   'й' => 'y',   'к' => 'k',
        'л' => 'l',   'м' => 'm',   'н' => 'n',
        'о' => 'o',   'п' => 'p',   'р' => 'r',
        'с' => 's',   'т' => 't',   'у' => 'u',
        'ф' => 'f',   'х' => 'h',   'ц' => 'c',
        'ч' => 'ch',  'ш' => 'sh',  'щ' => 'sch',
        'ь' => '\'',  'ы' => 'y',   'ъ' => '\'',
        'э' => 'e',   'ю' => 'yu',  'я' => 'ya',

        'А' => 'A',   'Б' => 'B',   'В' => 'V',
        'Г' => 'G',   'Д' => 'D',   'Е' => 'E',
        'Ё' => 'E',   'Ж' => 'Zh',  'З' => 'Z',
        'И' => 'I',   'Й' => 'Y',   'К' => 'K',
        'Л' => 'L',   'М' => 'M',   'Н' => 'N',
        'О' => 'O',   'П' => 'P',   'Р' => 'R',
        'С' => 'S',   'Т' => 'T',   'У' => 'U',
        'Ф' => 'F',   'Х' => 'H',   'Ц' => 'C',
        'Ч' => 'Ch',  'Ш' => 'Sh',  'Щ' => 'Sch',
        'Ь' => '\'',  'Ы' => 'Y',   'Ъ' => '\'',
        'Э' => 'E',   'Ю' => 'Yu',  'Я' => 'Ya',
    );
    return strtr($string, $converter);
}
function checkPhoneNumber($phoneNumber) {
    $phoneNumber = preg_replace('/[^0-9]/', '', $phoneNumber); // удалим пробелы, и прочие не нужные знаки
    if(is_numeric($phoneNumber)) {
        if(strlen($phoneNumber) < 5) // если длина номера слишком короткая, вернем false
        {
            return FALSE;
        } else {
            return $phoneNumber;
        }
    } else {
        return FALSE;
    }
}
function inserthref($text) {
    $preg_autolinks = array(
        'pattern' => array(
            "'[\w\+]+://[A-z0-9\.\?\+\-/_=&%#:;]+[\w/=]+'si",
            "'([^/])(www\.[A-z0-9\.\?\+\-/_=&%#:;]+[\w/=]+)'si",
        ),
        'replacement' => array(
            '<a href="$0" target="_blank" rel="nofollow">$0</a>',
            '$1<a href="http://$2" target="_blank" rel="nofollow">$2</a>',
        ));
    $search = $preg_autolinks['pattern'];
    $replace = $preg_autolinks['replacement'];
    $text = preg_replace($search, $replace, $text);
    return $text;
}