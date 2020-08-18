<div class="main_panel">
    <div class="row row-card-custom list-infinite-vk-groups new_group_list">
        <?php
        foreach ($groups->items->response->items as $item) {
            ?>
            <div class="col-lg-3 col-md-4 col-sm-6 pb-3">
                <div class="card h-100">
                    <div class="card-img-top custom-card-img-wr">
                        <div class="custom-card-img-layout photo-infinite-vk-groups z-index-0 filter-blur-20"
                             style="background-image: url('<?= $item->photo_200 ?>')"></div>
                        <a href="https://vk.com/<?= $item->screen_name ?>" class="ext-btn-infinite-vk-groups"
                           title="<?= $item->name ?>" target="_blank">
                            <div class="photo-infinite-vk-groups custom-card-img-ins rounded-circle"
                                 style="background-image: url('<?= $item->photo_200 ?>');"></div>
                        </a>
                    </div>
                    <div class="card-body">
                        <div class="mb-1" style="overflow: hidden">
                            <span class="name-infinite-vk-groups mr-1"><?= $item->name ?></span>
                        </div>
                        <div class="card-text">
                            <a href="https://vk.com/<?= $item->screen_name ?>"
                               class="ext_link-infinite-vk-groups text-muted small"
                               target="_blank"><?= $item->screen_name ?></a>
                        </div>
                    </div>
                    <div class="card-footer">
                        <?php
                        if (!$item->new) {
                            ?>
                            <div class="btn btn-block btn-infinite-vk-groups btn_1-infinite-vk-groups btn-success add_group"
                                 data-group_id="<?= $item->id ?>" title="">Подключить
                            </div>
                            <?php
                        } else {
                            ?>
                            <div class="btn btn-block btn-infinite-vk-groups btn_1-infinite-vk-groups btn-danger remove_group"
                                 data-group_id="<?= $item->new ?>" title="">Отключить
                            </div>
                            <?php
                        }
                        ?>
                    </div>
                </div>
            </div>
            <?php
        }
        ?>
    </div>
</div>