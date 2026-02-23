#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, '../src/data');

/**
 * IDを文字列から数値に変換する
 * ca-001 -> 1, q1 -> 1, step1-foundation-001 -> 1 など
 */
function extractNumericId(id) {
  if (typeof id === 'number') return id;
  if (typeof id !== 'string') return null;
  
  // 数字だけを抽出
  const match = id.match(/\d+/);
  return match ? parseInt(match[0], 10) : null;
}

/**
 * JSONファイルをクイズID形式に正規化する
 */
function normalizeQuizFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);
    
    // questionsキーがある場合（標準形式）
    if (data.questions && Array.isArray(data.questions)) {
      let hasChanges = false;
      
      data.questions = data.questions.map((q, index) => {
        const normalized = { ...q };
        
        // IDを数値化
        if (typeof normalized.id === 'string') {
          const numId = extractNumericId(normalized.id);
          if (numId !== null) {
            normalized.id = numId;
            hasChanges = true;
          }
        }
        // IDがない場合はインデックス+1
        if (!normalized.id && typeof normalized.id !== 'number') {
          normalized.id = index + 1;
          hasChanges = true;
        }
        
        // correctOptionIndexをcorrectAnswerに変換
        if (typeof normalized.correctOptionIndex === 'number' && !normalized.correctAnswer) {
          const answers = ['A', 'B', 'C', 'D'];
          normalized.correctAnswer = answers[normalized.correctOptionIndex];
          delete normalized.correctOptionIndex;
          hasChanges = true;
        }
        
        return normalized;
      });
      
      if (hasChanges) {
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
        console.log(`✓ Updated: ${path.relative(process.cwd(), filePath)}`);
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error(`✗ Failed to process ${filePath}:`, error.message);
    return false;
  }
}

/**
 * ディレクトリ内のすべてのJSONファイルを処理（再帰）
 */
function normalizeDirectory(dir) {
  const files = fs.readdirSync(dir);
  let updatedCount = 0;
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      // サブディレクトリを再帰処理
      updatedCount += normalizeDirectory(filePath);
    } else if (stat.isFile() && file.endsWith('.json')) {
      if (normalizeQuizFile(filePath)) {
        updatedCount++;
      }
    }
  });
  
  return updatedCount;
}

console.log('🔄 Normalizing quiz data IDs...\n');
const updated = normalizeDirectory(dataDir);
console.log(`\n✅ Complete! Updated ${updated} file(s).`);
