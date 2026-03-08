#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ajv = new Ajv();

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node validate-quiz-questions.mjs <quiz-file-path>');
  process.exit(1);
}

const quizFilePath = path.resolve(args[0]);

try {
  // Quiz JSON ファイルを読み込み
  const quizData = JSON.parse(fs.readFileSync(quizFilePath, 'utf-8'));

  // スキーマを読み込み
  const questionSchemaPath = path.join(__dirname, '../public/schemas/question-schema.json');
  const questionSchema = JSON.parse(fs.readFileSync(questionSchemaPath, 'utf-8'));

  // validate 関数を作成
  const validateQuestion = ajv.compile(questionSchema);

  let hasErrors = false;

  if (!Array.isArray(quizData.questions)) {
    console.error('❌ Error: "questions" field must be an array');
    process.exit(1);
  }

  quizData.questions.forEach((question, index) => {
    const valid = validateQuestion(question);

    if (!valid) {
      hasErrors = true;
      console.error(`\n❌ Question ${index + 1} (ID: ${question.id}) has errors:`);
      validateQuestion.errors?.forEach(error => {
        console.error(`   - ${error.dataPath || 'root'}: ${error.message}`);
      });
    }
  });

  if (!hasErrors) {
    console.log(`✓ All ${quizData.questions.length} questions are valid!`);
    process.exit(0);
  } else {
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ Error reading or parsing file: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
