# plantuml-server

![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?logo=javascript&logoColor=black)
![PHP](https://img.shields.io/badge/PHP-777BB4?logo=php&logoColor=white)

## URL

https://pus.d-andoh.com

## About

このプログラムは、PlantUMLのテキストをUML図にリアルタイムで変換し、プレビュー表示します。
変換されたUML図は、PNG、またはSVG形式でダウンロードすることも可能です。

## Demo

![demo](./docs/demo.gif)

## Development

### Set Up

1. PlantUML CLIプログラムダウンロード

[ダウンロードページ](https://plantuml.com/ja/download)からダウンロードします。
`plantuml.jar` というファイル名でプロジェクト直下に配置してください。

2. ローカルサーバー起動

```
$ cd plantuml-server
$ php -S localhost:8000 -t public
```

### References

- [PlantUML](https://plantuml.com/ja/)
- [PlantUML CLI](https://plantuml.com/ja/command-line)
