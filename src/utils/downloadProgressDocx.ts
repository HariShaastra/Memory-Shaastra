import { 
  Document, 
  Packer, 
  Paragraph, 
  TextRun, 
  HeadingLevel, 
  Table, 
  TableCell, 
  TableRow, 
  BorderStyle, 
  WidthType,
  AlignmentType
} from 'docx';

interface ProgressData {
  userName: string;
  generatedDate: string;
  overallProgress: number;
  personalization: {
    targetExamName: string;
    targetExamDate: string;
    focusSubject: string;
    dailyStudyGoalHours: number;
  };
  studyTasks: Array<{ topic: string; subject: string; plannedDate: string; completed: boolean }>;
  flashcards: Array<{ question: string; answer: string; difficulty: string }>;
  mnemonics: Array<{ title: string; phrase: string }>;
  memoryPalaces: Array<{ name: string; locationCount: number }>;
  linkChains: Array<{ title: string; items: string[] }>;
  storyChains: Array<{ title: string; story: string }>;
  firstLetterEntries: Array<{ title: string; mnemonic: string }>;
  scheduledRevisions: Array<{ itemTitle: string; dueDate: string; intervalDays: number; completed: boolean }>;
}

export async function downloadProgressAsWordDoc(data: ProgressData) {
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // Header / Title
          new Paragraph({
            text: 'Maanas Shaastra — Student Progress Report',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 300 }
          }),

          new Paragraph({
            children: [
              new TextRun({ text: `Student Name: `, bold: true }),
              new TextRun({ text: `${data.userName}\n` }),
              new TextRun({ text: `Date Generated: `, bold: true }),
              new TextRun({ text: `${data.generatedDate}\n` }),
              new TextRun({ text: `Target Exam: `, bold: true }),
              new TextRun({ text: `${data.personalization.targetExamName} (${data.personalization.targetExamDate})\n` }),
              new TextRun({ text: `Focus Subject: `, bold: true }),
              new TextRun({ text: `${data.personalization.focusSubject}\n` }),
              new TextRun({ text: `Overall Progress: `, bold: true }),
              new TextRun({ text: `${data.overallProgress}% Completed`, color: 'EA580C', bold: true })
            ],
            spacing: { after: 400 }
          }),

          // Section 1: Study Schedule Tasks
          new Paragraph({
            text: '1. Study Schedule Tasks',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 200 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Topic', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Subject', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Date', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true })] })] })
                ]
              }),
              ...data.studyTasks.map(task => 
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(task.topic)] }),
                    new TableCell({ children: [new Paragraph(task.subject)] }),
                    new TableCell({ children: [new Paragraph(task.plannedDate)] }),
                    new TableCell({ children: [new Paragraph(task.completed ? 'COMPLETED' : 'Pending')] })
                  ]
                })
              )
            ]
          }),

          // Section 2: Memory Skills Inventory
          new Paragraph({
            text: '2. Created Memory Tools & Techniques',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),

          // Flashcards
          new Paragraph({
            children: [
              new TextRun({ text: `Flashcards (${data.flashcards.length} items):\n`, bold: true })
            ]
          }),
          ...data.flashcards.map(f => 
            new Paragraph({
              children: [
                new TextRun({ text: `• Q: `, bold: true }),
                new TextRun({ text: `${f.question} | A: ${f.answer}` })
              ],
              spacing: { after: 100 }
            })
          ),

          // Mnemonics
          new Paragraph({
            children: [
              new TextRun({ text: `\nMnemonics (${data.mnemonics.length} items):\n`, bold: true })
            ]
          }),
          ...data.mnemonics.map(m => 
            new Paragraph({
              children: [
                new TextRun({ text: `• ${m.title}: `, bold: true }),
                new TextRun({ text: `"${m.phrase}"` })
              ],
              spacing: { after: 100 }
            })
          ),

          // Memory Palaces
          new Paragraph({
            children: [
              new TextRun({ text: `\nMemory Palaces (${data.memoryPalaces.length} items):\n`, bold: true })
            ]
          }),
          ...data.memoryPalaces.map(p => 
            new Paragraph({
              children: [
                new TextRun({ text: `• Palace: `, bold: true }),
                new TextRun({ text: `${p.name} (${p.locationCount} loci locations)` })
              ],
              spacing: { after: 100 }
            })
          ),

          // First Letter Method
          new Paragraph({
            children: [
              new TextRun({ text: `\nFirst Letter Method Aids (${data.firstLetterEntries.length} items):\n`, bold: true })
            ]
          }),
          ...data.firstLetterEntries.map(fl => 
            new Paragraph({
              children: [
                new TextRun({ text: `• ${fl.title}: `, bold: true }),
                new TextRun({ text: `"${fl.mnemonic}"` })
              ],
              spacing: { after: 100 }
            })
          ),

          // Section 3: Spaced Repetition Calendar Schedule
          new Paragraph({
            text: '3. Calendar & Spaced Revision Schedule',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 400, after: 200 }
          }),
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Revision Task', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Due Date', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Interval', bold: true })] })] }),
                  new TableCell({ children: [new Paragraph({ children: [new TextRun({ text: 'Status', bold: true })] })] })
                ]
              }),
              ...data.scheduledRevisions.map(rev => 
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph(rev.itemTitle)] }),
                    new TableCell({ children: [new Paragraph(rev.dueDate)] }),
                    new TableCell({ children: [new Paragraph(`${rev.intervalDays} Days`)] }),
                    new TableCell({ children: [new Paragraph(rev.completed ? 'COMPLETED' : 'Pending')] })
                  ]
                })
              )
            ]
          }),

          // Footer
          new Paragraph({
            text: '\nGenerated by Maanas Shaastra AI Study Companion.',
            alignment: AlignmentType.CENTER,
            spacing: { before: 500 }
          })
        ]
      }
    ]
  });

  const blob = await Packer.toBlob(doc);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${data.userName.replace(/\s+/g, '_')}_Study_Progress_${new Date().toISOString().split('T')[0]}.docx`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
