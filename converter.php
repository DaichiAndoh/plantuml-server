<?php
$UML_FILE_PATH = './files/input/uml.txt';
$UML_IMAGE_OUTPUT_DIR_PATH = '../output';
$UML_IMAGE_OUTPUT_FILE_PATH = './files/output/[fileName]';

// リクエストデータ取得
$req_json = file_get_contents('php://input');
$req = json_decode($req_json, true);

$uml = $req['uml'];
$format = $req['format'];
$download = $req['download'];

// UMLファイル作成
file_put_contents($UML_FILE_PATH, $uml, LOCK_EX);

// UMLファイルから画像ファイル作成
$command = sprintf(
  "java -jar plantuml.jar %s -o \"%s\" -%s -failfast2 2>&1",
  $UML_FILE_PATH,
  $UML_IMAGE_OUTPUT_DIR_PATH,
  $format  
);
$output = null;
$retval = null;
exec($command, $output, $retval);

// 実行結果確認
$success = true;
foreach ($output as $line) {
  if (
    strpos($line, 'no image') !== false ||
    strpos($line, 'error') !== false
  ) {
    $success = false;
    break;
  }
}

// レスポンス
if ($success) {
  $command = 'ls ./files/output';
  $output = null;
  $retval = null;
  exec($command, $output, $retval);
  $fileName = $output[0];

  $imageData = file_get_contents(str_replace('[fileName]', $fileName , $UML_IMAGE_OUTPUT_FILE_PATH));
  $base64 = base64_encode($imageData);

  if ($download) {
    header('Content-Type: application/json');
    echo json_encode(['success' => $success, 'image' => $base64]);
  } else {
    $imageSrc = sprintf("data:image/%s;base64,%s", $format, $base64);
    header('Content-Type: application/json');
    echo json_encode(['success' => $success, 'image' => $imageSrc]);
  }
} else {
  header('Content-Type: application/json');
  echo json_encode(['success' => $success]);
}

// 画像ファイル削除
exec('rm ./files/output/*');
?>
