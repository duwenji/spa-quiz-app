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
    // fetch APIを使用してJSONファイルを読み込む（動的インポートの問題を回避）
    console.log(`Loading quiz set data from: ${dataPath}`);
    
    // Vite開発サーバーでは/publicではなく/srcから直接提供される
    // 絶対パスと相対パスの両方を試す
    // baseパス '/spa-quiz-app/' を考慮する
    // 現在のページのベースURLを動的に取得
    const basePath = window.location.pathname.includes('/spa-quiz-app/') ? '/spa-quiz-app' : '';
    const pathsToTry = [
      `/src/data/${dataPath}`,
      `${basePath}/src/data/${dataPath}`,
      `/spa-quiz-app/src/data/${dataPath}`,
      `./src/data/${dataPath}`,
      `./${dataPath}`,
      `${dataPath}`
    ];
    
    console.log('Base path:', basePath);
    console.log('Paths to try:', pathsToTry);
    
    let lastError = null;
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

        console.log(`Successfully loaded ${questions.length} questions from ${path}`);
        // キャッシュに保存
        questionDataCache.set(dataPath, questions as Question[]);
        return questions as Question[];
      } catch (err) {
        lastError = err;
        console.log(`Failed with path ${path}:`, err instanceof Error ? err.message : String(err));
        console.log(`Error stack:`, err instanceof Error ? err.stack : 'No stack');
        continue;
      }
    }
    
    // すべてのパスが失敗した場合
    console.error(`All paths failed for ${dataPath}`);
    console.error('Last error:', lastError);
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
