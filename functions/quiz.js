'use strict';

const csvSync = require('csv-parse/lib/sync');
const fs = require('fs');
const path = require('path');

const FILE_NAME = "politics.csv";
const FILE_QUESTIONS = path.join(__dirname, FILE_NAME);
const PLACEHOLDER = '<break time="300ms"/>まるまる<break time="300ms"/>'

let loadedQuestions = [];

function readFile(path) {
  let questions = [];
  let csvOption = {
    quote: '"',
    ltrim: true,
    rtrim: true,
    delimiter: ',',
    relax_column_count: true,
  };

  // Separate CSV into questions & answers
  let data = csvSync(fs.readFileSync(path, "utf8"), csvOption);
  data.forEach(element => {
    let question = {
      sentence: element[0],
      answers: element.slice(1, element.length - 1),
    }
    questions.push(question);
  });

  return questions;
}

function getRandomItem(array) {
  let randomNumber = Math.floor(Math.random() * array.length);
  return array[randomNumber];
}

const create = () => {
  if (loadedQuestions.length == 0) {
    loadedQuestions = readFile(FILE_QUESTIONS);
  }

  // Pick questions at random
  let question = getRandomItem(loadedQuestions);

  // Replace the answer with placeholder
  const answer = getRandomItem(question.answers);
  const replacedSentence = question.sentence.replace(answer, PLACEHOLDER);

  return {
    question: replacedSentence,
    answer: answer,
  };
};

module.exports = { create };
