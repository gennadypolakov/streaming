<!--menu_panel-->
<div class="menu_panel">
    <ul class="nav nav-tabs nav-fill">
        <?php
        $menu_pages = new Pages();
        $menu_pages->GetItems([
            'menu'=>1,
            'del'=>0
        ]);
        foreach ($menu_pages->items as $item)
        {
            ?>
            <li class="nav-item">
                <a class="nav-link text-truncate custom-ripple <?= ($item['page_id']==$router->page['page_id'] ? 'active' : '') ?>"
                   title="" href="/cabinet/<?=$item['url']?>">
                    <i class="icon <?=$item['icon']?>"></i>
                    <div class="title"><?=$item['title']?></div>
                </a>
            </li>
            <?php
        }
        ?>
    </ul>
</div>
<!--/menu_panel-->