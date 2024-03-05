#!/usr/bin/env node

/**
 * 행정표준코드관리시스템에서 제공하는 법정동 코드 전체 자료 tsv 파일을 json으로 변환하는 패키지.
 * npx lcj 호출 시 현재 패키지에 포함된 tsv 파일을 json으로 변환해 process.cwd()에 저장하며,
 * import 해서 사용 시 parseCodeTsvToJson를 이용해 tsv 내용을 json 객체로 반환 받을 수 있다.
 * 
 * @author r3n
 * @since 2023. 02. 26.
 * @see https://www.code.go.kr/stdcode/regCodeL.do
 */

const fs = require('fs');
const path = require('path');

function removeTailCode(code) {
  if (typeof code !== 'string') {
    return '??';
  }

  const replaced = code.replace(/0+$/, '');
  return replaced.length % 2 === 0 ? replaced : replaced + '0';
}

function extractName(area) {
  const nameTokens = area.fullName.split(' ');
  if (area.fullCode === area.cityCode + '00000000' || nameTokens.length == 1) {
    return nameTokens[0];
  } else if (area.fullCode === area.cityCode + area.gunCode + '000000' || nameTokens.length === 2) {
    return nameTokens[1];
  } else {
    return nameTokens.slice(2).join(' ');
  }
}

/**
 * 법정동코드 tsv 파일을 json 객체로 반환.
 * 반환하는 json 구조는 
 * {
 *  fullCode: 법정동 코드. tsv 파일 첫 번째 컬럼,
 *  fullName: 법정동명. tsv 파일 두 번째 컬럼,
 *  cityCode: 법정동 시 코드. 2자리,
 *  subCode: 법정동 군/구 코드. 3자리, 
 *  sub2Code: 법정동 읍/면 코드. 3자리,
 *  code: 법정동 리 코드. 2자리,
 *  name: 법정동명. 시군구 전체 명칭에서 현재 code에 해당하는 세부 지역명. 서울특별시 종로구 적선동이라면 적선동을, 서울특별시 종로구라면 종로구를 반환,
 *  type: 시/군/구/읍/면/리. 서울특별시 코드라면 시, 대구광역시 북구 코드라면 구를 반환,
 *  isAlive: boolean, 폐지 여부. true: tsv 파일 세 번째 컬럼값이 존재인 경우.
 * }
 * 
 * @param filePath 변환 대상 tsv 파일 경로. 미입력 시 202207 기준 공시지가 파일을 이용해 생성.
 * @returns tsv > json
 */
function parseCodeTsvToJson(filePath) {
  if (!filePath) {
    filePath = path.join(__dirname, 'assets', 'legal_code_202207.tsv');
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const rows = fileContent.trim().split('\n');
    const parsed = rows.map(row => row.split('\t'))
      .filter((cols, i) => i > 0) // 첫 번째 라인은 타이틀.
      .map(cols => {
        const area = {
          fullCode: cols[0],
          fullName: cols[1],
          cityCode: cols[0].substring(0, 2),
          subCode: cols[0].substring(2, 5),
          sub2Code: cols[0].substring(5, 8),
          code: cols[0].substring(8),
          isAlive: cols[2].trim() === '존재'
        }
        area.name = extractName(area);
        area.type = area.name.substring(area.name.length - 1);

        return area;
      });

    return parsed;
  } catch (err) {
    console.error('Error reading file:', err);
  }
}

function saveJsonToFile(json) {
  const filePath = path.join(process.cwd(), 'legal-code.json');
  const jsonString = JSON.stringify(json, null, 2);

  fs.writeFile(filePath, jsonString, 'utf8', (err) => {
    if (err) {
      console.error('Error writing JSON file: ', err);
      return;
    }
    console.log('JSON file has been saved: ', filePath);
  });

}

if (require.main === module) {
  if (process.argv.includes('-h') || process.argv.includes('--help')) {
    console.log('USAGE');
    console.log('    인자 없이 호출 시 패키지 내부에 포함된 tsv를 json으로 반환합니다.');
    console.log('    기본 tsv는 2024.02.29. 추출되었습니다.');
    console.log('    새로운 법정동코드를 이용하고 싶은 경우는 첫 번째 인자로 법정동코드 tsv 파일의 절대 경로를 지정하세요.');
    console.log('');
    console.log('    Without arguments, the package returns the included TSV file as JSON.');
    console.log('    The default TSV was extracted on 2024.02.29.');
    console.log('    If you want to use a new legal district code,');
    console.log('    please specify the absolute path of the legal district code TSV file as the first argument.');
  } else {
    let [, , tsvFilePath] = process.argv;

    const parsed = parseCodeTsvToJson(tsvFilePath);
    saveJsonToFile(parsed);
  }
}

module.exports = { parseCodeTsvToJson, lcj: parseCodeTsvToJson };
