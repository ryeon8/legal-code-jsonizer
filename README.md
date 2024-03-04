# legal-code-jsonizer
- https://www.code.go.kr/stdcode/regCodeL.do 에서 제공하는 법정동코드 tsv 파일을 json 파일로 저장하거나 객체로 반환하는 패키지입니다.
- tsv 파일 경로 미지정 시 2024.02.29. 기준 다운로드된 기본 tsv 파일을 이용해 내용을 반환합니다.

## CLI USAGE
```
npm i legal-code-jsonizer
npx lcj {선택: 법정동코드 tsv 파일 경로}
```

## CODE USAGE
```
const { parseCodeTsvToJson } = require('legal-code-jsonizer');
const json = parseCodeTsvToJson(path.join(__dirname, '선택: 법정동코드 tsv 파일 경로'));
```