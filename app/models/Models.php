<?php
namespace m;

class Models {
    public $id = 0;
    public $id2 = 0;
    public $id3 = 0;

    public $data = [];

    public $items=[];
    public $items2id=[];
    public $count=0;

    public $table_name;
    public $id_name;
    public $id_name2;
    public $id_name3;
    public $options = [
        'order'=>'',
        'limit_from'=>0,
        'limit_count'=>0
    ];

    function __construct($id=0, $id2=0, $id3=0)
    {
        if ($id)
            $this->Get($id, $id2, $id3);
    }

    function GetFromRow($row) {
        $this->data = $row;
        $this->id = $this->data[$this->id_name];
        if ($this->id_name2)
            $this->id2 = $this->data[$this->id_name2];
        if ($this->id_name3)
            $this->id3 = $this->data[$this->id_name3];
        return $this->data;
    }

    function Get($id=0, $id2=0, $id3=0) {
        global $db;
        if (!$id)
            $id = $this->id;
        if (!$id2)
            $id2 = $this->id2;
        if (!$id3)
            $id3 = $this->id3;

        $add_sql = '';
        if ($id2) {
            $add_sql = " AND `{$this->id_name2}`=".intval($id2);
        }
        if ($id3) {
            $add_sql = " AND `{$this->id_name3}`=".intval($id3);
        }

        $result = mysqli_query($db, "SELECT * FROM `{$this->table_name}` WHERE `{$this->id_name}`=".intval($id)." $add_sql");
        $this->data = mysqli_fetch_assoc($result);
        if ($this->data) {
            $this->id = $this->data[$this->id_name];
            if ($this->id_name2)
                $this->id2 = $this->data[$this->id_name2];
            if ($this->id_name3)
                $this->id3 = $this->data[$this->id_name3];
        }
        return $this->data;
    }
    function AddParams($params) {
        return $params;
    }
    function UpdateParams($params) {
        return $params;
    }
    function FormatParams($params) {
        return $params;
    }
    function EscapeStr($str) {
        global $db;
        return mysqli_real_escape_string($db, $str);
    }
    function WhereParams($params) {
        $sql='';
        foreach ($params as $index=>$value) {
            if (is_array($value)) {
                $field = $value[0];
                $z = $value[1];
                if (is_array($value[2])) {
                    if ($value[2]['value']) {
                        $val = $value[2]['value'];
                        $val = $this->EscapeStr($val);
                    } else {
                        foreach ($value[2] as $i=>$v) {
                            $value[2][$i] = $this->EscapeStr($v);
                        }
                        $val = "('" . implode("', '", $value[2]) . "')";
                    }
                } else {
                    $val = $this->EscapeStr($value[2]);
                    if ($val!='NULL')
                        $val = "'{$val}'";
                }
            } else {
                $z = '=';
                $field = $index;
                $val = $this->EscapeStr($value);
                if ($val!='NULL')
                    $val = "'{$val}'";
            }
            $sql.=" AND `{$this->table_name}`.`{$field}` {$z} {$val}";
        }
        return $sql;
    }
    function SetParams($params) {
        $set_sql='';
        foreach ($params as $index=>$value) {
            if ($set_sql!='') $set_sql.=', ';
            if (is_array($value)) {
                $v = $this->EscapeStr($value['value']);
            } else {
                $v = $this->EscapeStr($value);
                if ($v!='NULL')
                    $v = "'$v'";
            }
            $set_sql.="`$index`=$v";
        }
        return $set_sql;
    }
    function Update($params, $id=0, $get = false) {
        global $db;
        $arr=Array('status'=>'ok');
        if (!$id)
            $id = $this->id;

        $id2 = $this->id2;
        $id3 = $this->id3;

        $add_sql = '';
        if ($id2) {
            $add_sql = " AND `{$this->id_name2}`=".intval($id2);
        }
        if ($id3) {
            $add_sql = " AND `{$this->id_name3}`=".intval($id3);
        }

        $params = $this->FormatParams($params);
        $params = $this->UpdateParams($params);
        $set_sql = $this->SetParams($params);

        if (!mysqli_query($db, $sql = "UPDATE `{$this->table_name}` SET $set_sql WHERE `{$this->id_name}`=".intval($id)." $add_sql")) {
            $arr['status']='error';
            $arr['sql']=$sql;
            $arr['message']=mysqli_error($db);
        } else {
            if ($get) $this->Get($id, $id2, $id3);
        }
        return $arr;
    }
    function Insert($params, $get = false) {
        global $db;
        $arr=Array('status'=>'ok');
        $params = $this->FormatParams($params);
        $params = $this->AddParams($params);
        $set_sql = $this->SetParams($params);
        if (!mysqli_query($db, $sql="INSERT INTO `{$this->table_name}` SET $set_sql")) {
            $arr['status']='error';
            $arr['sql']=$sql;
            $arr['message']=mysqli_error($db);
        } else {
            $arr['id']=mysqli_insert_id($db);
            $this->id = $arr['id'];
            if ($get) $this->Get($this->id);
        }
        return $arr;
    }
    function Disable($id=0) {
        if (!$id)
            $id = $this->id;

        $this->Update([
            'del'=>1
        ], $id);
    }
    function Enable($id=0) {
        if (!$id)
            $id = $this->id;

        $this->Update([
            'del'=>0
        ], $id);
    }
    function Delete($id=0, $id2=0, $id3=0) {
        global $db;
        if (!$id)
            $id = $this->id;
        if (!$id2)
            $id2 = $this->id2;
        if (!$id3)
            $id3 = $this->id3;

        $add_sql = '';
        if ($id2)
            $add_sql = " AND `{$this->id_name2}`=".intval($id2);
        if ($id3)
            $add_sql = " AND `{$this->id_name3}`=".intval($id3);

        $arr=Array('status'=>'ok');

        if (!mysqli_query($db, "DELETE FROM `{$this->table_name}` WHERE `{$this->id_name}`=".intval($id)." $add_sql")." $add_sql") {
            $arr['status']='error';
            $arr['message']=mysqli_error($db);
        }
        return $arr;
    }
    function GetOne($params, $options=[]) {
        $options['one_row'] = true;
        $options['limit_count']=1;
        $rez = $this->GetItems($params, $options);
        $this->GetFromRow($rez['result']);
        return $rez;
    }
    function GetItems($params=[], $options=[]) {
        global $db;
        $arr=Array('status'=>'ok');

        $this->items = [];
        $this->items2id = [];

        if ($options['order']) $order = $options['order'];
        elseif ($this->options['order']) $order = $this->options['order'];
        else $order = '';

        if ($options['limit_count']) $limit = 'LIMIT '.intval($options['limit_from']).', '.intval($options['limit_count']);
        elseif ($this->options['limit_count']) $limit = 'LIMIT '.intval($this->options['limit_from']).', '.intval($this->options['limit_count']);
        else $limit = '';

        $params = $this->FormatParams($params);
        $w = $this->WhereParams($params);

        if (!$options['field_sql']) $options['field_sql'] = '*';

        $sql = "SELECT SQL_CALC_FOUND_ROWS {$options['field_sql']} FROM `{$this->table_name}` {$options['table_sql']} 
            WHERE 1 $w {$options['where_sql']} {$options['after_sql']} ORDER BY $order $limit";
        if ($options['debug'])
            $arr['sql'] = $sql;
        if ($options['id_name']) $id_name = $options['id_name'];
        else $id_name = $this->id_name;

        if ($result = mysqli_query($db, $sql)) {
            if ($options['one_row']) {
                $arr['result'] = mysqli_fetch_assoc($result);
            } else {
                $res = mysqli_query($db, 'SELECT FOUND_ROWS()');
                $a = $res->fetch_array(MYSQLI_NUM);
                $this->count = $a[0];

                while ($myrow = mysqli_fetch_assoc($result)) {
                    $this->items[] = $myrow;
                    $this->items2id[$myrow[$id_name]] = $myrow;
                }

            }
        } else {
            $arr['status']='error';
            $arr['message']=mysqli_error($db);
        }

        return $arr;
    }
}