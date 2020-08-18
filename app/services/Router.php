<?php
class Router
{
    public $urls = [];
    public $page = null;
    public $pages = [];
    public $page_title = 'StreamVi';

    public $default_page = 'index';
    public $template = '';

    function load($url)
    {
        global $user;

        if (!$url) {
            $url = $this->default_page;
        }

        $this->urls = explode('/', $url);
        $parent_id = 0;
        $isset = true;

        $page = new Pages();

        foreach ($this->urls as $index => $value) {
            if ($value) {
                $this->page = $page->GetByUrl($value, $parent_id);

                if ($this->page) {
                    $parent_id = $this->page['page_id'];
                    $this->pages[] = $this->page;
                    if ($this->page['child_id']==-1) {
                        break;
                    }
                } else {
                    $isset = false;
                    break;
                }
            }
        }



        if ($this->page['child_id']>0) {
            $this->page = $page->Get($this->page['child_id']);
            $this->pages[] = $this->page;
        }

        if (!$isset) {
            $this->page = $page->GetByUrl('404', 0);
            $this->pages = [$this->page];
            //header("HTTP/1.0 404 Not Found");
        }
        if ($this->page['user_auth'] == 1) {
            if ($user->auth) {
                if ($this->page['type'] > $user->data['role']) {
                    $this->page = $page->GetByUrl('403', 0);
                    $this->pages = [$this->page];
                }
            } else {
                $this->page = $page->GetByUrl('login', 0);
                $this->pages = [$this->page];
            }
        }

        $this->page_title = $this->page['title'];

        //echo "<pre>";
        //print_r($this->pages);
    }
    public function run() {
        global $user, $router;
        include AppDir . '/controllers/index.php';
        foreach ($this->pages as $index => $value) {
            if ($value['controller']) {
                $controller = AppDir . '/controllers/' . $value['controller'] . '.php';
                if (file_exists($controller)) {
                    include $controller;
                }
            }
        }
        if ($this->page['template']) {
            $this->template = AppDir . '/templates/' . $this->page['template'] . '.php';
        }
        if ($this->page['layout']) {

            $layout_php = AppDir . '/layouts/' . $this->page['layout'] . '.php';
            $layout_html = AppDir . '/layouts/' . $this->page['layout'] . '.html';
            if (file_exists($layout_php)) {
                include $layout_php;
            } else if (file_exists($layout_html)) {
                include $layout_html;
            }

        }
    }
}