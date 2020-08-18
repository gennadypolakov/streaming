<?php
if($router->urls[2]){
    include AppDir.'/templates/cabinet/edit_group.php';
}else {
    ?>
    <div class="main_panel">
        <div class="btn btn-primary mb-3 d-sm-inline-block d-block" data-toggle="modal" data-target="#addGroup">
            Подключить свою группу
        </div>
        <div class="btn btn-primary mb-3 d-sm-inline-block d-block" data-toggle="modal" data-target="#addGroup">Список
            групп для трансляций
        </div>
        <div class="accordion" id="accordionExample">
            <?php
            foreach ($groups->items as $item) {
                ?>
                <div class="card">
                    <div class="card-header btn" data-toggle="collapse" data-target="#collapse<?=$item['group_id']?>"  aria-controls="collapse<?=$item['group_id']?>" id="heading<?=$item['group_id']?>">
                        <div class="mb-0">
                            <div class="d-block">
                                <div class="d-flex align-items-center">
                                    <div class="user-avatar user-avatar-sm" style="background-image:url('<?=$item['photo_50']?>')"></div>
                                    <div class="name"><?=$item['name']?></div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="collapse<?=$item['group_id']?>" class="collapse" aria-labelledby="heading"
                         data-parent="#accordionExample">
                        <div class="card-body">
                            <div class="label  h5">Транслировать
                                <div class="material-switch pull-right">
                                    <input id="live_<?=$item['group_id']?>" name="sale"
                                           type="checkbox"/>
                                    <label for="live_<?=$item['group_id']?>" class="badge-success"></label>
                                </div>
                            </div>
                            <div class="label broadcast h5">Выставить на бирже
                                <div class="material-switch pull-right">
                                    <input id="sale_<?=$item['group_id']?>" data-group_id="<?=$item['group_id']?>" name="sale"
                                           type="checkbox"/>
                                    <label for="sale_<?=$item['group_id']?>" class="badge-success"></label>
                                </div>
                            </div>
                            <div class="label h5">Цена за час
                                <div class="pull-right">
                                    <input id="price_<?=$item['group_id']?>" name="sale"
                                           type="number" min="100"/>
                                    <label for="price_<?=$item['group_id']?>"></label>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <?php
            }
                ?>
        <!-- Window add Group -->
        <div class="modal fade bd-example-modal-lg" id="addGroup" tabindex="-1" role="dialog"
             aria-labelledby="myLargeModalLabel" aria-hidden="true">
            <div class="modal-dialog modal-lg" role="document">
                <div class="modal-content">
                    <div class="modal-header">
                        <h5 class="modal-title" id="exampleModalLabel">Выберите платформу</h5>
                        <div class="close" data-dismiss="modal" aria-label="Close">
                            <span>&times;</span>
                        </div>
                    </div>
                    <div class="modal-body card-deck">
                        <div class="card">
                            <img class="card-img-top img-fluid" src="/images/vk.svg" alt="Card image cap">
                            <a href="/cabinet/addgroups" class="btn btn-block btn-primary card-link">Добавить группу</a>
                        </div>
                        <div class="card">
                            <img class="card-img-top img-fluid" src="/images/youtube.png" alt="Card image cap">
                            <a href="/cabinet/addchannel" class="btn btn-block bottom btn-primary card-link">Добавить
                                канал</a>
                        </div>
                    </div>
                    <div class="modal-footer">
                        <div class="btn btn-secondary" data-dismiss="modal">Закрыть</div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <?php
}