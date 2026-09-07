import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { MathService } from '../math/math.service';


@Injectable()
export class QuestionsService {

  constructor(
    private readonly prisma:
      PrismaService,

    private readonly mathService:
      MathService,
  ) {}


  // =====================================================
  // DATABASE TEST QUESTION
  // =====================================================

  async getNextQuestion(
    classLevel: number,
    subjectCode: string,
    difficulty: number,
  ) {

    const questions =
      await this.prisma.question.findMany({
        where: {
          difficulty,

          isActive: true,

          chapter: {
            subject: {
              code:
                subjectCode,

              class: {
                level:
                  classLevel,
              },
            },
          },
        },

        select: {
          id: true,

          text: true,

          difficulty: true,

          questionType: true,

          chapter: {
            select: {
              id: true,

              name: true,
            },
          },

          topic: {
            select: {
              id: true,

              name: true,
            },
          },

          skills: {
            select: {
              weight: true,

              skill: {
                select: {
                  id: true,

                  name: true,

                  code: true,
                },
              },
            },
          },
        },
      });


    if (
      questions.length === 0
    ) {

      throw new NotFoundException(
        'No question found',
      );
    }


    const randomIndex =
      Math.floor(
        Math.random()
        * questions.length,
      );


    return this.formatQuestion(
      questions[
        randomIndex
      ],
    );
  }


  // =====================================================
  // ADAPTIVE GENERATED QUESTION
  // =====================================================

  async getAdaptiveQuestion(
    studentId: number,
    classLevel: number,
    subjectCode: string,
  ) {

    // ===================================================
    // STUDENT
    // ===================================================

    const student =
      await this.prisma.student.findUnique({
        where: {
          id:
            studentId,
        },
      });


    if (!student) {

      throw new NotFoundException(
        `Student ${studentId} not found`,
      );
    }


    // ===================================================
    // SUBJECT
    // ===================================================

    const subject =
      await this.prisma.subject.findFirst({
        where: {
          code:
            subjectCode,

          class: {
            level:
              classLevel,
          },
        },

        include: {
          chapters: {
            orderBy: {
              order:
                'asc',
            },

            include: {
              topics:
                true,
            },
          },
        },
      });


    if (!subject) {

      throw new NotFoundException(
        `Subject ${subjectCode} not found`,
      );
    }


    // ===================================================
    // CHAPTER
    // ===================================================

    const chapter =
      subject.chapters.find(
        (item) =>
          item.name ===
          'Simple Equations',
      ) ??
      subject.chapters[0];


    if (!chapter) {

      throw new NotFoundException(
        'No chapter available',
      );
    }


    const topic =
      chapter.topics.find(
        (item) =>
          item.name ===
          'Solving Simple Equations',
      ) ??
      chapter.topics[0];


    if (!topic) {

      throw new NotFoundException(
        'No topic available',
      );
    }


    // ===================================================
    // STUDENT MASTERY
    // ===================================================

    const masteryRecords =
      await this.prisma
        .studentSkillMastery
        .findMany({

          where: {
            studentId,

            skill: {
              topic: {
                chapter: {
                  subjectId:
                    subject.id,
                },
              },
            },
          },

          include: {
            skill:
              true,
          },
        });


    let averageMastery =
      50;


    if (
      masteryRecords.length > 0
    ) {

      const total =
        masteryRecords.reduce(
          (
            sum,
            item,
          ) =>
            sum +
            item.mastery,
          0,
        );


      averageMastery =
        total /
        masteryRecords.length;
    }


    // ===================================================
    // DIFFICULTY
    // ===================================================

    let difficulty =
      1;


    if (
      averageMastery >= 70
    ) {

      difficulty =
        3;

    } else if (
      averageMastery >= 40
    ) {

      difficulty =
        2;
    }


    // ===================================================
    // WEAKEST SKILL
    // ===================================================

    let weakestSkill:
      | {
          id: number;

          code: string;

          name: string;

          mastery: number;
        }
      | null =
      null;


    if (
      masteryRecords.length > 0
    ) {

      const sorted =
        [
          ...masteryRecords,
        ].sort(
          (
            first,
            second,
          ) =>
            first.mastery -
            second.mastery,
        );


      const weakest =
        sorted[0];


      weakestSkill = {
        id:
          weakest.skill.id,

        code:
          weakest.skill.code,

        name:
          weakest.skill.name,

        mastery:
          weakest.mastery,
      };
    }


    // ===================================================
    // GENERATE TARGETED QUESTION
    // ===================================================

    const generated =
      await this.mathService
        .generateQuestion({

          classLevel,

          subject:
            subjectCode,

          chapter:
            chapter.name,

          difficulty,

          targetSkill:
            weakestSkill?.code ??
            null,
        });


    // ===================================================
    // FETCH SKILLS
    // ===================================================

    const skills =
      await this.prisma.skill.findMany({

        where: {
          code: {
            in:
              generated.skillCodes,
          },
        },
      });


    // ===================================================
    // SAVE GENERATED QUESTION
    // ===================================================

    const question =
      await this.prisma.question.create({

        data: {

          text:
            generated.question,

          difficulty:
            generated.predictedDifficulty,

          questionType:
            'STEP_BASED',

          expectedAnswer:
            generated.answer,

          expectedSteps: [
            generated.question
                .replace(/^Solve:\s*/i, '')
                .trim(),

          ...generated.steps,
],

          commonMistakes:
            [],

          isActive:
            true,

          chapterId:
            chapter.id,

          topicId:
            topic.id,

          skills: {
            create:
              skills.map(
                (skill) => ({

                  skillId:
                    skill.id,

                  weight:
                    skill.code ===
                    generated.targetSkill
                      ? 1.5
                      : 1,
                }),
              ),
          },
        },


        include: {
          chapter:
            true,

          topic:
            true,

          skills: {
            include: {
              skill:
                true,
            },
          },
        },
      });


    // ===================================================
    // SAFE RESPONSE
    // ===================================================

    return {

      student: {

        id:
          student.id,

        name:
          student.name,

        classLevel:
          student.classLevel,
      },


      adaptiveState: {

        averageMastery:
          Math.round(
            averageMastery
            * 100,
          ) / 100,

        selectedDifficulty:
          difficulty,

        modelPredictedDifficulty:
          generated.predictedDifficulty,

        weakestSkill,
      },


      generation: {

        generated:
          true,

        verified:
          generated.verified,

        engine:
          'GYANIVO_MATH_GENERATOR_V2',

        targetedSkill:
          generated.targetSkill,
      },


      question: {

        id:
          question.id,

        question:
          question.text,

        difficulty:
          question.difficulty,

        questionType:
          question.questionType,


        chapter: {

          id:
            question.chapter.id,

          name:
            question.chapter.name,
        },


        topic: {

          id:
            question.topic.id,

          name:
            question.topic.name,
        },


        skills:
          question.skills.map(
            (item) => ({

              id:
                item.skill.id,

              name:
                item.skill.name,

              code:
                item.skill.code,

              weight:
                item.weight,
            }),
          ),
      },
    };
  }


  // =====================================================
  // FORMAT OLD DB QUESTION
  // =====================================================

  private formatQuestion(
    question: {
      id: number;

      text: string;

      difficulty: number;

      questionType: string;

      chapter: {
        id: number;

        name: string;
      };

      topic: {
        id: number;

        name: string;
      };

      skills: {
        weight: number;

        skill: {
          id: number;

          name: string;

          code: string;
        };
      }[];
    },
  ) {

    return {

      id:
        question.id,

      question:
        question.text,

      difficulty:
        question.difficulty,

      questionType:
        question.questionType,

      chapter:
        question.chapter,

      topic:
        question.topic,

      skills:
        question.skills.map(
          (item) => ({

            id:
              item.skill.id,

            name:
              item.skill.name,

            code:
              item.skill.code,

            weight:
              item.weight,
          }),
        ),
    };
  }
}