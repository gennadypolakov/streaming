<header>
    <div class="headerwrapper d-flex flex-row justify-content-between flex-nowrap">
        <div class="header-left">
            <a href="/cabinet" class="custom-ripple">
                <div class="logo">
                    <img src="/images/logo.svg" height="35" alt="StrimShop"
                         title="">
                    <span class="hidden-sm-down">StreamVi</span>
                </div>
            </a>
        </div>
        <div class="header-right">
            <div class="d-flex justify-content-end">
                <div class="btn-group _help">
                    <a class="btn btn-default" href="https://vk.com/page-139157852_54697808" target="_blank">
                        <i class="icon-question-circle"></i>
                    </a>
                </div>

                <?php if ($user->auth) { ?>
                    <div class="btn-group btn-group-option btn-balance">
                        <a class="btn btn-default" href="/cabinet/balance">
                            <span><?=$user->data['money']?></span>
                            <i class="fa fa-rub"></i>
                        </a>
                    </div>
                    <div class="btn-group btn-group-option">
                        <div class="btn btn-default dropdown-toggle btn-profile" data-toggle="dropdown">
                            <span class="name"><?=$user->data['name']?></span>
                            <div class="user-avatar user-avatar-sm" style="background-image: url(<?=$user->data['photo_50']?>);"></div>
                        </div>
                        <div class="dropdown-menu dropdown-menu-right animated fadeIn" role="menu">
                            <!--                            <a href="#" class="dropdown-item">-->
                            <!--                                <i class="fa fa-user"></i> Мой профиль</a>-->
                            <a href="/cabinet/logout" class="dropdown-item">
                                <i class="fa fa-sign-out"></i> Выход</a>
                        </div>
                    </div>
                <?php } else { ?>
                    <div class="btn-group btn-group-option">
                        <a class="btn dropdown-toggle btn-profile" href="https://oauth.vk.com/authorize?client_id=6665818&display=page&redirect_uri=http://<?=$_SERVER['HTTP_HOST']?>/<?=$_GET['urls']?>&scope=groups,video&response_type=code&v=5.80">
                            <div class="hidden-sm-down" style="color:#fff;" >Войти</div>
                        </a>
                    </div>
                <?php } ?>
            </div>
        </div>
    </div>
</header>