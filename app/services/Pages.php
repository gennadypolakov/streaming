<?php
class Pages extends \m\Pages {

    public static function ParseText($text) {
        function paste_price() {

        }
        $text=preg_replace_callback("!\[studio_price\]!si", 'paste_price', $text);
        return $text;
    }

    function GetByUrl($url, $parent_id)
    {
        $pages = new self();
        $pages->GetItems([
            'url'=>cs($url),
            'parent_id'=>intval($parent_id),
            'del'=>0
        ]);
        if ($pages->count) {
            $this->GetFromRow($pages->items[0]);
        }
        return $this->data;
    }

    public static function GetParentsUrl($page_id) {

        if ($page_id>0) {
            $pages = new self();
            $pages->GetItems([
                'page_id'=>intval($page_id)
            ]);
            $href = self::GetParentsUrl($pages->items[0]['parent_id']).'/'.$pages->items[0]['url'];
        } else {
            $href = '';
        }
        return $href;
    }
}