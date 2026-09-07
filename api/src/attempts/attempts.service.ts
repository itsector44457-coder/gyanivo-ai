import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';

import { MathService } from '../math/math.service';


@Injectable()
export class AttemptsService {

  constructor(
    private readonly prisma:
      PrismaService,

    private readonly mathService:
      MathService,
  ) {}


  // =====================================================
  // START ATTEMPT
  // =====================================================

  async startAttempt(
    studentId: number,
    questionId: number,
  ) {

    const student =
      await this.prisma.student.findUnique({
        where: {
          id:
            studentId,
        },
      });


    if (!student) {

      throw new NotFoundException(
        `Student with id ${studentId} not found`,
      );
    }


    const question =
      await this.prisma.question.findUnique({

        where: {
          id:
            questionId,
        },

        select: {
          id:
            true,

          text:
            true,

          difficulty:
            true,

          questionType:
            true,

          chapter: {
            select: {
              name:
                true,
            },
          },

          topic: {
            select: {
              name:
                true,
            },
          },
        },
      });


    if (!question) {

      throw new NotFoundException(
        `Question with id ${questionId} not found`,
      );
    }


    const attempt =
      await this.prisma.attempt.create({

        data: {
          studentId,

          questionId,
        },
      });


    return {

      attemptId:
        attempt.id,

      status:
        attempt.status,

      question: {

        id:
          question.id,

        text:
          question.text,

        difficulty:
          question.difficulty,

        questionType:
          question.questionType,

        chapter:
          question.chapter.name,

        topic:
          question.topic.name,
      },
    };
  }


  // =====================================================
  // VALIDATE STEP
  // =====================================================

  async validateStep(
    attemptId: number,

    data: {
      studentStep: string;

      stepNumber: number;

      timeTakenSec?: number;

      hintUsed?: boolean;
    },
  ) {

    if (
      !data.studentStep
      ||
      !data.studentStep.trim()
    ) {

      throw new BadRequestException(
        'studentStep is required',
      );
    }


    if (
      !data.stepNumber
      ||
      data.stepNumber < 1
    ) {

      throw new BadRequestException(
        'Valid stepNumber is required',
      );
    }


    const attempt =
      await this.prisma.attempt.findUnique({

        where: {
          id:
            attemptId,
        },

        include: {

          question: {

            include: {

              skills: {

                include: {
                  skill:
                    true,
                },
              },
            },
          },

          steps: {

            orderBy: {
              createdAt:
                'asc',
            },
          },
        },
      });


    if (!attempt) {

      throw new NotFoundException(
        `Attempt with id ${attemptId} not found`,
      );
    }


    if (
      attempt.status ===
      'COMPLETED'
    ) {

      throw new BadRequestException(
        'This attempt is already completed',
      );
    }


    const expectedSteps =
      attempt.question
        .expectedSteps as string[];


    if (
      !expectedSteps
      ||
      expectedSteps.length < 2
    ) {

      throw new BadRequestException(
        'Question does not have valid expected steps',
      );
    }


    const finalStepNumber =
      expectedSteps.length - 1;


    if (
      data.stepNumber >
      finalStepNumber
    ) {

      throw new BadRequestException(
        `Maximum step number is ${finalStepNumber}`,
      );
    }


    const previousStep =
      expectedSteps[
        data.stepNumber - 1
      ];


    // ===================================================
    // MATH VALIDATION
    // ===================================================

    const validation =
      await this.mathService.validateStep({

        equation:
          attempt.question.text
            .replace(
              /^Solve:\s*/i,
              '',
            )
            .trim(),

        previousStep,

        studentStep:
          data.studentStep.trim(),
      });


    // ===================================================
    // RETRY NUMBER
    // ===================================================

    const previousAttempts =
      await this.prisma.attemptStep.count({

        where: {

          attemptId,

          stepNumber:
            data.stepNumber,
        },
      });


    const attemptNumber =
      previousAttempts + 1;


    // ===================================================
    // DETERMINE SKILL
    // ===================================================

    const sortedQuestionSkills =
      [
        ...attempt.question.skills,
      ].sort(
        (
          first,
          second,
        ) =>
          second.weight
          -
          first.weight,
      );


    const primarySkill =
      sortedQuestionSkills[0];


    const masterySkillCode =
      validation.skill
      ??
      primarySkill?.skill.code
      ??
      null;


    let masterySkillWeight =
      primarySkill?.weight
      ??
      1;


    if (masterySkillCode) {

      const matchingSkill =
        attempt.question.skills.find(
          (item) =>
            item.skill.code ===
            masterySkillCode,
        );


      if (matchingSkill) {

        masterySkillWeight =
          matchingSkill.weight;
      }
    }


    // ===================================================
    // SAVE STEP
    // ===================================================

    const savedStep =
      await this.prisma.attemptStep.create({

        data: {

          attemptId,

          stepNumber:
            data.stepNumber,

          studentStep:
            data.studentStep.trim(),

          isCorrect:
            validation.correct,

          mistakeType:
            validation.mistakeType,

          skillCode:
            masterySkillCode,

          attemptNumber,

          hintUsed:
            data.hintUsed
            ?? false,

          timeTakenSec:
            data.timeTakenSec,
        },
      });


    // ===================================================
    // KNOWLEDGE TRACING UPDATE
    // ===================================================

    let masteryUpdate:
      | {
          skillCode: string;

          previousMastery: number;

          mastery: number;

          probabilityKnown: number;

          observation: string;
        }
      | null =
      null;


    if (masterySkillCode) {

      masteryUpdate =
        await this.updateMasteryWithKnowledgeTracing({

          studentId:
            attempt.studentId,

          skillCode:
            masterySkillCode,

          correct:
            validation.correct,

          hintUsed:
            data.hintUsed
            ?? false,

          attemptNumber,

          difficulty:
            attempt.question.difficulty,

          skillWeight:
            masterySkillWeight,

          timeTakenSec:
            data.timeTakenSec,
        });
    }


    // ===================================================
    // ATTEMPT COMPLETION
    // ===================================================

    let attemptCompleted =
      false;


    if (
      validation.correct
      &&
      data.stepNumber ===
      finalStepNumber
    ) {

      await this.prisma.attempt.update({

        where: {
          id:
            attemptId,
        },

        data: {

          status:
            'COMPLETED',

          completedAt:
            new Date(),
        },
      });


      attemptCompleted =
        true;
    }


    return {

      ...validation,

      attemptId,

      savedStepId:
        savedStep.id,

      stepNumber:
        data.stepNumber,

      attemptNumber,

      finalStepNumber,

      attemptCompleted,

      nextStepNumber:
        validation.correct
        &&
        !attemptCompleted

          ? data.stepNumber + 1

          : data.stepNumber,

      masteryUpdate,
    };
  }


  // =====================================================
  // KNOWLEDGE TRACING
  // =====================================================

  private async updateMasteryWithKnowledgeTracing(
    data: {
      studentId: number;

      skillCode: string;

      correct: boolean;

      hintUsed: boolean;

      attemptNumber: number;

      difficulty: number;

      skillWeight: number;

      timeTakenSec?: number;
    },
  ) {

    const skill =
      await this.prisma.skill.findUnique({

        where: {
          code:
            data.skillCode,
        },
      });


    if (!skill) {

      return null;
    }


    const existing =
      await this.prisma
        .studentSkillMastery
        .findUnique({

          where: {

            studentId_skillId: {

              studentId:
                data.studentId,

              skillId:
                skill.id,
            },
          },
        });


    const currentMastery =
      existing?.mastery
      ??
      50;


    const knowledgeResult =
      await this.mathService.updateKnowledge({

        currentMastery,

        correct:
          data.correct,

        hintUsed:
          data.hintUsed,

        attemptNumber:
          data.attemptNumber,

        difficulty:
          data.difficulty,

        skillWeight:
          data.skillWeight,

        timeTakenSec:
          data.timeTakenSec,
      });


    await this.prisma
      .studentSkillMastery
      .upsert({

        where: {

          studentId_skillId: {

            studentId:
              data.studentId,

            skillId:
              skill.id,
          },
        },

        update: {

          mastery:
            knowledgeResult.mastery,

          attempts: {
            increment:
              1,
          },

          correct:
            data.correct

            ? {
                increment:
                  1,
              }

            : undefined,

          incorrect:
            !data.correct

            ? {
                increment:
                  1,
              }

            : undefined,
        },

        create: {

          studentId:
            data.studentId,

          skillId:
            skill.id,

          mastery:
            knowledgeResult.mastery,

          attempts:
            1,

          correct:
            data.correct
            ? 1
            : 0,

          incorrect:
            data.correct
            ? 0
            : 1,
        },
      });


    return {

      skillCode:
        data.skillCode,

      previousMastery:
        knowledgeResult.previousMastery,

      mastery:
        knowledgeResult.mastery,

      probabilityKnown:
        knowledgeResult.probabilityKnown,

      observation:
        knowledgeResult.observation,
    };
  }
}