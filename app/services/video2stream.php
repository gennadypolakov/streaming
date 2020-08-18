<?php
define('AppDir', __DIR__ .'/..');
include AppDir . '/includes/init.php';

$query = "SELECT sk.value AS `key`, v.file AS video, v.id AS video_id FROM streams AS s
            JOIN video2stream AS v2s ON v2s.stream_id = s.id
            JOIN videos AS v ON v.id = v2s.video_id
            JOIN stream_keys AS sk ON sk.user_id = s.buyer
            WHERE s.start <= ? AND s.end >= ?
";
$time = time();
$stream = $db->prepare($query);
$stream->bind_param('ii', $time, $time);
$stream->execute();
$stream->bind_result($key, $video, $video_id);

$streams = [];
while($stream->fetch()) {
    $streams[] = [
        'key' => $key,
        'video' => $video,
        'video_id' => $video_id
    ];
}
$stream->close();

for($i = 0; $i < count($streams); $i++){
    $active_pid = new Streams();
    $active_pid->table_name = 'stream_pid';
    $active_pid->options = ['order' => '`id` ASC'];
    $active_pid->GetItems([ 'video_id' => $streams[$i]['video_id'] ]);
    // $query = "SELECT `pid` FROM `stream_pid` WHERE `video_id` = ? ";
    // $p_id = $db->prepare($query);
    // $p_id->bind_param('i', $streams[$i]['video_id']);
    // $p_id->execute();
    // $p_id->bind_result($stream_pid);
    $cntn = false;
    // while($p_id->fetch()){
    for($j = 0; $j < $active_pid->count; $j++){
        echo $active_pid->items[$j]['pid'] . "\n";
        // echo shell_exec('ps -p ' . $stream_pid . ' -o comm=');
        if(trim(shell_exec('ps -p ' . $active_pid->items[$j]['pid'] . ' -o comm=')) == 'ffmpeg') {
        // if (shell_exec("ps aux | grep " . $stream_pid . " | wc -l") > 0) {
            echo 'ffmpeg ' . $active_pid->items[$j]['pid'] . "\n";
            $cntn = true;
        } else $active_pid->Delete($active_pid->items[$j]['id']);
        // else if (!mysqli_query($db, "DELETE FROM `stream_pid` WHERE `pid` = " . (int) $stream_pid)){
        //     echo mysqli_error($db) . "\n";
        // }
    }
    // $p_id->close();
    if($cntn) continue;

    $video_path = AppDir . '/../public/upload/videos/' . $streams[$i]['video'];
    echo $video_path . "\n";
    echo $streams[$i]['key'] . "\n";
    if(file_exists($video_path)){
        $cmd =

                'ffmpeg -re -i '
                . $video_path

                // . ' -vcodec libx264 -pix_fmt yuv420p -preset medium -r 30 -g 60 -b:v 2500k'
                // . ' -acodec libmp3lame -ar 44100 -threads 6 -qscale 3 -b:a 712000 -bufsize 512k'
                // . ' -f flv rtmp://139.59.151.101/live/'

                . ' -s hd1080 -f flv rtmp://' . $rtmp_host . '/live/'

                // . ' -vcodec libx264 -acodec copy -f flv rtmp://139.59.151.101/live/'

                // .' -acodec libmp3lame  -ar 44100 -b:a 128k -pix_fmt yuv420p -profile:v baseline -s 426x240 -bufsize 2048k -vb 400k -maxrate 800k -deinterlace -vcodec libx264 -preset medium -g 30 -r 30 -f flv rtmp://139.59.151.101/live/'

                . $streams[$i]['key']
                . ' >> /var/www/www-root/data/www/streamvi.ru/app/services/cron_php.log 2>&1 & echo $!';

                echo $cmd . "\n";
        $PID = shell_exec($cmd);
        $PID = (int) trim($PID);
        // if(posix_kill((int) trim($PID), 0)){
        // if (file_exists("/proc/$PID")){
        if (shell_exec("ps aux | grep " . $PID . " | wc -l") > 0) {
            $query = "SELECT * FROM `stream_pid` WHERE `pid` = ? ";
            $new_pid = $db->prepare($query);
            $new_pid->bind_param('i', $PID);
            $new_pid->execute();
            $count_pid = $new_pid->num_rows();
            $new_pid->close();
            echo $count_pid . "\n";
            if($count_pid == 0){
                echo '$streams[$i][\'video_id\'] ' . $streams[$i]['video_id'] . "\n";
                echo '$PID ' . $PID . "\n";
                $query = "INSERT INTO `stream_pid` (`video_id`, `pid`) VALUES (?, ?)";
                $newpid = $db->prepare($query);
                $newpid->bind_param('ii', $streams[$i]['video_id'], $PID);
                $newpid->execute();
                $newpid->close();
            }
        }
    }
}


$query = "SELECT sp.id AS id, sp.pid AS pid FROM stream_pid AS sp
            JOIN videos AS v ON v.id = sp.video_id
            JOIN video2stream AS v2s ON v2s.video_id = v.id
            JOIN streams AS s ON v2s.stream_id = s.id
            WHERE s.end <= ?
";
$kill_pid = $db->prepare($query);
$kill_pid->bind_param('i', $time);
$kill_pid->execute();
$kill_pid->bind_result($id, $pid);
$kill_pids = [];
while($kill_pid->fetch()) {
    $kill_pids[] = [
        'id' => $id,
        'pid' => $pid
    ];
}
$kill_pid->close();


for($i = 0; $i < count($kill_pids); $i++){
    if (file_exists('/proc/' . $kill_pids[$i]['pid'])) {
        shell_exec('kill -9 ' . $kill_pids[$i]['pid']);
    }
    $query = "DELETE FROM stream_pid WHERE id = ?";
    $del_pid = $db->prepare($query);
    $del_pid->bind_param('i', $kill_pids[$i]['id']);
    $del_pid->execute();
    $del_pid->close();
}

?>
