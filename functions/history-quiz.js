'use strict';

const csvSync = require('csv-parse/lib/sync');
const fs = require('fs');
const path = require('path');

const FILE_QUESTIONS = path.join(__dirname, 'questions.csv');
const PLACEHOLDER = '<break time="300ms"/>まるまる<break time="300ms"/>'

function readFile(path) {
  let questions = [];

  let csvOption = {
    quote: '"',
    ltrim: true,
    rtrim: true,
    delimiter: ',',
    relax_column_count: true,
  };

  // CSVを読み込み、問題と回答に分ける
  let data = csvSync(fs.readFileSync(path, "utf8"), csvOption);
  data.forEach(element => {
    let question = {
      sentence: element[0],
      answers: element.slice(1, element.length),
    }
    questions.push(question);
  });
  
  return questions;
}
  
function getRandomItem(array) {
  let randomNumber = Math.floor(Math.random() * array.length);
  return array[randomNumber];
}
  
exports.create = function () {
  // 問題・回答を読み込む
  const questions = readFile(FILE_QUESTIONS);

  // ランダムに問題・回答を選出する
  let question = getRandomItem(questions);

  // 問題文の回答部分をプレースホルダで置き換える
  const answer = getRandomItem(question.answers);
  const replacedSentence = question.sentence.replace(answer, PLACEHOLDER);
  
  return {
    question: replacedSentence,
    answer: answer,
  };
};
