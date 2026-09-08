import 'dotenv/config';
import * as bcrypt from 'bcrypt';

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is not defined');
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

type QuestionSeed = {
  text: string;
  difficulty: number;
  expectedAnswer: string;
  expectedSteps: string[];
  commonMistakes: string[];
  hints: string[];
  skills: {
    code: string;
    weight: number;
  }[];
};

async function createOrUpdateQuestion(
  chapterId: number,
  topicId: number,
  questionData: QuestionSeed,
  skillMap: Map<string, number>,
) {
  const existingQuestion = await prisma.question.findFirst({
    where: {
      chapterId,
      text: questionData.text,
    },
  });

  const skills = questionData.skills.map((item) => {
    const skillId = skillMap.get(item.code);

    if (!skillId) {
      throw new Error(`Skill not found: ${item.code}`);
    }

    return {
      skillId,
      weight: item.weight,
    };
  });

  const hints = questionData.hints.map((text, index) => ({
    level: index + 1,
    text,
  }));

  if (existingQuestion) {
    return prisma.question.update({
      where: {
        id: existingQuestion.id,
      },

      data: {
        difficulty: questionData.difficulty,
        questionType: 'STEP_BASED',

        expectedAnswer: questionData.expectedAnswer,

        expectedSteps: questionData.expectedSteps,

        commonMistakes: questionData.commonMistakes,

        isActive: true,

        topicId,

        skills: {
          deleteMany: {},
          create: skills,
        },

        hints: {
          deleteMany: {},
          create: hints,
        },
      },
    });
  }

  return prisma.question.create({
    data: {
      text: questionData.text,

      difficulty: questionData.difficulty,

      questionType: 'STEP_BASED',

      expectedAnswer: questionData.expectedAnswer,

      expectedSteps: questionData.expectedSteps,

      commonMistakes: questionData.commonMistakes,

      isActive: true,

      chapterId,

      topicId,

      skills: {
        create: skills,
      },

      hints: {
        create: hints,
      },
    },
  });
}

async function main() {
  console.log('🌱 Starting Gyanivo AI seed...');

  // =====================================================
  // BOARD
  // =====================================================

  const board = await prisma.board.upsert({
    where: {
      code: 'CBSE',
    },

    update: {
      name: 'Central Board of Secondary Education',
    },

    create: {
      name: 'Central Board of Secondary Education',
      code: 'CBSE',
    },
  });

  // =====================================================
  // CLASS
  // =====================================================

  const class7 = await prisma.schoolClass.upsert({
    where: {
      boardId_level: {
        boardId: board.id,
        level: 7,
      },
    },

    update: {
      name: 'Class 7',
    },

    create: {
      name: 'Class 7',
      level: 7,
      boardId: board.id,
    },
  });

  // =====================================================
  // SUBJECT
  // =====================================================

  const maths = await prisma.subject.upsert({
    where: {
      classId_code: {
        classId: class7.id,
        code: 'MATH',
      },
    },

    update: {
      name: 'Mathematics',
    },

    create: {
      name: 'Mathematics',
      code: 'MATH',
      classId: class7.id,
    },
  });

  // =====================================================
  // CHAPTER
  // =====================================================

  const chapter = await prisma.chapter.upsert({
    where: {
      subjectId_order: {
        subjectId: maths.id,
        order: 1,
      },
    },

    update: {
      name: 'Simple Equations',
    },

    create: {
      name: 'Simple Equations',
      order: 1,
      subjectId: maths.id,
    },
  });

  // =====================================================
  // TOPIC
  // =====================================================

  let topic = await prisma.topic.findFirst({
    where: {
      chapterId: chapter.id,
      name: 'Solving Simple Equations',
    },
  });

  if (!topic) {
    topic = await prisma.topic.create({
      data: {
        name: 'Solving Simple Equations',
        chapterId: chapter.id,
      },
    });
  }

  // =====================================================
  // SKILLS
  // =====================================================

  const skillDefinitions = [
    {
      name: 'Inverse Operations',
      code: 'inverse_operations',
      description:
        'Understanding opposite operations while solving equations.',
    },

    {
      name: 'Sign Handling',
      code: 'sign_handling',
      description:
        'Correct handling of positive and negative signs.',
    },

    {
      name: 'Division',
      code: 'division',
      description:
        'Using division correctly to isolate a variable.',
    },

    {
      name: 'Multiplication',
      code: 'multiplication',
      description:
        'Using multiplication correctly while solving equations.',
    },

    {
      name: 'Variable Isolation',
      code: 'variable_isolation',
      description:
        'Moving toward getting the unknown variable alone.',
    },

    {
      name: 'Distribution',
      code: 'distribution',
      description:
        'Expanding expressions using distributive property.',
    },

    {
      name: 'Variables On Both Sides',
      code: 'variables_both_sides',
      description:
        'Solving equations where variables occur on both sides.',
    },

    {
      name: 'Fraction Operations',
      code: 'fraction_operations',
      description:
        'Working with division and fractional forms in equations.',
    },
  ];

  const skillMap = new Map<string, number>();

  for (const definition of skillDefinitions) {
    const skill = await prisma.skill.upsert({
      where: {
        code: definition.code,
      },

      update: {
        name: definition.name,
        description: definition.description,
        topicId: topic.id,
      },

      create: {
        name: definition.name,
        code: definition.code,
        description: definition.description,
        topicId: topic.id,
      },
    });

    skillMap.set(skill.code, skill.id);
  }

  // =====================================================
  // DEMO STUDENT
  // =====================================================

  const student = await prisma.student.upsert({
    where: {
      email: 'demo@gyanivo.ai',
    },

    update: {
      name: 'Demo Student',
      classLevel: 7,
    },

    create: {
      name: 'Demo Student',
      email: 'demo@gyanivo.ai',
      classLevel: 7,
    },
  });

  console.log(`👨‍🎓 Student ready: ${student.name}`);

  // =====================================================
  // 30 QUESTIONS
  // =====================================================

  const questions: QuestionSeed[] = [
    // ===================================================
    // EASY - 10
    // ===================================================

    {
      text: 'Solve: x + 5 = 12',
      difficulty: 1,
      expectedAnswer: 'x = 7',

      expectedSteps: [
        'x + 5 = 12',
        'x = 12 - 5',
        'x = 7',
      ],

      commonMistakes: [
        'x = 12 + 5',
        'x = 17',
      ],

      hints: [
        'Think about the opposite operation of +5.',
        'Subtract 5 from both sides.',
        'Now simplify the right side.',
      ],

      skills: [
        {
          code: 'inverse_operations',
          weight: 1,
        },
        {
          code: 'sign_handling',
          weight: 0.6,
        },
      ],
    },

    {
      text: 'Solve: x - 4 = 9',
      difficulty: 1,
      expectedAnswer: 'x = 13',

      expectedSteps: [
        'x - 4 = 9',
        'x = 9 + 4',
        'x = 13',
      ],

      commonMistakes: [
        'x = 9 - 4',
        'x = 5',
      ],

      hints: [
        'What is the opposite operation of subtracting 4?',
        'Add 4 to both sides.',
        'Now simplify.',
      ],

      skills: [
        {
          code: 'inverse_operations',
          weight: 1,
        },
        {
          code: 'sign_handling',
          weight: 0.7,
        },
      ],
    },

    {
      text: 'Solve: 2x = 14',
      difficulty: 1,
      expectedAnswer: 'x = 7',

      expectedSteps: [
        '2x = 14',
        'x = 14 / 2',
        'x = 7',
      ],

      commonMistakes: [
        'x = 14 * 2',
        'x = 28',
      ],

      hints: [
        'x is multiplied by 2.',
        'Use the opposite operation of multiplication.',
        'Divide 14 by 2.',
      ],

      skills: [
        {
          code: 'division',
          weight: 1,
        },
        {
          code: 'variable_isolation',
          weight: 0.8,
        },
      ],
    },

    {
      text: 'Solve: 3x = 18',
      difficulty: 1,
      expectedAnswer: 'x = 6',

      expectedSteps: [
        '3x = 18',
        'x = 18 / 3',
        'x = 6',
      ],

      commonMistakes: [
        'x = 18 * 3',
        'x = 54',
      ],

      hints: [
        '3 is multiplying x.',
        'What is the opposite of multiplication?',
        'Divide both sides by 3.',
      ],

      skills: [
        {
          code: 'division',
          weight: 1,
        },
        {
          code: 'variable_isolation',
          weight: 0.8,
        },
      ],
    },

    {
      text: 'Solve: x / 4 = 5',
      difficulty: 1,
      expectedAnswer: 'x = 20',

      expectedSteps: [
        'x / 4 = 5',
        'x = 5 * 4',
        'x = 20',
      ],

      commonMistakes: [
        'x = 5 / 4',
      ],

      hints: [
        'x is being divided by 4.',
        'Use the opposite operation of division.',
        'Multiply 5 by 4.',
      ],

      skills: [
        {
          code: 'multiplication',
          weight: 1,
        },
        {
          code: 'fraction_operations',
          weight: 0.8,
        },
      ],
    },

    {
      text: 'Solve: x + 9 = 20',
      difficulty: 1,
      expectedAnswer: 'x = 11',

      expectedSteps: [
        'x + 9 = 20',
        'x = 20 - 9',
        'x = 11',
      ],

      commonMistakes: [
        'x = 20 + 9',
        'x = 29',
      ],

      hints: [
        'Remove +9 using its opposite operation.',
        'Subtract 9 from both sides.',
        'Simplify 20 - 9.',
      ],

      skills: [
        {
          code: 'inverse_operations',
          weight: 1,
        },
      ],
    },

    {
      text: 'Solve: x - 7 = 8',
      difficulty: 1,
      expectedAnswer: 'x = 15',

      expectedSteps: [
        'x - 7 = 8',
        'x = 8 + 7',
        'x = 15',
      ],

      commonMistakes: [
        'x = 8 - 7',
        'x = 1',
      ],

      hints: [
        'What operation reverses -7?',
        'Add 7 to both sides.',
        'Now calculate 8 + 7.',
      ],

      skills: [
        {
          code: 'inverse_operations',
          weight: 1,
        },
        {
          code: 'sign_handling',
          weight: 0.8,
        },
      ],
    },

    {
      text: 'Solve: 5x = 25',
      difficulty: 1,
      expectedAnswer: 'x = 5',

      expectedSteps: [
        '5x = 25',
        'x = 25 / 5',
        'x = 5',
      ],

      commonMistakes: [
        'x = 25 * 5',
      ],

      hints: [
        '5 is multiplied by x.',
        'Divide both sides by 5.',
        'Calculate 25 divided by 5.',
      ],

      skills: [
        {
          code: 'division',
          weight: 1,
        },
      ],
    },

    {
      text: 'Solve: x / 3 = 6',
      difficulty: 1,
      expectedAnswer: 'x = 18',

      expectedSteps: [
        'x / 3 = 6',
        'x = 6 * 3',
        'x = 18',
      ],

      commonMistakes: [
        'x = 6 / 3',
      ],

      hints: [
        'x is divided by 3.',
        'Reverse division using multiplication.',
        'Multiply 6 by 3.',
      ],

      skills: [
        {
          code: 'multiplication',
          weight: 1,
        },
        {
          code: 'fraction_operations',
          weight: 0.8,
        },
      ],
    },

    {
      text: 'Solve: 4 + x = 15',
      difficulty: 1,
      expectedAnswer: 'x = 11',

      expectedSteps: [
        '4 + x = 15',
        'x = 15 - 4',
        'x = 11',
      ],

      commonMistakes: [
        'x = 15 + 4',
      ],

      hints: [
        'Remove 4 from the left side.',
        'Subtract 4 from both sides.',
        'Simplify 15 - 4.',
      ],

      skills: [
        {
          code: 'inverse_operations',
          weight: 1,
        },
        {
          code: 'variable_isolation',
          weight: 0.7,
        },
      ],
    },

    // ===================================================
    // MEDIUM - 10
    // ===================================================

    {
      text: 'Solve: 3x + 6 = 21',
      difficulty: 2,
      expectedAnswer: 'x = 5',

      expectedSteps: [
        '3x + 6 = 21',
        '3x = 21 - 6',
        '3x = 15',
        'x = 15 / 3',
        'x = 5',
      ],

      commonMistakes: [
        '3x = 21 + 6',
        'x = 15 * 3',
      ],

      hints: [
        'First remove +6.',
        'Subtract 6 from both sides.',
        'After reaching 3x = 15, isolate x.',
      ],

      skills: [
        {
          code: 'inverse_operations',
          weight: 1,
        },
        {
          code: 'division',
          weight: 1,
        },
        {
          code: 'variable_isolation',
          weight: 0.8,
        },
      ],
    },

    {
      text: 'Solve: 4x - 5 = 19',
      difficulty: 2,
      expectedAnswer: 'x = 6',

      expectedSteps: [
        '4x - 5 = 19',
        '4x = 19 + 5',
        '4x = 24',
        'x = 24 / 4',
        'x = 6',
      ],

      commonMistakes: [
        '4x = 19 - 5',
        'x = 24 * 4',
      ],

      hints: [
        'Undo -5 first.',
        'Add 5 to both sides.',
        'Then divide by the coefficient of x.',
      ],

      skills: [
        {
          code: 'inverse_operations',
          weight: 1,
        },
        {
          code: 'sign_handling',
          weight: 0.8,
        },
        {
          code: 'division',
          weight: 1,
        },
      ],
    },

    {
      text: 'Solve: 2x + 7 = 25',
      difficulty: 2,
      expectedAnswer: 'x = 9',

      expectedSteps: [
        '2x + 7 = 25',
        '2x = 25 - 7',
        '2x = 18',
        'x = 18 / 2',
        'x = 9',
      ],

      commonMistakes: [
        '2x = 25 + 7',
        'x = 18 * 2',
      ],

      hints: [
        'Remove +7 first.',
        'Subtract 7 from both sides.',
        'Then divide both sides by 2.',
      ],

      skills: [
        {
          code: 'inverse_operations',
          weight: 1,
        },
        {
          code: 'division',
          weight: 1,
        },
      ],
    },

    {
      text: 'Solve: 5x - 10 = 30',
      difficulty: 2,
      expectedAnswer: 'x = 8',

      expectedSteps: [
        '5x - 10 = 30',
        '5x = 30 + 10',
        '5x = 40',
        'x = 40 / 5',
        'x = 8',
      ],

      commonMistakes: [
        '5x = 30 - 10',
      ],

      hints: [
        'Undo subtraction of 10.',
        'Add 10 to both sides.',
        'Divide by 5 after simplifying.',
      ],

      skills: [
        {
          code: 'sign_handling',
          weight: 0.8,
        },
        {
          code: 'inverse_operations',
          weight: 1,
        },
        {
          code: 'division',
          weight: 1,
        },
      ],
    },

    {
      text: 'Solve: x / 3 + 4 = 10',
      difficulty: 2,
      expectedAnswer: 'x = 18',

      expectedSteps: [
        'x / 3 + 4 = 10',
        'x / 3 = 10 - 4',
        'x / 3 = 6',
        'x = 6 * 3',
        'x = 18',
      ],

      commonMistakes: [
        'x / 3 = 10 + 4',
        'x = 6 / 3',
      ],

      hints: [
        'Remove +4 first.',
        'Then look at x divided by 3.',
        'Reverse division with multiplication.',
      ],

      skills: [
        {
          code: 'fraction_operations',
          weight: 1,
        },
        {
          code: 'multiplication',
          weight: 1,
        },
        {
          code: 'inverse_operations',
          weight: 0.8,
        },
      ],
    },

    {
      text: 'Solve: x / 5 - 2 = 4',
      difficulty: 2,
      expectedAnswer: 'x = 30',

      expectedSteps: [
        'x / 5 - 2 = 4',
        'x / 5 = 4 + 2',
        'x / 5 = 6',
        'x = 6 * 5',
        'x = 30',
      ],

      commonMistakes: [
        'x / 5 = 4 - 2',
      ],

      hints: [
        'Undo -2 first.',
        'Add 2 to both sides.',
        'Then multiply both sides by 5.',
      ],

      skills: [
        {
          code: 'fraction_operations',
          weight: 1,
        },
        {
          code: 'multiplication',
          weight: 1,
        },
      ],
    },

    {
      text: 'Solve: 7 + 2x = 23',
      difficulty: 2,
      expectedAnswer: 'x = 8',

      expectedSteps: [
        '7 + 2x = 23',
        '2x = 23 - 7',
        '2x = 16',
        'x = 16 / 2',
        'x = 8',
      ],

      commonMistakes: [
        '2x = 23 + 7',
      ],

      hints: [
        'Remove 7 from the left side.',
        'Subtract 7 from both sides.',
        'Divide by 2 after simplifying.',
      ],

      skills: [
        {
          code: 'inverse_operations',
          weight: 1,
        },
        {
          code: 'variable_isolation',
          weight: 1,
        },
      ],
    },

    {
      text: 'Solve: 30 = 3x + 6',
      difficulty: 2,
      expectedAnswer: 'x = 8',

      expectedSteps: [
        '30 = 3x + 6',
        '24 = 3x',
        'x = 24 / 3',
        'x = 8',
      ],

      commonMistakes: [
        '36 = 3x',
        'x = 24 * 3',
      ],

      hints: [
        'Remove +6.',
        'Subtract 6 from both sides.',
        'Then divide by 3.',
      ],

      skills: [
        {
          code: 'variable_isolation',
          weight: 1,
        },
        {
          code: 'division',
          weight: 1,
        },
      ],
    },

    {
      text: 'Solve: 6x + 4 = 40',
      difficulty: 2,
      expectedAnswer: 'x = 6',

      expectedSteps: [
        '6x + 4 = 40',
        '6x = 40 - 4',
        '6x = 36',
        'x = 36 / 6',
        'x = 6',
      ],

      commonMistakes: [
        '6x = 44',
      ],

      hints: [
        'First remove +4.',
        'Subtract 4.',
        'Then divide by 6.',
      ],

      skills: [
        {
          code: 'inverse_operations',
          weight: 1,
        },
        {
          code: 'division',
          weight: 1,
        },
      ],
    },

    {
      text: 'Solve: 8x - 12 = 28',
      difficulty: 2,
      expectedAnswer: 'x = 5',

      expectedSteps: [
        '8x - 12 = 28',
        '8x = 28 + 12',
        '8x = 40',
        'x = 40 / 8',
        'x = 5',
      ],

      commonMistakes: [
        '8x = 28 - 12',
      ],

      hints: [
        'Undo -12.',
        'Add 12 to both sides.',
        'Divide by 8.',
      ],

      skills: [
        {
          code: 'sign_handling',
          weight: 1,
        },
        {
          code: 'division',
          weight: 1,
        },
      ],
    },

    // ===================================================
    // HARD - 10
    // ===================================================

    {
      text: 'Solve: 5x + 3 = 2x + 18',
      difficulty: 3,
      expectedAnswer: 'x = 5',

      expectedSteps: [
        '5x + 3 = 2x + 18',
        '3x + 3 = 18',
        '3x = 15',
        'x = 15 / 3',
        'x = 5',
      ],

      commonMistakes: [
        '7x + 3 = 18',
      ],

      hints: [
        'Bring variable terms to one side.',
        'Subtract 2x from both sides.',
        'Then remove +3.',
      ],

      skills: [
        {
          code: 'variables_both_sides',
          weight: 1,
        },
        {
          code: 'variable_isolation',
          weight: 1,
        },
      ],
    },

    {
      text: 'Solve: 7x - 4 = 3x + 20',
      difficulty: 3,
      expectedAnswer: 'x = 6',

      expectedSteps: [
        '7x - 4 = 3x + 20',
        '4x - 4 = 20',
        '4x = 24',
        'x = 24 / 4',
        'x = 6',
      ],

      commonMistakes: [
        '10x - 4 = 20',
      ],

      hints: [
        'Move the smaller variable term.',
        'Subtract 3x from both sides.',
        'Then undo -4.',
      ],

      skills: [
        {
          code: 'variables_both_sides',
          weight: 1,
        },
        {
          code: 'sign_handling',
          weight: 0.8,
        },
      ],
    },

    {
      text: 'Solve: 2(x + 3) = 18',
      difficulty: 3,
      expectedAnswer: 'x = 6',

      expectedSteps: [
        '2(x + 3) = 18',
        '2x + 6 = 18',
        '2x = 12',
        'x = 12 / 2',
        'x = 6',
      ],

      commonMistakes: [
        '2x + 3 = 18',
      ],

      hints: [
        'Expand the bracket first.',
        'Multiply both terms inside by 2.',
        'Then solve the resulting equation.',
      ],

      skills: [
        {
          code: 'distribution',
          weight: 1,
        },
        {
          code: 'variable_isolation',
          weight: 0.8,
        },
      ],
    },

    {
      text: 'Solve: 3(x - 2) = 21',
      difficulty: 3,
      expectedAnswer: 'x = 9',

      expectedSteps: [
        '3(x - 2) = 21',
        '3x - 6 = 21',
        '3x = 27',
        'x = 27 / 3',
        'x = 9',
      ],

      commonMistakes: [
        '3x - 2 = 21',
      ],

      hints: [
        'Distribute 3 inside the bracket.',
        'Remember that 3 multiplies both terms.',
        'Then isolate x.',
      ],

      skills: [
        {
          code: 'distribution',
          weight: 1,
        },
        {
          code: 'sign_handling',
          weight: 0.8,
        },
      ],
    },

    {
      text: 'Solve: 4x + 5 = 2x + 17',
      difficulty: 3,
      expectedAnswer: 'x = 6',

      expectedSteps: [
        '4x + 5 = 2x + 17',
        '2x + 5 = 17',
        '2x = 12',
        'x = 12 / 2',
        'x = 6',
      ],

      commonMistakes: [
        '6x + 5 = 17',
      ],

      hints: [
        'Move 2x to the left.',
        'Subtract 2x from both sides.',
        'Then remove +5.',
      ],

      skills: [
        {
          code: 'variables_both_sides',
          weight: 1,
        },
      ],
    },

    {
      text: 'Solve: 6x - 8 = 4x + 10',
      difficulty: 3,
      expectedAnswer: 'x = 9',

      expectedSteps: [
        '6x - 8 = 4x + 10',
        '2x - 8 = 10',
        '2x = 18',
        'x = 18 / 2',
        'x = 9',
      ],

      commonMistakes: [
        '10x - 8 = 10',
      ],

      hints: [
        'Move the variable terms together.',
        'Subtract 4x from both sides.',
        'Then undo -8.',
      ],

      skills: [
        {
          code: 'variables_both_sides',
          weight: 1,
        },
        {
          code: 'sign_handling',
          weight: 0.8,
        },
      ],
    },

    {
      text: 'Solve: 5(x + 2) = 35',
      difficulty: 3,
      expectedAnswer: 'x = 5',

      expectedSteps: [
        '5(x + 2) = 35',
        '5x + 10 = 35',
        '5x = 25',
        'x = 25 / 5',
        'x = 5',
      ],

      commonMistakes: [
        '5x + 2 = 35',
      ],

      hints: [
        'Expand the bracket.',
        'Multiply both x and 2 by 5.',
        'Then isolate x.',
      ],

      skills: [
        {
          code: 'distribution',
          weight: 1,
        },
        {
          code: 'division',
          weight: 0.8,
        },
      ],
    },

    {
      text: 'Solve: 2(x - 4) + 6 = 12',
      difficulty: 3,
      expectedAnswer: 'x = 7',

      expectedSteps: [
        '2(x - 4) + 6 = 12',
        '2x - 8 + 6 = 12',
        '2x - 2 = 12',
        '2x = 14',
        'x = 14 / 2',
        'x = 7',
      ],

      commonMistakes: [
        '2x - 4 + 6 = 12',
      ],

      hints: [
        'Expand the bracket first.',
        'Combine the constant terms.',
        'Then isolate the variable.',
      ],

      skills: [
        {
          code: 'distribution',
          weight: 1,
        },
        {
          code: 'sign_handling',
          weight: 1,
        },
      ],
    },

    {
      text: 'Solve: 3x + 9 = 6x - 12',
      difficulty: 3,
      expectedAnswer: 'x = 7',

      expectedSteps: [
        '3x + 9 = 6x - 12',
        '9 = 3x - 12',
        '21 = 3x',
        'x = 21 / 3',
        'x = 7',
      ],

      commonMistakes: [
        '9 = 9x - 12',
      ],

      hints: [
        'Move 3x from the left side.',
        'Then move -12 to the other side.',
        'Finally divide by 3.',
      ],

      skills: [
        {
          code: 'variables_both_sides',
          weight: 1,
        },
        {
          code: 'sign_handling',
          weight: 1,
        },
      ],
    },

    {
      text: 'Solve: 4(x + 1) - 3 = 17',
      difficulty: 3,
      expectedAnswer: 'x = 4',

      expectedSteps: [
        '4(x + 1) - 3 = 17',
        '4x + 4 - 3 = 17',
        '4x + 1 = 17',
        '4x = 16',
        'x = 16 / 4',
        'x = 4',
      ],

      commonMistakes: [
        '4x + 1 - 3 = 17',
      ],

      hints: [
        'Expand the bracket first.',
        'Combine +4 and -3.',
        'Then isolate x.',
      ],

      skills: [
        {
          code: 'distribution',
          weight: 1,
        },
        {
          code: 'variable_isolation',
          weight: 1,
        },
      ],
    },
  ];

  let createdCount = 0;

  for (const question of questions) {
    await createOrUpdateQuestion(
      chapter.id,
      topic.id,
      question,
      skillMap,
    );

    createdCount++;
  }

  console.log(`✅ ${createdCount} questions seeded successfully.`);

  // =====================================================
  // ENTERPRISE SIH26101 FOUNDATION SEED
  // =====================================================
  await seedEnterpriseFoundation();

  console.log('🎉 Gyanivo AI Full Stack Seed Completed.');
}

async function seedEnterpriseFoundation() {
  console.log('🏛️ Starting MoSPI Enterprise Foundation Seed...');

  // 1. COMPETENCY DOMAINS
  const domainsData = [
    {
      code: 'STATISTICAL',
      name: 'Statistical Methods & Official Frameworks',
      description: 'Official statistical methodology, sampling theory, national accounts, and survey standards.',
    },
    {
      code: 'TECHNICAL',
      name: 'Technical, Computing & Spatial Analytics',
      description: 'Data science scripting, SQL databases, GIS spatial statistics, and data visualization tools.',
    },
    {
      code: 'DIGITAL_GOVERNANCE',
      name: 'Digital Governance & Public Systems',
      description: 'Cybersecurity, data privacy, digital signatures, eOffice compliance, and government cloud.',
    },
    {
      code: 'BEHAVIOURAL_MANAGERIAL',
      name: 'Behavioural & Managerial Competencies',
      description: 'Public leadership, policy communication, project management, and ethics in official statistics.',
    },
  ];

  const domainMap = new Map<string, number>();

  for (const d of domainsData) {
    const domain = await prisma.competencyDomain.upsert({
      where: { code: d.code },
      update: { name: d.name, description: d.description },
      create: { code: d.code, name: d.name, description: d.description },
    });
    domainMap.set(d.code, domain.id);
  }

  // 2. COMPETENCIES
  const competenciesData = [
    // Statistical
    { code: 'STAT_SURVEY_DESIGN', name: 'Survey Design & Field Protocols', domain: 'STATISTICAL' },
    { code: 'STAT_SAMPLING', name: 'Sampling Theory & Variance Estimation', domain: 'STATISTICAL' },
    { code: 'STAT_NATIONAL_ACCOUNTS', name: 'National Accounts & Macro Indicators', domain: 'STATISTICAL' },
    { code: 'STAT_PRICE_STATS', name: 'Price Statistics & Index Numbers (CPI/WPI)', domain: 'STATISTICAL' },
    { code: 'STAT_LABOUR_STATS', name: 'Labour & Employment Indicators (PLFS)', domain: 'STATISTICAL' },
    { code: 'STAT_AGRI_STATS', name: 'Agricultural Statistics & Crop Estimation', domain: 'STATISTICAL' },
    { code: 'STAT_INDUSTRIAL_STATS', name: 'Industrial Statistics (IIP/ASI)', domain: 'STATISTICAL' },
    { code: 'STAT_SDG_INDICATORS', name: 'Sustainable Development Goals (SDG) Framework', domain: 'STATISTICAL' },
    { code: 'STAT_METADATA_STD', name: 'Statistical Metadata & SDMX Standards', domain: 'STATISTICAL' },
    { code: 'STAT_DATA_QUALITY', name: 'Data Quality Assurance & Validation', domain: 'STATISTICAL' },

    // Technical
    { code: 'TECH_PYTHON', name: 'Python for Statistical Computing & Automation', domain: 'TECHNICAL' },
    { code: 'TECH_R', name: 'R Programming for Data Analysis', domain: 'TECHNICAL' },
    { code: 'TECH_SQL', name: 'SQL & Relational Database Querying', domain: 'TECHNICAL' },
    { code: 'TECH_STATA', name: 'Stata for Econometric Modeling', domain: 'TECHNICAL' },
    { code: 'TECH_SPSS', name: 'SPSS for Survey Analysis', domain: 'TECHNICAL' },
    { code: 'TECH_SAS', name: 'SAS Analytics Platform', domain: 'TECHNICAL' },
    { code: 'TECH_GIS', name: 'GIS & Spatial Data Analysis (QGIS/ArcGIS)', domain: 'TECHNICAL' },
    { code: 'TECH_DATA_VIZ', name: 'Data Visualization & Executive Dashboards', domain: 'TECHNICAL' },
    { code: 'TECH_AI_ML', name: 'Machine Learning & Predictive Modeling', domain: 'TECHNICAL' },
    { code: 'TECH_CLOUD', name: 'Government Cloud Infrastructure (MeghRaj)', domain: 'TECHNICAL' },
    { code: 'TECH_APIS', name: 'REST APIs & Data Dissemination Platforms', domain: 'TECHNICAL' },
    { code: 'TECH_OPEN_DATA', name: 'Open Data Standards & National Portals', domain: 'TECHNICAL' },

    // Digital Governance
    { code: 'DG_CYBERSECURITY', name: 'Cybersecurity Best Practices & ISO 27001', domain: 'DIGITAL_GOVERNANCE' },
    { code: 'DG_DATA_PRIVACY', name: 'Data Privacy & DPDP Act Compliance', domain: 'DIGITAL_GOVERNANCE' },
    { code: 'DG_DIGITAL_SIG', name: 'Digital Signatures & eSign Workflows', domain: 'DIGITAL_GOVERNANCE' },
    { code: 'DG_GOVT_CLOUD', name: 'Government Cloud Security & Compliance', domain: 'DIGITAL_GOVERNANCE' },
    { code: 'DG_DPI', name: 'Digital Public Infrastructure & India Stack', domain: 'DIGITAL_GOVERNANCE' },

    // Behavioural & Managerial
    { code: 'BM_LEADERSHIP', name: 'Strategic Leadership & Team Guidance', domain: 'BEHAVIOURAL_MANAGERIAL' },
    { code: 'BM_COMMUNICATION', name: 'Statistical Communication & Report Writing', domain: 'BEHAVIOURAL_MANAGERIAL' },
    { code: 'BM_PROJECT_MGMT', name: 'Project Planning & Survey Management', domain: 'BEHAVIOURAL_MANAGERIAL' },
    { code: 'BM_ETHICS', name: 'Ethics & Professional Integrity in Public Statistics', domain: 'BEHAVIOURAL_MANAGERIAL' },
    { code: 'BM_DECISION_MAKING', name: 'Evidence-Based Decision Making', domain: 'BEHAVIOURAL_MANAGERIAL' },
    { code: 'BM_CHANGE_MGMT', name: 'Change Management & Digital Adoption', domain: 'BEHAVIOURAL_MANAGERIAL' },
  ];

  const competencyMap = new Map<string, number>();

  for (const c of competenciesData) {
    const domainId = domainMap.get(c.domain)!;
    const comp = await prisma.competency.upsert({
      where: { code: c.code },
      update: { name: c.name, domainId },
      create: {
        code: c.code,
        name: c.name,
        domainId,
        proficiencyScaleMin: 1,
        proficiencyScaleMax: 100,
      },
    });
    competencyMap.set(c.code, comp.id);
  }

  // 3. DEPARTMENTS
  const departmentsData = [
    { code: 'NSO', name: 'National Statistical Office', description: 'Apex statistical organisation of India.' },
    { code: 'FOD', name: 'Field Operations Division', description: 'Large-scale sample survey operations across states.' },
    { code: 'SDRD', name: 'Survey Design and Research Division', description: 'Sample survey methodology and questionnaire design.' },
    { code: 'ESD', name: 'Economic Statistics Division', description: 'Compilation of industrial statistics, IIP and ASI.' },
    { code: 'CPD', name: 'Coordination and Publication Division', description: 'Statistical dissemination, publications and international relations.' },
  ];

  const deptMap = new Map<string, number>();

  for (const d of departmentsData) {
    const dept = await prisma.department.upsert({
      where: { code: d.code },
      update: { name: d.name, description: d.description },
      create: { code: d.code, name: d.name, description: d.description },
    });
    deptMap.set(d.code, dept.id);
  }

  // 4. JOB ROLES
  const jobRolesData = [
    { code: 'STAT_OFFICER', name: 'Statistical Officer', deptCode: 'NSO', level: 1 },
    { code: 'SR_STAT_OFFICER', name: 'Senior Statistical Officer', deptCode: 'NSO', level: 2 },
    { code: 'DATA_ANALYST', name: 'Data Analyst', deptCode: 'SDRD', level: 1 },
    { code: 'FIELD_INVESTIGATOR', name: 'Field Investigator', deptCode: 'FOD', level: 1 },
    { code: 'JOINT_DIRECTOR', name: 'Joint Director', deptCode: 'CPD', level: 3 },
  ];

  const roleMap = new Map<string, number>();

  for (const r of jobRolesData) {
    const deptId = deptMap.get(r.deptCode);
    const role = await prisma.jobRole.upsert({
      where: { code: r.code },
      update: { name: r.name, departmentId: deptId, level: r.level },
      create: { code: r.code, name: r.name, departmentId: deptId, level: r.level },
    });
    roleMap.set(r.code, role.id);
  }

  // 5. ROLE REQUIREMENTS (Statistical Officer Benchmarks)
  const statOfficerId = roleMap.get('STAT_OFFICER')!;
  const requirements = [
    { code: 'STAT_SAMPLING', target: 80, isMandatory: true },
    { code: 'STAT_SURVEY_DESIGN', target: 75, isMandatory: true },
    { code: 'TECH_PYTHON', target: 70, isMandatory: true },
    { code: 'TECH_SQL', target: 65, isMandatory: true },
    { code: 'TECH_GIS', target: 60, isMandatory: true },
    { code: 'DG_DATA_PRIVACY', target: 55, isMandatory: true },
    { code: 'BM_COMMUNICATION', target: 60, isMandatory: false },
  ];

  for (const req of requirements) {
    const compId = competencyMap.get(req.code);
    if (compId) {
      await prisma.roleCompetencyRequirement.upsert({
        where: {
          jobRoleId_competencyId: {
            jobRoleId: statOfficerId,
            competencyId: compId,
          },
        },
        update: { requiredScore: req.target, isMandatory: req.isMandatory },
        create: {
          jobRoleId: statOfficerId,
          competencyId: compId,
          requiredScore: req.target,
          isMandatory: req.isMandatory,
          sourceReference: 'MoSPI SSS Cadre Training Framework 2026',
        },
      });
    }
  }

  // 6. DEVELOPMENT-ONLY TEST USERS
  const defaultPasswordHash = await bcrypt.hash('DemoPassword123!', 10);

  // Employee: Rahul Sharma
  const empUser = await prisma.user.upsert({
    where: { email: 'employee.demo@local.test' },
    update: {
      firstName: 'Rahul',
      lastName: 'Sharma',
      systemRole: 'EMPLOYEE',
      status: 'ACTIVE',
      passwordHash: defaultPasswordHash,
    },
    create: {
      email: 'employee.demo@local.test',
      firstName: 'Rahul',
      lastName: 'Sharma',
      systemRole: 'EMPLOYEE',
      status: 'ACTIVE',
      passwordHash: defaultPasswordHash,
    },
  });

  const empProfile = await prisma.employeeProfile.upsert({
    where: { userId: empUser.id },
    update: {
      employeeCode: 'MOSPI-SSS-8842',
      designation: 'Statistical Officer',
      cadre: 'Subordinate Statistical Service (SSS Cadre)',
      currentAssignment: 'Consumer Price Index (CPI) Analytics Unit',
      educationalQualification: 'M.Sc. Statistics (University of Delhi)',
      experienceYears: 4.5,
      departmentId: deptMap.get('NSO'),
      jobRoleId: statOfficerId,
    },
    create: {
      userId: empUser.id,
      employeeCode: 'MOSPI-SSS-8842',
      designation: 'Statistical Officer',
      cadre: 'Subordinate Statistical Service (SSS Cadre)',
      currentAssignment: 'Consumer Price Index (CPI) Analytics Unit',
      educationalQualification: 'M.Sc. Statistics (University of Delhi)',
      experienceYears: 4.5,
      departmentId: deptMap.get('NSO'),
      jobRoleId: statOfficerId,
    },
  });

  // Initial Competencies for Employee
  const employeeScores = [
    { code: 'STAT_SAMPLING', score: 75, confidence: 0.85, evidence: 8 },
    { code: 'TECH_PYTHON', score: 38, confidence: 0.72, evidence: 4 },
    { code: 'TECH_SQL', score: 58, confidence: 0.8, evidence: 6 },
    { code: 'TECH_GIS', score: 25, confidence: 0.65, evidence: 3 },
    { code: 'DG_DATA_PRIVACY', score: 62, confidence: 0.88, evidence: 5 },
    { code: 'BM_COMMUNICATION', score: 65, confidence: 0.9, evidence: 9 },
  ];

  for (const es of employeeScores) {
    const compId = competencyMap.get(es.code);
    if (compId) {
      await prisma.employeeCompetency.upsert({
        where: {
          employeeProfileId_competencyId: {
            employeeProfileId: empProfile.id,
            competencyId: compId,
          },
        },
        update: { currentScore: es.score, confidence: es.confidence, evidenceCount: es.evidence },
        create: {
          employeeProfileId: empProfile.id,
          competencyId: compId,
          currentScore: es.score,
          confidence: es.confidence,
          evidenceCount: es.evidence,
          lastEvaluatedAt: new Date(),
        },
      });
    }
  }

  // Trainer: Dr. P. Rao
  const trainerUser = await prisma.user.upsert({
    where: { email: 'trainer.demo@local.test' },
    update: {
      firstName: 'Dr. P.',
      lastName: 'Rao',
      systemRole: 'TRAINER',
      status: 'ACTIVE',
      passwordHash: defaultPasswordHash,
    },
    create: {
      email: 'trainer.demo@local.test',
      firstName: 'Dr. P.',
      lastName: 'Rao',
      systemRole: 'TRAINER',
      status: 'ACTIVE',
      passwordHash: defaultPasswordHash,
    },
  });

  await prisma.employeeProfile.upsert({
    where: { userId: trainerUser.id },
    update: {
      employeeCode: 'NSSTA-FAC-4109',
      designation: 'Senior Faculty & Master Trainer',
      cadre: 'Indian Statistical Service (ISS)',
      currentAssignment: 'National Statistical Systems Training Academy (NSSTA)',
      educationalQualification: 'Ph.D. Econometrics & Spatial Statistics',
      experienceYears: 14,
      departmentId: deptMap.get('CPD'),
      jobRoleId: roleMap.get('JOINT_DIRECTOR'),
    },
    create: {
      userId: trainerUser.id,
      employeeCode: 'NSSTA-FAC-4109',
      designation: 'Senior Faculty & Master Trainer',
      cadre: 'Indian Statistical Service (ISS)',
      currentAssignment: 'National Statistical Systems Training Academy (NSSTA)',
      educationalQualification: 'Ph.D. Econometrics & Spatial Statistics',
      experienceYears: 14,
      departmentId: deptMap.get('CPD'),
      jobRoleId: roleMap.get('JOINT_DIRECTOR'),
    },
  });

  // Admin: Director S. Murthy
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin.demo@local.test' },
    update: {
      firstName: 'Director S.',
      lastName: 'Murthy',
      systemRole: 'ADMIN',
      status: 'ACTIVE',
      passwordHash: defaultPasswordHash,
    },
    create: {
      email: 'admin.demo@local.test',
      firstName: 'Director S.',
      lastName: 'Murthy',
      systemRole: 'ADMIN',
      status: 'ACTIVE',
      passwordHash: defaultPasswordHash,
    },
  });

  await prisma.employeeProfile.upsert({
    where: { userId: adminUser.id },
    update: {
      employeeCode: 'MOSPI-HQ-ADM-001',
      designation: 'Joint Director / Cadre Administrator',
      cadre: 'Indian Statistical Service (ISS)',
      currentAssignment: 'MoSPI Headquarters, New Delhi',
      educationalQualification: 'M.Stat. (Indian Statistical Institute)',
      experienceYears: 18,
      departmentId: deptMap.get('NSO'),
      jobRoleId: roleMap.get('JOINT_DIRECTOR'),
    },
    create: {
      userId: adminUser.id,
      employeeCode: 'MOSPI-HQ-ADM-001',
      designation: 'Joint Director / Cadre Administrator',
      cadre: 'Indian Statistical Service (ISS)',
      currentAssignment: 'MoSPI Headquarters, New Delhi',
      educationalQualification: 'M.Stat. (Indian Statistical Institute)',
      experienceYears: 18,
      departmentId: deptMap.get('NSO'),
      jobRoleId: roleMap.get('JOINT_DIRECTOR'),
    },
  });

  // Custom Super Admin: Krishna (kt103263@gmail.com)
  const krishnaPasswordHash = await bcrypt.hash('Loan12345', 10);
  const krishnaUser = await prisma.user.upsert({
    where: { email: 'kt103263@gmail.com' },
    update: {
      firstName: 'Krishna',
      lastName: 'T',
      systemRole: 'ADMIN',
      status: 'ACTIVE',
      passwordHash: krishnaPasswordHash,
    },
    create: {
      email: 'kt103263@gmail.com',
      firstName: 'Krishna',
      lastName: 'T',
      systemRole: 'ADMIN',
      status: 'ACTIVE',
      passwordHash: krishnaPasswordHash,
    },
  });

  await prisma.employeeProfile.upsert({
    where: { userId: krishnaUser.id },
    update: {
      employeeCode: 'MOSPI-SYS-ADM-001',
      designation: 'Director & Lead System Architect',
      cadre: 'Indian Statistical Service (ISS)',
      departmentId: deptMap.get('NSO'),
      jobRoleId: roleMap.get('JOINT_DIRECTOR'),
    },
    create: {
      userId: krishnaUser.id,
      employeeCode: 'MOSPI-SYS-ADM-001',
      designation: 'Director & Lead System Architect',
      cadre: 'Indian Statistical Service (ISS)',
      departmentId: deptMap.get('NSO'),
      jobRoleId: roleMap.get('JOINT_DIRECTOR'),
    },
  });

  // 7. PHASE 3 DIAGNOSTIC QUESTION BANK
  console.log('📝 Seeding Diagnostic Assessment Question Bank...');

  const questionBankData = [
    // =========================================================================
    // 1. PYTHON DATA SCIENCE & MICRODATA (TECH_PYTHON) — 15 Questions
    // =========================================================================
    // --- EASY (5 Questions) ---
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'EASY',
      questionText: 'Which Python pandas function is primarily used to load a tabular CSV data file into a DataFrame?',
      options: [
        { id: 'A', text: 'pd.read_table_csv()' },
        { id: 'B', text: 'pd.read_csv()' },
        { id: 'C', text: 'pd.import_csv()' },
        { id: 'D', text: 'pd.load_dataframe()' },
      ],
      correctOption: 'B',
      explanation: 'In pandas, pd.read_csv() is the standard and most optimized function used to read comma-separated values into a DataFrame object.',
    },
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'EASY',
      questionText: 'What is the correct syntax to view the first 5 rows of a pandas DataFrame named `df` in Python?',
      options: [
        { id: 'A', text: 'df.first(5)' },
        { id: 'B', text: 'df.top(5)' },
        { id: 'C', text: 'df.head(5)' },
        { id: 'D', text: 'df.preview(5)' },
      ],
      correctOption: 'C',
      explanation: 'df.head(n) returns the first n rows of the DataFrame, defaulting to 5 rows if n is not specified.',
    },
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'EASY',
      questionText: 'Which attribute of a pandas DataFrame returns a tuple representing the dimensional structure (rows, columns)?',
      options: [
        { id: 'A', text: 'df.size' },
        { id: 'B', text: 'df.shape' },
        { id: 'C', text: 'df.dimensions' },
        { id: 'D', text: 'df.length' },
      ],
      correctOption: 'B',
      explanation: 'df.shape returns a tuple (num_rows, num_columns) representing the dimensional layout of the DataFrame.',
    },
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'EASY',
      questionText: 'Which property should you inspect to check the data types of all columns in a pandas DataFrame?',
      options: [
        { id: 'A', text: 'df.types' },
        { id: 'B', text: 'df.dtypes' },
        { id: 'C', text: 'df.schema' },
        { id: 'D', text: 'df.col_types' },
      ],
      correctOption: 'B',
      explanation: 'df.dtypes returns a Series with the data type of each column in the DataFrame.',
    },
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'EASY',
      questionText: 'Which method generates summary statistics (count, mean, std, min, percentiles, max) for numeric columns in pandas?',
      options: [
        { id: 'A', text: 'df.summary()' },
        { id: 'B', text: 'df.describe()' },
        { id: 'C', text: 'df.stats()' },
        { id: 'D', text: 'df.overview()' },
      ],
      correctOption: 'B',
      explanation: 'df.describe() computes central tendency, dispersion, and shape of a dataset distribution excluding NaN values.',
    },

    // --- MEDIUM (5 Questions) ---
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'MEDIUM',
      questionText: 'When computing state-wise aggregated CPI index averages in pandas, which DataFrame method should be used?',
      options: [
        { id: 'A', text: 'df.groupby("State")["CPI"].mean()' },
        { id: 'B', text: 'df.aggregate_by("State", "CPI", "mean")' },
        { id: 'C', text: 'df.split_by("State")["CPI"].average()' },
        { id: 'D', text: 'df.pivot("State", values="CPI").sum()' },
      ],
      correctOption: 'A',
      explanation: 'df.groupby("Column")["Target"].mean() groups rows by the specified categorical variable and computes the mean of the numeric target column.',
    },
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'MEDIUM',
      questionText: 'How do you handle missing values in a numeric survey column `income` by replacing them with the median in pandas?',
      options: [
        { id: 'A', text: 'df["income"].replace_na(df["income"].median())' },
        { id: 'B', text: 'df["income"].fillna(df["income"].median(), inplace=True)' },
        { id: 'C', text: 'df["income"].impute_median()' },
        { id: 'D', text: 'df["income"].drop_na(value=df["income"].median())' },
      ],
      correctOption: 'B',
      explanation: 'fillna() replaces NA/NaN values using the specified value or aggregation method, and inplace=True modifies the DataFrame in place.',
    },
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'MEDIUM',
      questionText: 'Which pandas function is used to combine household demographic and expenditure survey schedules on a common key `hh_id`?',
      options: [
        { id: 'A', text: 'pd.concat([df1, df2], axis=1)' },
        { id: 'B', text: 'pd.merge(df1, df2, on="hh_id", how="left")' },
        { id: 'C', text: 'df1.append(df2, key="hh_id")' },
        { id: 'D', text: 'pd.combine(df1, df2, by="hh_id")' },
      ],
      correctOption: 'B',
      explanation: 'pd.merge() performs database-style joins on DataFrames based on one or more shared key columns.',
    },
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'MEDIUM',
      questionText: 'How should you convert a string column `survey_date` into a native datetime object for time-series CPI indexation in pandas?',
      options: [
        { id: 'A', text: 'df["survey_date"].astype("date")' },
        { id: 'B', text: 'pd.to_datetime(df["survey_date"], format="%Y-%m-%d")' },
        { id: 'C', text: 'df["survey_date"].parse_time()' },
        { id: 'D', text: 'pd.convert_date(df["survey_date"])' },
      ],
      correctOption: 'B',
      explanation: 'pd.to_datetime() parses strings into pandas Timestamp/DatetimeIndex objects with optimized ISO or custom format parsing.',
    },
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'MEDIUM',
      questionText: 'Which NumPy function allows vectorized conditional assignment similar to SQL CASE WHEN without Python for-loops?',
      options: [
        { id: 'A', text: 'np.choose()' },
        { id: 'B', text: 'np.where(condition, x, y)' },
        { id: 'C', text: 'np.select_if()' },
        { id: 'D', text: 'np.switch()' },
      ],
      correctOption: 'B',
      explanation: 'np.where(condition, x, y) returns elements chosen from x or y depending on condition in a fully vectorized C loop.',
    },

    // --- HARD (5 Questions) ---
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'HARD',
      questionText: 'When working with large NSS survey microdata exceeding RAM capacity, what is the best pandas/PyData approach for out-of-core chunk processing?',
      options: [
        { id: 'A', text: 'pd.read_csv(..., chunksize=100000) with generator iteration or Dask DataFrame' },
        { id: 'B', text: 'Increasing Python recursion limit using sys.setrecursionlimit()' },
        { id: 'C', text: 'Loading entire dataset into Python dictionary keys' },
        { id: 'D', text: 'Splitting files using string slicing in pure Python' },
      ],
      correctOption: 'A',
      explanation: 'chunksize returns an iterable TextFileReader allowing lazy batch evaluation without overflowing memory, or Dask for parallel distributed computation.',
    },
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'HARD',
      questionText: 'In high-dimensional survey weight replication (Jackknife/Bootstrap), which NumPy vectorization technique avoids Python loop bottlenecks?',
      options: [
        { id: 'A', text: 'Using numpy.vectorize() wrapper decorator' },
        { id: 'B', text: 'Multi-dimensional broadcasting and np.einsum() tensor operations' },
        { id: 'C', text: 'Iterating over numpy.nditer() with standard loops' },
        { id: 'D', text: 'Converting NumPy arrays to native Python lists for map()' },
      ],
      correctOption: 'B',
      explanation: 'Broadcasting and np.einsum() execute directly in compiled C BLAS routines without Python interpreter overhead, maximizing vectorization throughput.',
    },
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'HARD',
      questionText: 'Which Python standard library module is best suited for parallelizing CPU-bound survey data validation rules across multiple cores?',
      options: [
        { id: 'A', text: 'threading.Thread' },
        { id: 'B', text: 'concurrent.futures.ProcessPoolExecutor / multiprocessing' },
        { id: 'C', text: 'asyncio' },
        { id: 'D', text: 'queue.Queue' },
      ],
      correctOption: 'B',
      explanation: 'Python GIL prevents multi-threaded CPU-bound parallelism; ProcessPoolExecutor spawns separate OS worker processes bypassing the GIL.',
    },
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'HARD',
      questionText: 'How can you calculate the weighted Gini coefficient in NumPy efficiently from microdata survey weights and incomes?',
      options: [
        { id: 'A', text: 'Iterating pairwise differences in nested Python loops' },
        { id: 'B', text: 'Sorting by income, computing empirical cumulative weight and income distributions via np.cumsum(), and applying trapezoidal integration' },
        { id: 'C', text: 'Using scipy.stats.kurtosis() directly' },
        { id: 'D', text: 'Applying standard variance formula without ordering' },
      ],
      correctOption: 'B',
      explanation: 'Vectorized Lorenz curve trapezoidal integration via cumulative sums on sorted array achieves O(n log n) complexity instead of O(n^2).',
    },
    {
      compCode: 'TECH_PYTHON',
      difficulty: 'HARD',
      questionText: 'To drastically reduce memory footprint of a 50-million row survey DataFrame with repetitive state codes and small integers, what is the best strategy?',
      options: [
        { id: 'A', text: 'Downcasting float64 to float32, int64 to int16/int8, and string columns to category dtype' },
        { id: 'B', text: 'Converting all numbers to Python strings' },
        { id: 'C', text: 'Disabling pandas garbage collection' },
        { id: 'D', text: 'Storing columns as JSON strings' },
      ],
      correctOption: 'A',
      explanation: 'Categorical dtypes store integers mapped to a unique category dictionary, and downcasting integer/float widths reduces memory consumption by 70-85%.',
    },

    // =========================================================================
    // 2. GIS & SPATIAL DATA ANALYSIS (TECH_GIS) — 15 Questions
    // =========================================================================
    // --- EASY (5 Questions) ---
    {
      compCode: 'TECH_GIS',
      difficulty: 'EASY',
      questionText: 'What coordinate reference system (CRS) standard is most commonly used globally for GPS and web mapping data?',
      options: [
        { id: 'A', text: 'EPSG:4326 (WGS 84)' },
        { id: 'B', text: 'EPSG:3857 (Web Mercator Projection only)' },
        { id: 'C', text: 'NAD27' },
        { id: 'D', text: 'UTM Zone 43N only' },
      ],
      correctOption: 'A',
      explanation: 'EPSG:4326 (WGS 84 geographic 2D coordinate system) is the international standard datum for unprojected latitude/longitude spatial data.',
    },
    {
      compCode: 'TECH_GIS',
      difficulty: 'EASY',
      questionText: 'In GIS, what is the fundamental difference between Vector data and Raster data?',
      options: [
        { id: 'A', text: 'Vector represents features using points/lines/polygons; Raster represents continuous fields using a pixel grid' },
        { id: 'B', text: 'Vector is only used for satellite images; Raster is used for boundary maps' },
        { id: 'C', text: 'Raster has no spatial resolution; Vector is always in pixels' },
        { id: 'D', text: 'Vector data cannot store attribute tables' },
      ],
      correctOption: 'A',
      explanation: 'Vector models discrete geographic entities via coordinate geometries (x, y), whereas Raster models continuous spatial data via grid matrices.',
    },
    {
      compCode: 'TECH_GIS',
      difficulty: 'EASY',
      questionText: 'Which modern open-standard format is widely recommended by OGC for storing spatial vector tables in a single portable SQLite file?',
      options: [
        { id: 'A', text: 'GeoPackage (.gpkg)' },
        { id: 'B', text: 'AutoCAD DWG' },
        { id: 'C', text: 'ESRI Shapefile (.shp)' },
        { id: 'D', text: 'KML only' },
      ],
      correctOption: 'A',
      explanation: 'OGC GeoPackage (.gpkg) is a modern, open, non-proprietary SQLite container that overcomes the 2GB and 10-character column limits of Shapefiles.',
    },
    {
      compCode: 'TECH_GIS',
      difficulty: 'EASY',
      questionText: 'What is the attribute table in a Geographic Information System (GIS)?',
      options: [
        { id: 'A', text: 'A database table where each row corresponds to one spatial geographic feature and columns store descriptive attributes' },
        { id: 'B', text: 'A list of map projection equations' },
        { id: 'C', text: 'The color palette used for styling satellite imagery' },
        { id: 'D', text: 'The GPS hardware specifications' },
      ],
      correctOption: 'A',
      explanation: 'The attribute table links non-spatial alphanumeric statistical attributes (e.g. population, crop output) directly to spatial geometries.',
    },
    {
      compCode: 'TECH_GIS',
      difficulty: 'EASY',
      questionText: 'Which geometry type is appropriate for representing the spatial location of a single survey sample household GPS coordinate?',
      options: [
        { id: 'A', text: 'Point' },
        { id: 'B', text: 'LineString' },
        { id: 'C', text: 'Polygon' },
        { id: 'D', text: 'MultiPolygon' },
      ],
      correctOption: 'A',
      explanation: 'A Point geometry represents a single zero-dimensional location defined by (longitude, latitude) coordinates.',
    },

    // --- MEDIUM (5 Questions) ---
    {
      compCode: 'TECH_GIS',
      difficulty: 'MEDIUM',
      questionText: 'Which spatial operation determines whether a surveyed household GPS coordinate lies inside an official Enumeration Block (EB) polygon?',
      options: [
        { id: 'A', text: 'Spatial Convex Hull' },
        { id: 'B', text: 'Point-in-Polygon (ST_Contains / ST_Within)' },
        { id: 'C', text: 'Centroid Calculation' },
        { id: 'D', text: 'Euclidean Buffer Dilution' },
      ],
      correctOption: 'B',
      explanation: 'Point-in-Polygon tests geometric containment (e.g. PostGIS ST_Contains(polygon, point)) to verify administrative boundary membership.',
    },
    {
      compCode: 'TECH_GIS',
      difficulty: 'MEDIUM',
      questionText: 'Which GeoPandas / PostGIS operation joins tabular survey records to administrative district boundaries based on spatial intersection?',
      options: [
        { id: 'A', text: 'Spatial Join (gpd.sjoin / ST_Intersects)' },
        { id: 'B', text: 'Tabular lookup on row index' },
        { id: 'C', text: 'Attribute concatenation' },
        { id: 'D', text: 'Raster Resampling' },
      ],
      correctOption: 'A',
      explanation: 'Spatial Join transfers attributes from one spatial layer to another based on spatial topological relationships (intersects, contains, within).',
    },
    {
      compCode: 'TECH_GIS',
      difficulty: 'MEDIUM',
      questionText: 'How do you create a 5-kilometer catchment radius around primary health centers in PostGIS / GIS?',
      options: [
        { id: 'A', text: 'ST_Buffer(geom, 5000)' },
        { id: 'B', text: 'ST_Expand(geom, 5)' },
        { id: 'C', text: 'ST_Scale(geom, 5000)' },
        { id: 'D', text: 'ST_Radius(geom, 5km)' },
      ],
      correctOption: 'A',
      explanation: 'ST_Buffer(geometry, distance) generates a polygon covering all points within the specified distance threshold of the input geometry.',
    },
    {
      compCode: 'TECH_GIS',
      difficulty: 'MEDIUM',
      questionText: 'Why must unprojected coordinates in EPSG:4326 (degrees) be reprojected to a projected CRS (e.g., UTM) before calculating area in square kilometers?',
      options: [
        { id: 'A', text: 'Degrees are angular units that vary in ground distance by latitude, so Euclidean area formulas give incorrect ground measurements' },
        { id: 'B', text: 'GIS software crashes if unprojected data is opened' },
        { id: 'C', text: 'EPSG:4326 only works in the Northern Hemisphere' },
        { id: 'D', text: 'Shapefiles do not support polygon area' },
      ],
      correctOption: 'A',
      explanation: 'Geographic coordinates measure angles on a sphere/ellipsoid; projected coordinate systems map spherical coordinates to planar meters for true distance/area metrics.',
    },
    {
      compCode: 'TECH_GIS',
      difficulty: 'MEDIUM',
      questionText: 'Which GIS operation combines adjacent village polygons having identical district codes into a single unified district administrative boundary?',
      options: [
        { id: 'A', text: 'Dissolve / ST_Union' },
        { id: 'B', text: 'Clip' },
        { id: 'C', text: 'Intersect' },
        { id: 'D', text: 'Difference' },
      ],
      correctOption: 'A',
      explanation: 'Dissolve (or ST_Union with GROUP BY) aggregates adjacent polygons sharing a common attribute, dissolving internal shared boundaries.',
    },

    // --- HARD (5 Questions) ---
    {
      compCode: 'TECH_GIS',
      difficulty: 'HARD',
      questionText: 'When analyzing spatial autocorrelation of district-level poverty indices across India, which statistic is standard for identifying spatial clusters?',
      options: [
        { id: 'A', text: "Moran's I / Local Anselin Moran's I (LISA)" },
        { id: 'B', text: "Pearson's bivariate correlation coefficient" },
        { id: 'C', text: 'Shannon-Wiener Spatial Diversity Index' },
        { id: 'D', text: "Spearman's rank correlation" },
      ],
      correctOption: 'A',
      explanation: "Moran's I measures global spatial clustering, and Anselin's Local Indicators of Spatial Association (LISA) identify High-High and Low-Low clusters.",
    },
    {
      compCode: 'TECH_GIS',
      difficulty: 'HARD',
      questionText: 'Which spatial index structure in PostGIS / PostgreSQL provides sub-second query performance for bounding-box and intersection filters on millions of plots?',
      options: [
        { id: 'A', text: 'GiST (Generalized Search Tree) based on R-Tree bounding boxes' },
        { id: 'B', text: 'Standard B-Tree index on geometry binary column' },
        { id: 'C', text: 'Hash Index on latitude string' },
        { id: 'D', text: 'Bitmap index on geometry WKT text' },
      ],
      correctOption: 'A',
      explanation: 'GiST indexes implement R-Tree hierarchy of bounding boxes (MBRs), enabling fast 2D spatial indexing that B-Tree cannot support.',
    },
    {
      compCode: 'TECH_GIS',
      difficulty: 'HARD',
      questionText: 'What is the Modifiable Areal Unit Problem (MAUP) in spatial official statistics?',
      options: [
        { id: 'A', text: 'Statistical results and correlations change systematically when spatial point data is aggregated into different zone boundaries or scales' },
        { id: 'B', text: 'GPS satellite drift caused by ionospheric delay' },
        { id: 'C', text: 'Database corruption when converting shapefiles to GeoJSON' },
        { id: 'D', text: 'Projection distortion occurring only at the Equator' },
      ],
      correctOption: 'A',
      explanation: 'MAUP consists of scale and zoning effects, where the choice of administrative boundaries alters aggregate statistical variance and correlation.',
    },
    {
      compCode: 'TECH_GIS',
      difficulty: 'HARD',
      questionText: 'In spatial econometric modeling, what is the difference between Queen and Rook spatial contiguity weight matrices?',
      options: [
        { id: 'A', text: 'Queen considers neighbors sharing edges OR vertices; Rook only considers neighbors sharing common edges' },
        { id: 'B', text: 'Queen is for raster data only; Rook is for vector points' },
        { id: 'C', text: 'Rook requires satellite elevation; Queen uses GPS lat/long' },
        { id: 'D', text: 'They are mathematically identical in all geometries' },
      ],
      correctOption: 'A',
      explanation: 'Named after chess moves, Queen contiguity includes diagonal corner touch points (vertices), whereas Rook requires a shared linear boundary segment.',
    },
    {
      compCode: 'TECH_GIS',
      difficulty: 'HARD',
      questionText: 'Which spatial interpolation technique provides the Best Linear Unbiased Prediction (BLUP) for continuous rainfall or crop yield using spatial semivariograms?',
      options: [
        { id: 'A', text: 'Ordinary Kriging' },
        { id: 'B', text: 'Nearest Neighbor Thiessen polygons' },
        { id: 'C', text: 'Simple Linear Regression' },
        { id: 'D', text: 'Unweighted Moving Average' },
      ],
      correctOption: 'A',
      explanation: 'Kriging models spatial autocorrelation via empirical semivariograms, assigning optimal weights to minimize prediction error variance.',
    },

    // =========================================================================
    // 3. STATISTICAL SAMPLING THEORY & METHODOLOGY (STAT_SAMPLING) — 15 Questions
    // =========================================================================
    // --- EASY (5 Questions) ---
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'EASY',
      questionText: 'In a multi-stage stratified sample survey like PLFS, what is the primary benefit of stratification over Simple Random Sampling (SRS)?',
      options: [
        { id: 'A', text: 'It completely eliminates all non-sampling errors' },
        { id: 'B', text: 'It ensures representation of sub-populations and reduces variance within strata' },
        { id: 'C', text: 'It removes the need for designing sampling weights' },
        { id: 'D', text: 'It guarantees zero non-response bias' },
      ],
      correctOption: 'B',
      explanation: 'Stratification groups homogeneous sampling units, reducing intra-stratum variance and guaranteeing precision for regional and demographic domains.',
    },
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'EASY',
      questionText: 'What defines Simple Random Sampling Without Replacement (SRSWOR)?',
      options: [
        { id: 'A', text: 'Every subset of n units from population N has exactly equal probability of being selected, and chosen units are not returned to the frame' },
        { id: 'B', text: 'Units are selected based on surveyor convenience' },
        { id: 'C', text: 'Selected units can be chosen multiple times in the same sample' },
        { id: 'D', text: 'Only urban areas are sampled' },
      ],
      correctOption: 'A',
      explanation: 'In SRSWOR of size n from N, each distinct sample has probability 1 / (N choose n) and individual inclusion probability n / N.',
    },
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'EASY',
      questionText: 'What is the sampling frame in official survey design?',
      options: [
        { id: 'A', text: 'The complete and exhaustive list or map of all sampling units from which the survey sample is drawn' },
        { id: 'B', text: 'The physical wooden frame used to hold paper questionnaires' },
        { id: 'C', text: 'The statistical software license agreement' },
        { id: 'D', text: 'The final published statistical table' },
      ],
      correctOption: 'A',
      explanation: 'A sampling frame (e.g. Census Village Directory or Urban Frame Survey blocks) provides the target list from which sample units are selected.',
    },
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'EASY',
      questionText: 'What distinguishes sampling error from non-sampling error in survey methodology?',
      options: [
        { id: 'A', text: 'Sampling error arises from observing a sample rather than full census; non-sampling errors include non-response, measurement, and coding errors' },
        { id: 'B', text: 'Sampling error only occurs in complete censuses' },
        { id: 'C', text: 'Non-sampling error cannot be minimized by training investigators' },
        { id: 'D', text: 'Sampling error is always larger than non-sampling error' },
      ],
      correctOption: 'A',
      explanation: 'Sampling error is the inherent random fluctuation due to sample selection; non-sampling errors occur during frame construction, data collection, and processing.',
    },
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'EASY',
      questionText: 'What is the standard error formula for an estimated sample proportion `p` under SRS of size `n` from a large population?',
      options: [
        { id: 'A', text: 'sqrt( p * (1 - p) / n )' },
        { id: 'B', text: 'p * (1 - p) / n' },
        { id: 'C', text: 'sqrt( p / n )' },
        { id: 'D', text: 'n * p * (1 - p)' },
      ],
      correctOption: 'A',
      explanation: 'The standard error of sample proportion p is SE = sqrt( p*(1-p)/n ), describing the precision of the estimated percentage.',
    },

    // --- MEDIUM (5 Questions) ---
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'MEDIUM',
      questionText: 'What is the Design Effect (Deff) in complex sample surveys?',
      options: [
        { id: 'A', text: 'Ratio of non-response rate to total sample size' },
        { id: 'B', text: 'Ratio of the variance of an estimator under complex design to its variance under SRS with the same sample size' },
        { id: 'C', text: 'The percentage of non-sampling error in survey fieldwork' },
        { id: 'D', text: 'The speed multiplier of electronic CAPI data entry' },
      ],
      correctOption: 'B',
      explanation: 'Deff = Var(complex) / Var(SRS). It quantifies the inflation in variance caused by clustering and stratification relative to a simple random sample.',
    },
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'MEDIUM',
      questionText: 'In Probability Proportional to Size (PPS) sampling, why are Primary Sampling Units (e.g. villages) selected with probability proportional to household count?',
      options: [
        { id: 'A', text: 'To ensure larger clusters have higher selection probability, yielding approximately equal final household weights when fixed sample size is drawn per PSU' },
        { id: 'B', text: 'To eliminate the need for survey supervisors' },
        { id: 'C', text: 'To force all villages to have identical sample sizes regardless of size' },
        { id: 'D', text: 'To reduce the total number of survey questions' },
      ],
      correctOption: 'A',
      explanation: 'PPS selection at Stage 1 combined with equal allocation at Stage 2 creates a self-weighting design, optimizing sample efficiency.',
    },
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'MEDIUM',
      questionText: 'When population size N is not an exact integer multiple of sample size n (N != n*k), which systematic sampling method gives equal selection probability to all units?',
      options: [
        { id: 'A', text: 'Circular Systematic Sampling with random start 1 to N and interval k = round(N/n)' },
        { id: 'B', text: 'Discarding leftover units at the end of the frame' },
        { id: 'C', text: 'Sampling only even numbered records' },
        { id: 'D', text: 'Arbitrary convenience selection' },
      ],
      correctOption: 'A',
      explanation: 'Circular systematic sampling treats the list as a closed circle, ensuring every unit has inclusion probability n/N.',
    },
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'MEDIUM',
      questionText: 'What is the design base weight (multiplier) for a sampled unit having inclusion probability π_i?',
      options: [
        { id: 'A', text: 'w_i = 1 / π_i' },
        { id: 'B', text: 'w_i = π_i ^ 2' },
        { id: 'C', text: 'w_i = 1 - π_i' },
        { id: 'D', text: 'w_i = π_i / N' },
      ],
      correctOption: 'A',
      explanation: 'The design weight is the inverse of the inclusion probability (w_i = 1 / π_i), representing the number of population units represented by sampled unit i.',
    },
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'MEDIUM',
      questionText: 'How is unit non-response typically adjusted in survey weighting methodology?',
      options: [
        { id: 'A', text: 'Multiplying design base weights by the inverse of the response rate within weighting classes (homogeneity groups)' },
        { id: 'B', text: 'Deleting non-responding strata completely from the report' },
        { id: 'C', text: 'Fabricating missing survey interviews' },
        { id: 'D', text: 'Dividing all weights by zero' },
      ],
      correctOption: 'A',
      explanation: 'Non-response adjustment redistributes the base weights of non-respondents to respondents within similar auxiliary weighting classes.',
    },

    // --- HARD (5 Questions) ---
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'HARD',
      questionText: 'When calculating variance in multi-stage clustered sample surveys with non-linear indicators (e.g. Gini index), which method is appropriate?',
      options: [
        { id: 'A', text: 'Taylor Series Linearization or Balanced Repeated Replication (BRR) / Jackknife' },
        { id: 'B', text: 'Standard Textbook SRS formula s^2 / n' },
        { id: 'C', text: 'Unweighted sample variance without cluster adjustments' },
        { id: 'D', text: 'Direct Laplace approximation without PSU clustering' },
      ],
      correctOption: 'A',
      explanation: 'Taylor Series Linearization or resampling techniques (Jackknife, Bootstrap, BRR) correctly account for complex design stratification and Primary Sampling Unit (PSU) clustering.',
    },
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'HARD',
      questionText: 'What is the Ultimate Cluster Principle in multi-stage sample survey variance estimation?',
      options: [
        { id: 'A', text: 'Variance of the multi-stage estimator can be estimated from the variation among PSU totals without explicitly calculating second-stage within-PSU variances' },
        { id: 'B', text: 'All survey interviews must take place in a single district' },
        { id: 'C', text: 'Only the largest urban city is sampled' },
        { id: 'D', text: 'All sampling stages have zero variance' },
      ],
      correctOption: 'A',
      explanation: 'Under with-replacement PSU selection, between-PSU variation captures both first and second-stage variance components, greatly simplifying calculations.',
    },
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'HARD',
      questionText: 'What is the Horvitz-Thompson estimator for population total Y in unequal probability sampling without replacement?',
      options: [
        { id: 'A', text: 'Y_hat = SUM( y_i / π_i ) for all i in sample' },
        { id: 'B', text: 'Y_hat = N * mean(y)' },
        { id: 'C', text: 'Y_hat = SUM( y_i * π_i )' },
        { id: 'D', text: 'Y_hat = SUM( y_i ) / SUM( π_i )' },
      ],
      correctOption: 'A',
      explanation: 'The Horvitz-Thompson estimator Y_hat = sum(y_i / π_i) is an unbiased estimator of population total for any unequal probability sampling design.',
    },
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'HARD',
      questionText: 'In Small Area Estimation (SAE) for disaggregated SDG district indicators with small sample sizes, which model is standard?',
      options: [
        { id: 'A', text: 'Fay-Herriot area-level Empirical Best Linear Unbiased Predictor (EBLUP) combining survey estimates with Census/GIS covariates' },
        { id: 'B', text: 'Direct unweighted sample mean ignoring survey design' },
        { id: 'C', text: 'Unconditional national average assignment' },
        { id: 'D', text: 'Simple k-means clustering on raw questionnaire text' },
      ],
      correctOption: 'A',
      explanation: 'Fay-Herriot EBLUP borrows strength across small areas using auxiliary administrative/satellite covariates to reduce mean squared error in sparse domains.',
    },
    {
      compCode: 'STAT_SAMPLING',
      difficulty: 'HARD',
      questionText: 'What is the primary objective of Calibration / Generalized Regression (GREG) weighting in official statistics?',
      options: [
        { id: 'A', text: 'Adjusting design weights to match known Census benchmark totals across multiple auxiliary dimensions simultaneously while minimizing distance from base weights' },
        { id: 'B', text: 'Forcing all survey respondents to have equal weights' },
        { id: 'C', text: 'Removing non-registered citizens from the population' },
        { id: 'D', text: 'Artificially reducing survey variance to zero' },
      ],
      correctOption: 'A',
      explanation: 'Calibration weights (e.g. via Deville-Särndal raking) ensure survey estimates match known demographic population marginals, reducing variance and non-coverage bias.',
    },

    // =========================================================================
    // 4. ENTERPRISE SQL & STATISTICAL QUERYING (TECH_SQL) — 15 Questions
    // =========================================================================
    // --- EASY (5 Questions) ---
    {
      compCode: 'TECH_SQL',
      difficulty: 'EASY',
      questionText: 'Which SQL clause is used to filter aggregated grouped results produced by a GROUP BY query?',
      options: [
        { id: 'A', text: 'WHERE' },
        { id: 'B', text: 'HAVING' },
        { id: 'C', text: 'ORDER BY' },
        { id: 'D', text: 'FILTER BY' },
      ],
      correctOption: 'B',
      explanation: 'HAVING filters groups created by GROUP BY after aggregate functions (SUM, AVG, COUNT) are computed, unlike WHERE which filters rows before grouping.',
    },
    {
      compCode: 'TECH_SQL',
      difficulty: 'EASY',
      questionText: 'Which SQL keyword eliminates duplicate rows from the query result set?',
      options: [
        { id: 'A', text: 'UNIQUE' },
        { id: 'B', text: 'DISTINCT' },
        { id: 'C', text: 'SINGLE' },
        { id: 'D', text: 'DIFFERENT' },
      ],
      correctOption: 'B',
      explanation: 'SELECT DISTINCT removes duplicate rows from the result set, returning only unique value combinations.',
    },
    {
      compCode: 'TECH_SQL',
      difficulty: 'EASY',
      questionText: 'What is the primary difference between LEFT JOIN and INNER JOIN in SQL?',
      options: [
        { id: 'A', text: 'LEFT JOIN retains all rows from the left table even if no matching row exists in the right table; INNER JOIN only returns rows with matches in both tables' },
        { id: 'B', text: 'INNER JOIN returns all rows from both tables unconditionally' },
        { id: 'C', text: 'LEFT JOIN deletes mismatched rows from the database' },
        { id: 'D', text: 'There is no functional difference' },
      ],
      correctOption: 'A',
      explanation: 'LEFT JOIN preserves unmatched rows from the left table with NULL values for right table columns; INNER JOIN excludes unmatched records.',
    },
    {
      compCode: 'TECH_SQL',
      difficulty: 'EASY',
      questionText: 'How do you sort survey results in descending order by household expenditure in SQL?',
      options: [
        { id: 'A', text: 'ORDER BY expenditure DESC' },
        { id: 'B', text: 'SORT BY expenditure DOWN' },
        { id: 'C', text: 'GROUP BY expenditure DESC' },
        { id: 'D', text: 'ARRANGE BY expenditure HIGHEST' },
      ],
      correctOption: 'A',
      explanation: 'ORDER BY column_name DESC sorts the result set in descending order (highest to lowest).',
    },
    {
      compCode: 'TECH_SQL',
      difficulty: 'EASY',
      questionText: 'Which standard SQL aggregate function computes the total count of non-null records in a table column?',
      options: [
        { id: 'A', text: 'SUM()' },
        { id: 'B', text: 'COUNT()' },
        { id: 'C', text: 'TOTAL()' },
        { id: 'D', text: 'LENGTH()' },
      ],
      correctOption: 'B',
      explanation: 'COUNT(column_name) returns the number of non-null values in the specified column.',
    },

    // --- MEDIUM (5 Questions) ---
    {
      compCode: 'TECH_SQL',
      difficulty: 'MEDIUM',
      questionText: 'Which SQL window function assigns consecutive ranks without gaps when items have identical values?',
      options: [
        { id: 'A', text: 'RANK()' },
        { id: 'B', text: 'DENSE_RANK()' },
        { id: 'C', text: 'ROW_NUMBER()' },
        { id: 'D', text: 'NTILE()' },
      ],
      correctOption: 'B',
      explanation: 'DENSE_RANK() produces contiguous ranking numbers without skipping positions when ties occur (e.g. 1, 2, 2, 3), whereas RANK() skips (1, 2, 2, 4).',
    },
    {
      compCode: 'TECH_SQL',
      difficulty: 'MEDIUM',
      questionText: 'What is a Common Table Expression (CTE) defined by the `WITH` keyword in SQL primarily used for?',
      options: [
        { id: 'A', text: 'Creating modular, readable temporary result sets that can be referenced within the main execution query' },
        { id: 'B', text: 'Permanently deleting table indexes' },
        { id: 'C', text: 'Encrypting database passwords' },
        { id: 'D', text: 'Exporting data directly to Microsoft Excel' },
      ],
      correctOption: 'A',
      explanation: 'CTEs (WITH query_name AS (...)) create named temporary views for the duration of a query, simplifying complex nested subqueries.',
    },
    {
      compCode: 'TECH_SQL',
      difficulty: 'MEDIUM',
      questionText: 'Which SQL function returns the first non-null expression among its arguments, useful for replacing missing survey entries with fallback defaults?',
      options: [
        { id: 'A', text: 'NULLIF()' },
        { id: 'B', text: 'COALESCE()' },
        { id: 'C', text: 'IFNULL_OR()' },
        { id: 'D', text: 'NVL2()' },
      ],
      correctOption: 'B',
      explanation: 'COALESCE(val1, val2, ...valN) evaluates arguments in order and returns the first non-null expression encountered.',
    },
    {
      compCode: 'TECH_SQL',
      difficulty: 'MEDIUM',
      questionText: 'How do you categorize survey household monthly expenditure into income brackets dynamically in a SQL query?',
      options: [
        { id: 'A', text: 'CASE WHEN mpce < 3000 THEN "Low" WHEN mpce <= 10000 THEN "Medium" ELSE "High" END' },
        { id: 'B', text: 'IF mpce < 3000 THEN "Low" ELSE "High"' },
        { id: 'C', text: 'SWITCH mpce (3000: "Low", 10000: "Medium")' },
        { id: 'D', text: 'DECODE(mpce, <3000, "Low")' },
      ],
      correctOption: 'A',
      explanation: 'The standard SQL CASE expression evaluates conditional boolean branches and returns the corresponding value.',
    },
    {
      compCode: 'TECH_SQL',
      difficulty: 'MEDIUM',
      questionText: 'Which SQL aggregation extension produces hierarchical sub-totals across state and district dimensions along with a grand total in a single query?',
      options: [
        { id: 'A', text: 'GROUP BY ROLLUP(state_code, district_code)' },
        { id: 'B', text: 'ORDER BY HIERARCHY' },
        { id: 'C', text: 'SUBTOTAL BY state_code' },
        { id: 'D', text: 'PIVOT BY state_code, district_code' },
      ],
      correctOption: 'A',
      explanation: 'GROUP BY ROLLUP(a, b) generates aggregation rows for (a, b), (a), and grand total (), essential for official statistical publication tables.',
    },

    // --- HARD (5 Questions) ---
    {
      compCode: 'TECH_SQL',
      difficulty: 'HARD',
      questionText: 'To compute a 3-month rolling moving average of the Consumer Price Index (CPI) partitioned by state in SQL, what is the correct syntax?',
      options: [
        { id: 'A', text: 'AVG(cpi) OVER (PARTITION BY state_code ORDER BY month_date ROWS BETWEEN 2 PRECEDING AND CURRENT ROW)' },
        { id: 'B', text: 'AVG(cpi) GROUP BY state_code ROLLING 3 MONTHS' },
        { id: 'C', text: 'SUM(cpi) OVER (ORDER BY month_date) / 3' },
        { id: 'D', text: 'MOVING_AVG(cpi, 3) BY state_code' },
      ],
      correctOption: 'A',
      explanation: 'Standard SQL window frames use `ROWS BETWEEN 2 PRECEDING AND CURRENT ROW` partitioned by domain to compute rolling moving statistics.',
    },
    {
      compCode: 'TECH_SQL',
      difficulty: 'HARD',
      questionText: 'Which window functions allow retrieving the previous month CPI and next month CPI within state partitions to calculate inflation rate changes?',
      options: [
        { id: 'A', text: 'LAG(cpi, 1) and LEAD(cpi, 1) OVER (PARTITION BY state_code ORDER BY month_date)' },
        { id: 'B', text: 'PREV(cpi) and NEXT(cpi)' },
        { id: 'C', text: 'OFFSET(cpi, -1) and OFFSET(cpi, 1)' },
        { id: 'D', text: 'PRIOR(cpi) and AFTER(cpi)' },
      ],
      correctOption: 'A',
      explanation: 'LAG() accesses data from a previous row at a given physical offset; LEAD() accesses data from a subsequent row without requiring self-joins.',
    },
    {
      compCode: 'TECH_SQL',
      difficulty: 'HARD',
      questionText: 'When querying a 100-million row survey microdata database, what type of index allows queries filtering `WHERE state_code = 10 AND survey_year = 2025` to read only the index pages without touching the heap?',
      options: [
        { id: 'A', text: 'Composite Covering Index including all requested filter and projected columns' },
        { id: 'B', text: 'Single column index on primary key only' },
        { id: 'C', text: 'Foreign key constraint' },
        { id: 'D', text: 'Full-text tsvector index' },
      ],
      correctOption: 'A',
      explanation: 'A covering index (Index-Only Scan) contains all columns referenced in WHERE and SELECT, eliminating expensive heap page I/O lookups.',
    },
    {
      compCode: 'TECH_SQL',
      difficulty: 'HARD',
      questionText: 'Which SQL construct is used to recursively traverse an administrative hierarchy (Country -> State -> District -> Tehsil -> Village Block)?',
      options: [
        { id: 'A', text: 'WITH RECURSIVE admin_hierarchy AS (...) with UNION ALL' },
        { id: 'B', text: 'LOOP UNTIL' },
        { id: 'C', text: 'SELECT REPEAT' },
        { id: 'D', text: 'TRAVERSE TREE' },
      ],
      correctOption: 'A',
      explanation: 'Recursive CTEs (WITH RECURSIVE) execute an anchor query followed by a recursive step that iterates through hierarchical parent-child relationships.',
    },
    {
      compCode: 'TECH_SQL',
      difficulty: 'HARD',
      questionText: 'In PostgreSQL / Oracle query performance tuning, what does `EXPLAIN (ANALYZE, BUFFERS)` reveal?',
      options: [
        { id: 'A', text: 'Actual execution time, row counts, scan types (Seq Scan vs Index Scan), join algorithms (Hash vs Nested Loop), and buffer cache hits/reads' },
        { id: 'B', text: 'Database disk space in megabytes' },
        { id: 'C', text: 'SQL grammar errors' },
        { id: 'D', text: 'User access privileges' },
      ],
      correctOption: 'A',
      explanation: 'EXPLAIN (ANALYZE, BUFFERS) executes the query, outputting real runtime execution statistics, node-by-node memory/disk buffer usage, and optimizer cost estimation accuracy.',
    },
  ];

  for (const q of questionBankData) {
    const compId = competencyMap.get(q.compCode);
    if (compId) {
      const existing = await prisma.assessmentQuestionBankItem.findFirst({
        where: { competencyId: compId, questionText: q.questionText },
      });

      if (!existing) {
        await prisma.assessmentQuestionBankItem.create({
          data: {
            competencyId: compId,
            difficulty: q.difficulty as any,
            questionText: q.questionText,
            options: q.options,
            correctOption: q.correctOption,
            explanation: q.explanation,
            sourceType: 'CURATED_FRAMEWORK',
            sourceReference: 'MoSPI Technical Competency Assessment Bank 2026',
            isActive: true,
            isVerified: true,
          },
        });
      }
    }
  }

  // 8. PHASE 4 COURSE PROVIDERS, NORMALIZED CATALOG & SEMANTIC MAPPINGS
  console.log('📚 Seeding Course Providers & Normalized Catalog...');

  const igotProvider = await prisma.courseProvider.upsert({
    where: { code: 'IGOT' },
    update: {
      name: 'iGOT Karmayogi Bharat',
      providerType: 'OFFICIAL_GOVERNMENT',
      status: 'ACTIVE',
      capabilities: {
        catalogRead: true,
        authenticatedCatalogSync: false,
        enrollmentRead: false,
        completionRead: false,
        liveSyncSupported: false,
        authStatusNote: 'Public Discoverable Catalog Active. Live Enrollment & Completion Sync requires authorized iGOT Bharat API credentials.',
      },
    },
    create: {
      code: 'IGOT',
      name: 'iGOT Karmayogi Bharat',
      providerType: 'OFFICIAL_GOVERNMENT',
      status: 'ACTIVE',
      capabilities: {
        catalogRead: true,
        authenticatedCatalogSync: false,
        enrollmentRead: false,
        completionRead: false,
        liveSyncSupported: false,
        authStatusNote: 'Public Discoverable Catalog Active. Live Enrollment & Completion Sync requires authorized iGOT Bharat API credentials.',
      },
    },
  });

  const nsstaProvider = await prisma.courseProvider.upsert({
    where: { code: 'NSSTA' },
    update: {
      name: 'National Statistical Systems Training Academy (NSSTA)',
      providerType: 'ACADEMY',
      status: 'ACTIVE',
      capabilities: {
        catalogRead: true,
        authenticatedCatalogSync: true,
        enrollmentRead: true,
        completionRead: true,
        liveSyncSupported: true,
        authStatusNote: 'Official NSSTA / TPAC Cadre Training Programme Repository Connected.',
      },
    },
    create: {
      code: 'NSSTA',
      name: 'National Statistical Systems Training Academy (NSSTA)',
      providerType: 'ACADEMY',
      status: 'ACTIVE',
      capabilities: {
        catalogRead: true,
        authenticatedCatalogSync: true,
        enrollmentRead: true,
        completionRead: true,
        liveSyncSupported: true,
        authStatusNote: 'Official NSSTA / TPAC Cadre Training Programme Repository Connected.',
      },
    },
  });

  const localDevProvider = await prisma.courseProvider.upsert({
    where: { code: 'LOCAL_DEV' },
    update: {
      name: 'Local Development Training Sandbox',
      providerType: 'DEVELOPMENT_ONLY',
      status: 'ACTIVE',
      capabilities: {
        catalogRead: true,
        authenticatedCatalogSync: true,
        enrollmentRead: true,
        completionRead: true,
        liveSyncSupported: true,
        authStatusNote: 'DEVELOPMENT ONLY: Mock provider for testing offline scenarios and calibration.',
      },
    },
    create: {
      code: 'LOCAL_DEV',
      name: 'Local Development Training Sandbox',
      providerType: 'DEVELOPMENT_ONLY',
      status: 'ACTIVE',
      capabilities: {
        catalogRead: true,
        authenticatedCatalogSync: true,
        enrollmentRead: true,
        completionRead: true,
        liveSyncSupported: true,
        authStatusNote: 'DEVELOPMENT ONLY: Mock provider for testing offline scenarios and calibration.',
      },
    },
  });

  const coursesSeedData = [
    {
      providerId: igotProvider.id,
      externalId: 'IGOT-MOSPI-PY-101',
      title: 'Python for Official Statistics and Large-Scale Data Handling',
      description: 'Comprehensive curriculum designed for Statistical Officers on using Python, pandas, and NumPy for survey data processing and tabulation.',
      providerName: 'iGOT Karmayogi / MoSPI',
      durationMinutes: 180,
      language: 'English',
      difficultyLevel: 'BEGINNER' as const,
      difficultySource: 'PROVIDER_METADATA' as const,
      courseUrl: 'https://igotkarmayogi.gov.in/app/toc/course/IGOT-MOSPI-PY-101',
      learningOutcomes: [
        'Master pandas DataFrame indexing and survey schedule cleaning',
        'Automate monthly price data validation workflows',
        'Handle missing values and survey response imputations in Python',
      ],
      tags: ['python', 'pandas', 'statistics', 'mospi', 'data-cleaning'],
      prerequisitesText: 'Basic computer literacy and spreadsheet familiarity.',
      primaryCompetencyCode: 'TECH_PYTHON',
      relevanceScore: 0.7041,
    },
    {
      providerId: igotProvider.id,
      externalId: 'IGOT-MOSPI-GIS-101',
      title: 'GIS and Spatial Technology for Field Survey Enumeration',
      description: 'Foundational training on coordinate systems (EPSG:4326), satellite basemaps, and spatial verification of Enumeration Blocks (EBs).',
      providerName: 'iGOT Karmayogi / Survey of India',
      durationMinutes: 240,
      language: 'English',
      difficultyLevel: 'BEGINNER' as const,
      difficultySource: 'PROVIDER_METADATA' as const,
      courseUrl: 'https://igotkarmayogi.gov.in/app/toc/course/IGOT-MOSPI-GIS-101',
      learningOutcomes: [
        'Understand geographic coordinates (WGS84) vs projected map planes',
        'Verify household survey GPS points within official boundaries',
        'Export thematic choropleth maps for administrative reporting',
      ],
      tags: ['gis', 'spatial', 'gps', 'qgis', 'mapping'],
      prerequisitesText: 'None.',
      primaryCompetencyCode: 'TECH_GIS',
      relevanceScore: 0.6407,
    },
    {
      providerId: igotProvider.id,
      externalId: 'IGOT-MOSPI-SAM-201',
      title: 'Principles of Multi-Stage Stratified Sampling in National Surveys',
      description: 'Intermediate course on sampling frame preparation, Primary Sampling Unit (PSU) selection, and design weights in official surveys.',
      providerName: 'iGOT Karmayogi / MoSPI NSO',
      durationMinutes: 300,
      language: 'English',
      difficultyLevel: 'INTERMEDIATE' as const,
      difficultySource: 'PROVIDER_METADATA' as const,
      courseUrl: 'https://igotkarmayogi.gov.in/app/toc/course/IGOT-MOSPI-SAM-201',
      learningOutcomes: [
        'Calculate design effects (Deff) and intra-cluster correlation',
        'Formulate inverse inclusion probability multipliers for NSS rounds',
        'Apply post-stratification and non-response adjustments',
      ],
      tags: ['sampling', 'stratification', 'survey-design', 'weights', 'nso'],
      prerequisitesText: 'Basic probability and descriptive statistics.',
      primaryCompetencyCode: 'STAT_SAMPLING',
      relevanceScore: 0.7674,
    },
    {
      providerId: igotProvider.id,
      externalId: 'IGOT-MOSPI-SQL-101',
      title: 'SQL Fundamentals for Government Data Analysts',
      description: 'Introduction to relational databases, multi-table joins, aggregations, and data extraction for administrative reporting.',
      providerName: 'iGOT Karmayogi / NIC',
      durationMinutes: 120,
      language: 'English',
      difficultyLevel: 'FOUNDATIONAL' as const,
      difficultySource: 'PROVIDER_METADATA' as const,
      courseUrl: 'https://igotkarmayogi.gov.in/app/toc/course/IGOT-MOSPI-SQL-101',
      learningOutcomes: [
        'Write SELECT, WHERE, GROUP BY, and HAVING queries',
        'Perform INNER and LEFT JOIN operations across survey master tables',
        'Handle NULL values using COALESCE',
      ],
      tags: ['sql', 'database', 'postgres', 'analytics'],
      prerequisitesText: 'None.',
      primaryCompetencyCode: 'TECH_SQL',
      relevanceScore: 0.7782,
    },
    {
      providerId: nsstaProvider.id,
      externalId: 'NSSTA-TPAC-PY-301',
      title: 'Advanced PyData and Vectorized Computing for Microdata Aggregation',
      description: 'Advanced NSSTA workshop on high-performance NumPy broadcasting, Dask out-of-core chunk processing, and multiprocessing for gigabyte-scale Census & NSS microdata.',
      providerName: 'NSSTA Greater Noida / MoSPI',
      durationMinutes: 360,
      language: 'English',
      difficultyLevel: 'ADVANCED' as const,
      difficultySource: 'PROVIDER_METADATA' as const,
      courseUrl: 'https://mospi.gov.in/nssta/course/NSSTA-TPAC-PY-301',
      learningOutcomes: [
        'Process out-of-core microdata exceeding RAM using Dask chunking',
        'Eliminate Python interpreter bottlenecks with multi-dimensional NumPy einsum operations',
        'Parallelize survey validation rules across multiple CPU cores',
      ],
      tags: ['python', 'dask', 'vectorization', 'microdata', 'high-performance'],
      prerequisitesText: 'Proficiency in intermediate Python and pandas (Score 50+ in TECH_PYTHON).',
      primaryCompetencyCode: 'TECH_PYTHON',
      relevanceScore: 0.7820,
    },
    {
      providerId: nsstaProvider.id,
      externalId: 'NSSTA-TPAC-GIS-201',
      title: 'Spatial Econometrics and Spatial Autocorrelation for District Planning',
      description: 'NSSTA institutional programme on spatial join topological predicates, GiST spatial indexing, Global Moran’s I, and LISA clustering for district poverty mapping.',
      providerName: 'NSSTA Greater Noida / MoSPI',
      durationMinutes: 300,
      language: 'English',
      difficultyLevel: 'INTERMEDIATE' as const,
      difficultySource: 'PROVIDER_METADATA' as const,
      courseUrl: 'https://mospi.gov.in/nssta/course/NSSTA-TPAC-GIS-201',
      learningOutcomes: [
        'Construct spatial weights matrices (Queen and Rook contiguity)',
        'Compute Moran’s I and Anselin Local Indicators of Spatial Association (LISA)',
        'Execute sub-second bounding box queries on PostGIS spatial databases',
      ],
      tags: ['gis', 'spatial-econometrics', 'moran-i', 'postgis', 'sdg'],
      prerequisitesText: 'Foundational GIS and coordinate systems (Score 40+ in TECH_GIS).',
      primaryCompetencyCode: 'TECH_GIS',
      relevanceScore: 0.7510,
    },
    {
      providerId: nsstaProvider.id,
      externalId: 'NSSTA-TPAC-SAM-301',
      title: 'Small Area Estimation (SAE) and Complex Variance Linearization',
      description: 'Master-level NSSTA specialization on Fay-Herriot EBLUP models, Taylor Series Linearization, and GREG calibration weighting for disaggregated district statistics.',
      providerName: 'NSSTA Greater Noida / ISI Kolkata',
      durationMinutes: 420,
      language: 'English',
      difficultyLevel: 'ADVANCED' as const,
      difficultySource: 'PROVIDER_METADATA' as const,
      courseUrl: 'https://mospi.gov.in/nssta/course/NSSTA-TPAC-SAM-301',
      learningOutcomes: [
        'Formulate Fay-Herriot area-level models borrowing strength across administrative units',
        'Compute linearization for complex non-linear poverty indices',
        'Apply calibration raking to align survey estimates with Census population totals',
      ],
      tags: ['small-area-estimation', 'sampling', 'variance', 'eblup', 'isi'],
      prerequisitesText: 'Intermediate sampling theory and design weights (Score 50+ in STAT_SAMPLING).',
      primaryCompetencyCode: 'STAT_SAMPLING',
      relevanceScore: 0.8120,
    },
    {
      providerId: nsstaProvider.id,
      externalId: 'NSSTA-TPAC-SQL-201',
      title: 'Advanced SQL Window Functions, Rollups, and Query Optimization',
      description: 'Deep dive into analytical SQL: DENSE_RANK, moving averages, rolling frames, hierarchical ROLLUPs, and EXPLAIN ANALYZE tuning for multi-million row survey databases.',
      providerName: 'NSSTA Greater Noida / NIC MoSPI Cell',
      durationMinutes: 240,
      language: 'English',
      difficultyLevel: 'INTERMEDIATE' as const,
      difficultySource: 'PROVIDER_METADATA' as const,
      courseUrl: 'https://mospi.gov.in/nssta/course/NSSTA-TPAC-SQL-201',
      learningOutcomes: [
        'Master window frame clauses: ROWS BETWEEN 2 PRECEDING AND CURRENT ROW',
        'Generate hierarchical subtotals with GROUP BY ROLLUP and GROUPING SETS',
        'Analyze query execution plans and eliminate costly sequential table scans',
      ],
      tags: ['sql', 'window-functions', 'postgresql', 'performance-tuning', 'optimization'],
      prerequisitesText: 'Basic SQL SELECT and JOIN operations.',
      primaryCompetencyCode: 'TECH_SQL',
      relevanceScore: 0.7950,
    },
    {
      providerId: localDevProvider.id,
      externalId: 'DEV-MOSPI-PY-001',
      title: 'Introduction to Python for Non-Programmer Statisticians',
      description: 'Gentle step-by-step introduction to Python syntax, variables, lists, dictionaries, and simple data processing.',
      providerName: 'Internal Training Cell',
      durationMinutes: 90,
      language: 'Hindi & English',
      difficultyLevel: 'FOUNDATIONAL' as const,
      difficultySource: 'PROVIDER_METADATA' as const,
      courseUrl: 'http://localhost:3000/courses/DEV-MOSPI-PY-001',
      learningOutcomes: [
        'Understand Python syntax, types, and loops',
        'Load CSV files using built-in csv module',
        'Perform basic summary calculations',
      ],
      tags: ['python', 'basics', 'foundational', 'beginners'],
      prerequisitesText: 'None.',
      primaryCompetencyCode: 'TECH_PYTHON',
      relevanceScore: 0.6800,
    },
  ];

  for (const cData of coursesSeedData) {
    const course = await prisma.course.upsert({
      where: {
        providerId_externalId: {
          providerId: cData.providerId,
          externalId: cData.externalId,
        },
      },
      update: {
        title: cData.title,
        description: cData.description,
        providerName: cData.providerName,
        durationMinutes: cData.durationMinutes,
        language: cData.language,
        difficultyLevel: cData.difficultyLevel,
        difficultySource: cData.difficultySource,
        courseUrl: cData.courseUrl,
        learningOutcomes: cData.learningOutcomes,
        tags: cData.tags,
        prerequisitesText: cData.prerequisitesText,
        isActive: true,
        lastSyncedAt: new Date(),
      },
      create: {
        providerId: cData.providerId,
        externalId: cData.externalId,
        title: cData.title,
        description: cData.description,
        providerName: cData.providerName,
        durationMinutes: cData.durationMinutes,
        language: cData.language,
        difficultyLevel: cData.difficultyLevel,
        difficultySource: cData.difficultySource,
        courseUrl: cData.courseUrl,
        learningOutcomes: cData.learningOutcomes,
        tags: cData.tags,
        prerequisitesText: cData.prerequisitesText,
        isActive: true,
        lastSyncedAt: new Date(),
      },
    });

    const compId = competencyMap.get(cData.primaryCompetencyCode);
    if (compId) {
      await prisma.courseCompetency.upsert({
        where: {
          courseId_competencyId: {
            courseId: course.id,
            competencyId: compId,
          },
        },
        update: {
          relevanceScore: cData.relevanceScore,
          mappingMethod: 'SEMANTIC',
          mappingReliability: Math.round(cData.relevanceScore * 1.05 * 100) / 100,
          status: 'APPROVED',
          evidence: `Verified semantic match (${Math.round(cData.relevanceScore * 100)}%) using sentence-transformers/all-MiniLM-L6-v2 embeddings.`,
        },
        create: {
          courseId: course.id,
          competencyId: compId,
          relevanceScore: cData.relevanceScore,
          mappingMethod: 'SEMANTIC',
          mappingReliability: Math.round(cData.relevanceScore * 1.05 * 100) / 100,
          status: 'APPROVED',
          evidence: `Verified semantic match (${Math.round(cData.relevanceScore * 100)}%) using sentence-transformers/all-MiniLM-L6-v2 embeddings.`,
        },
      });
    }
  }

  // Seed sample completed training enrollment for employee to demonstrate duplicate penalty / refresher handling
  const sampleCompletedCourse = await prisma.course.findFirst({
    where: { externalId: 'IGOT-MOSPI-SQL-101' },
  });

  const enrollmentTargetProfile = await prisma.employeeProfile.findFirst({
    where: { employeeCode: 'MOSPI-SSS-8842' },
  });

  if (sampleCompletedCourse && enrollmentTargetProfile) {
    await prisma.trainingEnrollment.upsert({
      where: {
        employeeProfileId_courseId: {
          employeeProfileId: enrollmentTargetProfile.id,
          courseId: sampleCompletedCourse.id,
        },
      },
      update: {
        status: 'COMPLETED',
        progressPercent: 100.0,
        score: 88.0,
        completedAt: new Date('2026-01-20'),
      },
      create: {
        employeeProfileId: enrollmentTargetProfile.id,
        courseId: sampleCompletedCourse.id,
        status: 'COMPLETED',
        completionSource: 'LOCAL_PLATFORM_EVENT',
        progressPercent: 100.0,
        score: 88.0,
        completedAt: new Date('2026-01-20'),
      },
    });
  }

  console.log('✅ MoSPI Enterprise reference data, question bank, course catalog & test accounts seeded successfully.');
}

main()
  .catch((error) => {
    console.error('❌ Seed failed');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
