<!DOCTYPE html>
<html lang="ru">
<head>
    <meta charset="utf-8">
    <meta http-equiv="x-ua-compatible" content="ie=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no, user-scalable=no">
    <title><?=$router->page['title']?></title>

    <meta name="description" content="">
    <meta name="keywords" content="">
    <meta name="author" Content="">
    <meta name="reply-to" Content="">

    <!-- For IE 9 and below. ICO should be 32x32 pixels in size -->
    <!--[if IE]>
    <link rel="shortcut icon" href="/images/favicon.ico"><![endif]-->

    <!-- Touch Icons - iOS and Android 2.1+ 180x180 pixels in size. -->
    <link rel="apple-touch-icon-precomposed" href="/images/apple-touch-icon-precomposed.png">

    <!-- Firefox, Chrome, Safari, IE 11+ and Opera. 196x196 pixels in size. image/gif или image/png -->
    <link rel="icon" href="/images/favicon.png" type="image/png" sizes="196x196">
    <link rel="icon" href="/images/favicon-32x32.png" type="image/png" sizes="32x32">
    <link rel="icon" href="/images/favicon-16x16.png" type="image/png" sizes="16x16">

    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="apple-mobile-web-app-status-bar-style" content="blue">
    <meta name="format-detection" content="telephone=no">

    <!-- plugins -->
    <link rel="stylesheet" href="/plugins/font-awesome/css/font-awesome.min.css">
    <link rel="stylesheet" href="/plugins/animate.css">
    <link rel="stylesheet" href="/plugins/select2/css/select2.min.css">
    <link rel="stylesheet" href="/plugins/datetimepicker/build/jquery.datetimepicker.min.css">
    <link rel="stylesheet" href="/plugins/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="/plugins/emojionearea/dist/emojionearea.min.css">
    <link rel="stylesheet" href="/plugins/Ripple.js/dist/ripple.min.css">
    <link rel="stylesheet" href="/plugins/PolymerForm/build/jquery.polymer-form.min.css">
    <link rel="stylesheet" href="/plugins/dropzone/dropzone.min.css">
    <link rel="stylesheet" href="/plugins/Jcrop/css/jquery.Jcrop.min.css">

    <link rel="stylesheet" href="/css/cabinet.css?<?=rand(1,1000)?>">
</head>
<body class="main-body materialize">
    <div class="main-container">
        <?php include AppDir.'/templates/includes/header.php'; ?>
        <?php include AppDir . '/templates/includes/menu_panel.php'; ?>
        <section>
            <div class="main_wrapper">
                <?php if (file_exists($this->template)) include $this->template; else echo $this->template; ?>
            </div>
        </section>

        <section>
            <!-- Window Refresh User Token -->
            <div class="modal fade" id="wrutModal" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel">
                <div class="modal-dialog" role="document">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h5 class="modal-title" id="exampleModalLabel">Ошибка токена пользователя</h5>
                            <div class="close" data-dismiss="modal" aria-label="Close">
                                <span>&times;</span>
                            </div>
                        </div>
                        <div class="modal-body">
                            <p>В ходе выполнения запроса во ВКонтакте возникла ошибка.
                                Для предотвращения дальнейших ошибок необходимо обновить токен.</p>
                        </div>
                        <div class="modal-footer">
                            <div class="btn btn-secondary" data-dismiss="modal">Закрыть</div>
                            <a href="" class="btn btn-primary">Обновить токен</a>
                        </div>
                    </div>
                </div>
            </div>
        </section>

        <footer>
            <div class="footerwrapper text-muted row text-center small">
                <div class="col-sm-8 text-sm-left">
                    <a class="text-muted" href="/rules" title="">
                        Правила пользования</a>
                    •
                    <a class="text-muted" href="mailto:<?=$global['mail']?>" title="" target="_blank"><?=$global['mail']?></a>
                    •
                    <a class="text-muted" href="" title="" target="_blank">
                        <i class="fa fa-vk"></i> Мы Вконтакте</a>
                </div>
                <div class="col-sm-4 text-sm-right">
                    <!-- Author, author@site.com. All rights reserved -->
                    <span>&copy; StrimShop.ru,
                        2018-<?= date("Y") ?></span>
                </div>
            </div>
        </footer>
    </div>

    <!-- jQuery first, then Tether, then Bootstrap JS. -->
    <script src="/plugins/jquery.min.js"></script>
    <script src="/plugins/tether.min.js"></script>
    <script src="/plugins/pace.min.js"></script>
    <script src="/plugins/bootstrap-notify/bootstrap-notify.min.js"></script>
    <script src="/plugins/select2/js/select2.min.js"></script>
    <script src="/plugins/select2/js/i18n/ru.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/sortablejs@latest/Sortable.min.js"></script>
    <script src="/plugins/datetimepicker/build/jquery.datetimepicker.full.min.js"></script>
    <script src="/plugins/bootstrap/js/bootstrap.min.js"></script>
    <script src="/plugins/emojionearea/dist/emojionearea.min.js"></script>
    <script src="/plugins/jquery_lazyload/jquery.lazyload.min.js"></script>
    <script src="/plugins/Chart.min.js"></script>
    <script src="/plugins/Ripple.js/dist/ripple.min.js"></script>
    <script src="/plugins/PolymerForm/build/jquery.polymer-form.min.js"></script>
    <script src="/plugins/dropzone/dropzone.min.js"></script>
    <script src="/plugins/download.min.js"></script>
    <script src="/plugins/jquery.waypoints.min.js"></script>
    <script src="/plugins/jquery.lazy.min.js"></script>
    <script src="/plugins/Jcrop/js/jquery.Jcrop.min.js"></script>

    <!-- CUSTOM JS -->
    <script src="/dist/public/js/main.js"></script>
    <script src="/dist/public/js/cabinet/main.js?<?=rand(1,10000)?>"></script>
    <script src="/dist/public/js/cabinet/addGroup.js?<?=rand(1,10000)?>"></script>
    <script src="/dist/public/js/cabinet/editGroup.js?<?=rand(-100000,1)?>"></script>


    <!-- HTML5 shim and Respond.js IE8 support of HTML5 elements and media queries -->
    <!--[if lt IE 9]>
    <script src="/plugins/html5shiv.js"></script>
    <script src="/plugins/respond.min.js"></script>
    <![endif]-->

</body>
</html>