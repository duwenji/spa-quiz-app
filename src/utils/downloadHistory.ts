import { LearningHistory } from '../types';

export const downloadAsJSON = (
  history: LearningHistory,
  filename: string = `learning-history-${new Date().toISOString()}.json`
) => {
  const jsonString = JSON.stringify(history, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const downloadAsCSV = (
  history: LearningHistory,
  filename: string = `learning-history-${new Date().toISOString()}.csv`
) => {
  const headers = ['問題ID', '選択答', '正解', '正誤', '解答時間(ms)', '回答日時'];
  const rows = history.answers.map(answer => [
    answer.questionId,
    answer.selectedAnswer || 'N/A',
    answer.correctAnswer,
    answer.isCorrect ? '正解' : '不正解',
    answer.answerTime,
    answer.answeredAt,
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
  ].join('\n');

  const bom = new Uint8Array([0xef, 0xbb, 0xbf]); // UTF-8 BOM
  const blob = new Blob([bom, csvContent], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export const generateAIAnalysisPrompt = (history: LearningHistory): string => {
  const correctCount = history.totalCorrect;
  const totalCount = correctCount + history.totalWrong;
  const correctRate = ((correctCount / totalCount) * 100).toFixed(2);

  return `以下のJSON形式の学習データを分析してください。ユーザーはGitHub Copilot関連の知識習得問題に挑戦しています。

[学習データ]
${JSON.stringify(history, null, 2)}

分析項目：
1. **成績サマリー**: 全体の正解率（${correctRate}%）、正解数/全問題数
2. **苦手分野トップ3**: 不正解が多かった分野・テーマの特定
3. **強化すべき領域**: Copilot Chat、スラッシュコマンド、チャット変数などのカテゴリー別分析
4. **学習パターン**: 解答時間の傾向（平均: ${(history.averageAnswerTime / 1000).toFixed(1)}秒）
5. **具体的な学習提案**: 改善に向けた具体的な勉強方法や復習の優先順位

結果をわかりやすいレポート形式でお願いします。`;
};
