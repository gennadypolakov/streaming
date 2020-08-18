<div class="main_panel group_edit">
    <div class="card">
        <div class="card-header d-flex flex-xl-wrap align-items-center">
                    <?php
                    switch ($group->data['type']):
                        case 'vk':
                            ?>
                            <div class="user-avatar user-avatar-sm"
                                style="background-image: url('<?= $group->data['photo_50'] ?>')"></div>
                            <div><i class="fa fa-vk" aria-hidden="true"></i><?= $group->data['name'] ?></div>
                            <?php
                            break;
                        case 'youtube':
                            ?>
                            <div class="user-avatar user-avatar-sm"
                                style="background-image: url('<?= $group->data['photo_default'] ?>')"></div>
                            <div><i class="fa fa-youtube" aria-hidden="true"></i><?= $group->data['name'] ?></div>
                            <?php
                            break;
                    endswitch;
                    ?>
                    <div class="mr-0 ml-auto">
                        <div id="remove_group"  class="float-right btn btn-danger" data-id="<?=$group->id?>" >Отключить</div>
                    </div>
        </div>
        <div class="card-body">
            <label for="sale" class="col-12 card-title">
                Разместить на бирже
                <div class="material-switch pull-right">
                    <input id="sale" name="sale"
                           type="checkbox"/>
                    <label for="sale" class="badge-success"></label>
                </div>
            </label>
            <ul class="list-group list-group-flush group_setting">
                <li class="list-group-item">
                    <div class="form-group row">
                        <label for="price_hour" class="col-sm-2 col-form-label">Цена за час</label>
                        <div class="col-sm-10">
                            <div class="input-group">
                                <input type="number" min="100" class="form-control" name="price_hour">
                                <div class="input-group-append">
                                    <span class="input-group-text">₽</span>
                                    <span class="input-group-text">.00</span>
                                </div>
                            </div>
                        </div>
                </li>
            </ul>
        </div>

    </div>