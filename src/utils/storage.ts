import { Flashcard, Mnemonic, MemoryPalace, LinkChain, FirstLetterAid, Revision, StudyTask, ExamPlan, StudyMaterial, GamificationState, AppNotification, MemoryLink } from '../types';

export interface BackupData {
  version: string;
  timestamp: string;
  studyTasks?: StudyTask[];
  mnemonics?: Mnemonic[];
  memoryPalaces?: MemoryPalace[];
  linkChains?: LinkChain[];
  storyChains?: LinkChain[];
  firstLetterEntries?: FirstLetterAid[];
  flashcards?: Flashcard[];
  revisions?: Revision[];
  examPlans?: ExamPlan[];
  studyMaterials?: StudyMaterial[];
  gamification?: GamificationState;
  notifications?: AppNotification[];
  memoryLinks?: MemoryLink[];
}

// Complete JSON Export
export function exportToJSON(data: BackupData) {
  const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
    JSON.stringify(data, null, 2)
  )}`;
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', jsonString);
  downloadAnchor.setAttribute('download', `memoryshaastra_backup_${new Date().toISOString().split('T')[0]}.json`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// Complete JSON Import Validator
export function validateAndParseBackup(jsonStr: string): BackupData {
  const parsed = JSON.parse(jsonStr) as BackupData;
  if (!parsed || typeof parsed !== 'object') {
    throw new Error('Invalid backup file structure: Root is not an object.');
  }
  // Basic sanity checks
  if (parsed.flashcards && !Array.isArray(parsed.flashcards)) throw new Error('Invalid backup: flashcards must be an array.');
  if (parsed.mnemonics && !Array.isArray(parsed.mnemonics)) throw new Error('Invalid backup: mnemonics must be an array.');
  if (parsed.memoryPalaces && !Array.isArray(parsed.memoryPalaces)) throw new Error('Invalid backup: memoryPalaces must be an array.');
  return parsed;
}

// CSV Flashcard Export Helper
export function exportFlashcardsToCSV(flashcards: Flashcard[]) {
  const headers = ['Question', 'Answer', 'Subject', 'Chapter', 'Difficulty', 'EaseFactor', 'Interval'];
  const rows = flashcards.map(card => [
    card.question.replace(/"/g, '""'),
    card.answer.replace(/"/g, '""'),
    (card.subject || '').replace(/"/g, '""'),
    (card.chapter || '').replace(/"/g, '""'),
    card.difficulty,
    card.easeFactor.toString(),
    card.interval.toString()
  ]);

  const csvContent = [
    headers.join(','),
    ...rows.map(e => e.map(val => `"${val}"`).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const downloadAnchor = document.createElement('a');
  downloadAnchor.setAttribute('href', url);
  downloadAnchor.setAttribute('download', `memoryshaastra_flashcards_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(downloadAnchor);
  downloadAnchor.click();
  downloadAnchor.remove();
}

// CSV Flashcard Import Parser
export function parseFlashcardsFromCSV(csvText: string): Partial<Flashcard>[] {
  const lines = csvText.split('\n');
  if (lines.length < 2) return [];

  const flashcards: Partial<Flashcard>[] = [];
  
  // Custom simple CSV cell parser supporting quotes
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cells: string[] = [];
    let insideQuote = false;
    let currentCell = '';

    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"') {
        if (insideQuote && line[j + 1] === '"') {
          currentCell += '"'; // Escaped quote
          j++;
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === ',' && !insideQuote) {
        cells.push(currentCell.trim());
        currentCell = '';
      } else {
        currentCell += char;
      }
    }
    cells.push(currentCell.trim());

    if (cells.length >= 2 && cells[0] && cells[1]) {
      flashcards.push({
        id: Math.random().toString(36).substring(2, 11),
        question: cells[0],
        answer: cells[1],
        subject: cells[2] || undefined,
        chapter: cells[3] || undefined,
        difficulty: (cells[4] === 'easy' || cells[4] === 'hard' ? cells[4] : 'medium') as 'easy' | 'medium' | 'hard',
        easeFactor: parseFloat(cells[5]) || 2.5,
        interval: parseInt(cells[6], 10) || 0,
        nextReview: new Date().toISOString()
      });
    }
  }

  return flashcards;
}
