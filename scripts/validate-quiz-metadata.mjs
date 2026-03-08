#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Ajv from 'ajv';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ajv = new Ajv();

const args = process.argv.slice(2);

const metadataFilePath = args[0] 
  ? path.resolve(args[0]) 
  : path.join(__dirname, '../src/data/quizSets.json');

try {
  // メタデータ JSON ファイルを読み込み
  const metadataData = JSON.parse(fs.readFileSync(metadataFilePath, 'utf-8'));

  // スキーマを読み込み
  const metadataSchemaPath = path.join(__dirname, '../public/schemas/quizset-metadata-schema.json');
  const metadataSchema = JSON.parse(fs.readFileSync(metadataSchemaPath, 'utf-8'));

  // validate 関数を作成
  const validateMetadata = ajv.compile(metadataSchema);

  let hasErrors = false;
  let validCount = 0;

  if (!Array.isArray(metadataData.quizSets)) {
    console.error('❌ Error: "quizSets" field must be an array');
    process.exit(1);
  }

  metadataData.quizSets.forEach((quizSet, index) => {
    const valid = validateMetadata(quizSet);

    if (!valid) {
      hasErrors = true;
      console.error(`\n❌ Quiz Set ${index + 1} (ID: ${quizSet.id}) has errors:`);
      validateMetadata.errors?.forEach(error => {
        console.error(`   - ${error.dataPath || 'root'}: ${error.message}`);
      });
    } else {
      validCount++;
    }
  });

  if (!hasErrors) {
    console.log(`✓ All ${validCount} quiz set metadata entries are valid!`);
    process.exit(0);
  } else {
    console.log(`\n🔴 Validation failed for some entries. ${validCount} valid, ${metadataData.quizSets.length - validCount} invalid.`);
    process.exit(1);
  }
} catch (error) {
  console.error(`❌ Error reading or parsing file: ${error instanceof Error ? error.message : String(error)}`);
  process.exit(1);
}
