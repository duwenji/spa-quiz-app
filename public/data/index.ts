import { Question, QuizSet } from '../types';
import quizSetsMetadata from './quizSets.json';

export interface QuizSetWithQuestions extends QuizSet {
  questions: Question[];
}

// 型安全なクイズセットメタデータ
const typedQuizSetsMetadata = quizSetsMetadata as { quizSets: QuizSet[] };

// クイズセットの質問データをキャッシュするマップ
const questionDataCache = new Map<string, Question[]>();

/**
 * クイズセットの質問データを動的に読み込む
 */
const loadQuizSetQuestions = async (dataPath: string): Promise<Question[]> => {
  // キャッシュがあればそれを返す
  if (questionDataCache.has(dataPath)) {
    return questionDataCache.get(dataPath)!;
  }

  try {
    console.log(`Loading quiz set data from: ${dataPath}`);
    
    // Viteの BASE_URL を使用してベースパスを正確に取得
    // import.meta.env.BASE_URL は vite.config.ts の base 設定値
    const baseUrl = import.meta.env.BASE_URL; // '/' (dev) or '/spa-quiz-app/' (prod)
    
    // pathsToTry: publicフォルダ内のデータにアクセス
    const pathsToTry = [
      // 推奨: ベースURLを含めた絶対パス
      `${baseUrl}data/${dataPath}`,
      // フォールバック: /data/で始まるパス
      `/data/${dataPath}`,
    ];
    
    console.log('Base URL:', baseUrl);
    console.log('Paths to try:', pathsToTry);
    
    let lastError: Error | null = null;
    for (const path of pathsToTry) {
      try {
        console.log(`Trying path: ${path}`);
        const response = await fetch(path);
        console.log(`Response status: ${response.status} ${response.statusText}`);
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const questions = data.questions || [];
        
        // 型チェック
        if (!Array.isArray(questions)) {
          console.warn(`Invalid questions data format in ${dataPath}`);
          continue;
        }

        // データ形式の変換（JSONの形式をQuestion型に合わせる）
        const transformedQuestions: Question[] = questions.map((q: any) => {
          // optionsにidフィールドがない場合は追加
          const transformedOptions = (q.options || []).map((opt: any, index: number) => ({
            id: ['A', 'B', 'C', 'D'][index] as 'A' | 'B' | 'C' | 'D',
            text: opt.text || '',
          }));

          // correctAnswer フィールドを直接使用
          let correctAnswer: 'A' | 'B' | 'C' | 'D' = 'A'; // デフォルト値
          
          if (q.correctAnswer && ['A', 'B', 'C', 'D'].includes(q.correctAnswer)) {
            correctAnswer = q.correctAnswer as 'A' | 'B' | 'C' | 'D';
          }

          return {
            id: q.id || 0,
            question: q.question || '',
            options: transformedOptions,
            correctAnswer,
            explanation: q.explanation || '',
          } as Question;
        });

        console.log(`✓ Successfully loaded ${transformedQuestions.length} questions from ${path}`);
        // キャッシュに保存
        questionDataCache.set(dataPath, transformedQuestions);
        return transformedQuestions;
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.log(`✗ Failed with path ${path}: ${lastError.message}`);
        continue;
      }
    }
    
    // すべてのパスが失敗した場合
    console.error(`✗ All paths failed for ${dataPath}`);
    if (lastError) {
      console.error('Last error:', lastError.message);
    }
    throw lastError || new Error(`All paths failed for ${dataPath}`);
  } catch (error) {
    console.error(`Failed to load quiz set data from ${dataPath}:`, error);
    console.error('Error details:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack');
    return [];
  }
};

/**
 * すべてのクイズセットを取得
 */
export const getAllQuizSets = (): QuizSet[] => {
  return typedQuizSetsMetadata.quizSets;
};

/**
 * クイズセットIDに対応するクイズセットと質問を取得
 */
export const getQuizSetWithQuestions = async (quizSetId: string): Promise<QuizSetWithQuestions | null> => {
  const quizSet = typedQuizSetsMetadata.quizSets.find(q => q.id === quizSetId);
  if (!quizSet) {
    return null;
  }

  const questions = await loadQuizSetQuestions(quizSet.dataPath);
  return {
    ...quizSet,
    questions,
  };
};

/**
 * クイズセットIDに対応する質問のみを取得
 */
export const getQuizSetQuestions = async (quizSetId: string): Promise<Question[]> => {
  const quizSet = typedQuizSetsMetadata.quizSets.find(q => q.id === quizSetId);
  if (!quizSet) {
    return [];
  }

  return await loadQuizSetQuestions(quizSet.dataPath);
};

/**
 * すべてのクイズセットと質問を事前に読み込む（オプション）
 */
export const preloadAllQuizSets = async (): Promise<void> => {
  const promises = typedQuizSetsMetadata.quizSets.map(async (quizSet) => {
    await loadQuizSetQuestions(quizSet.dataPath);
  });
  await Promise.all(promises);
};
