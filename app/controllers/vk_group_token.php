<?php
$arr = ['status'=>'ok'];
ob_start();
if (isset($_GET['code'])) {
        $group = new Groups();
        $group->VkGet($_GET['code'],$_GET['state']);
} else {
    $arr['status']='error';
    $arr['message']='Ошибка при выдаче доступа. Не получен код';
}
ob_end_clean();
?>
<script type="text/javascript">
    <?php if ($arr['status']=='ok') { ?>
    window.opener.postMessage({
        act: 'SendVkTokenGroup',
        vk_group_id: <?=$group->id?>
    }, window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port : ''));
    <?php } else { ?>
    window.opener.postMessage({
        act: 'ErrorVkTokenGroup',
        message: '<?=$arr['message']?>'
    }, window.location.protocol+'//'+window.location.hostname+(window.location.port ? ':'+window.location.port : ''));
    <?php } ?>
    window.close();
</script>