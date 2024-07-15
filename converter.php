<?php
$id = rand();
$inputFileName = $id . '.txt';
$inputFilePath = 'files/input/' . $inputFileName;
$outputUserDir = $id;
$outputDirPath = sprintf("files/output/%s/", $outputUserDir);

// リクエストデータ取得
$req_json = file_get_contents('php://input');
$req = json_decode($req_json, true);

$umlText = $req['umlText'];
$format = $req['format'];
$format = ($format === 'png' || $format === 'svg') ? $format : 'png';
$download = $req['download'];

// UMLファイル作成
file_put_contents($inputFilePath, $umlText, LOCK_EX);

// UMLファイルから画像ファイル作成
$command = sprintf(
  "java -jar plantuml.jar %s -o \"%s\" -%s -failfast2 2>&1",
  $inputFilePath,
  str_replace('files', '..', $outputDirPath),
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
  $command = 'ls ' . $outputDirPath;
  $output = null;
  $retval = null;
  exec($command, $output, $retval);
  $outputFileName = $output[0];
  $outputFilePath = $outputDirPath . $output[0];

  $imageData = file_get_contents($outputFilePath);
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
exec(sprintf("[ -e \"%s\" ] && rm %s", $inputFilePath, $inputFilePath));
exec(sprintf("[ -d \"%s\" ] && rm -rf %s", $outputDirPath, $outputDirPath));
?>
