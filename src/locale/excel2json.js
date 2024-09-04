const xlsx2json = require('xlsx-to-json');
const path = require('path');
const fs = require('fs');

xlsx2json(
  {
    input: path.join(__dirname, './i18n.xlsx'),
    output: path.join(__dirname, './i18n.json'),
    // sheet:"default"
  },
  function (err, result) {
    if (err) {
      console.error(err);
    } else {
      console.log(result);
      const filesList = {};
      // 初始化数据
      Object.keys(result[0]).forEach((col) => {
        if (col !== 'short') {
          filesList[col] = {};
        }
      });
      // 数据分类
      result.forEach((item) => {
        Object.keys(item).forEach((col) => {
          if (col !== 'short') {
            filesList[col][item.short] = item[col];
          }
        });
      });
      console.log('filesList', filesList);
      //数据保存
      Object.keys(filesList).forEach((item) => {
        fs.writeFile(
          path.join(__dirname, `./lang/${item}.json`),
          JSON.stringify(filesList[item]),
          (err, data) => {
            if (err) {
              console.log('json生成失败!!! ');
            } else {
              console.log('json生成成功 ');
            }
          }
        );
      });
    }
  }
);
