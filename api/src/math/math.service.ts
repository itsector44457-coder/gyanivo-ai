import {
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';


type ValidateStepInput = {
  equation: string;

  previousStep: string;

  studentStep: string;
};


type ValidateStepResult = {
  correct: boolean;

  mistakeType: string;

  skill: string | null;

  retry: boolean;

  message: string;
};


export type GenerateQuestionInput = {
  classLevel: number;

  subject: string;

  chapter: string;

  difficulty: number;

  targetSkill?: string | null;
};


export type GeneratedQuestionResult = {
  question: string;

  answer: string;

  steps: string[];

  difficulty: number;

  predictedDifficulty: number;

  skillCodes: string[];

  targetSkill: string | null;

  verified: boolean;
};


export type KnowledgeTracingInput = {
  currentMastery: number;

  correct: boolean;

  hintUsed: boolean;

  attemptNumber: number;

  difficulty: number;

  skillWeight: number;

  timeTakenSec?: number;
};


export type KnowledgeTracingResult = {
  previousMastery: number;

  mastery: number;

  probabilityKnown: number;

  observation: string;

  parameters: {
    guess: number;

    slip: number;

    learn: number;

    evidenceStrength: number;
  };
};


@Injectable()
export class MathService {

  private readonly mlServiceUrl:
    string;


  constructor() {

    this.mlServiceUrl =
      process.env.ML_SERVICE_URL ??
      'http://127.0.0.1:8000';
  }


  // =====================================================
  // STEP VALIDATION
  // =====================================================

  async validateStep(
    data: ValidateStepInput,
  ): Promise<ValidateStepResult> {

    try {

      const response =
        await fetch(
          `${this.mlServiceUrl}/validate-step`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                equation:
                  data.equation,

                previousStep:
                  data.previousStep,

                studentStep:
                  data.studentStep,
              }),
          },
        );


      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          errorText,
        );
      }


      return (
        await response.json()
      ) as ValidateStepResult;

    } catch (error) {

      console.error(
        'ML validation error:',
        error,
      );

      throw new InternalServerErrorException(
        'Unable to validate mathematical step',
      );
    }
  }


  // =====================================================
  // QUESTION GENERATION
  // =====================================================

  async generateQuestion(
    data: GenerateQuestionInput,
  ): Promise<GeneratedQuestionResult> {

    try {

      const response =
        await fetch(
          `${this.mlServiceUrl}/generate-question`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                classLevel:
                  data.classLevel,

                subject:
                  data.subject,

                chapter:
                  data.chapter,

                difficulty:
                  data.difficulty,

                targetSkill:
                  data.targetSkill ??
                  null,
              }),
          },
        );


      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          errorText,
        );
      }


      const generated =
        (
          await response.json()
        ) as GeneratedQuestionResult;


      if (!generated.verified) {

        throw new Error(
          'Generated question failed verification',
        );
      }


      return generated;

    } catch (error) {

      console.error(
        'Question generation error:',
        error,
      );

      throw new InternalServerErrorException(
        'Unable to generate adaptive question',
      );
    }
  }


  // =====================================================
  // KNOWLEDGE TRACING
  // =====================================================

  async updateKnowledge(
    data: KnowledgeTracingInput,
  ): Promise<KnowledgeTracingResult> {

    try {

      const response =
        await fetch(
          `${this.mlServiceUrl}/knowledge-tracing/update`,
          {
            method:
              'POST',

            headers: {
              'Content-Type':
                'application/json',
            },

            body:
              JSON.stringify({
                currentMastery:
                  data.currentMastery,

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
              }),
          },
        );


      if (!response.ok) {

        const errorText =
          await response.text();

        throw new Error(
          errorText,
        );
      }


      return (
        await response.json()
      ) as KnowledgeTracingResult;

    } catch (error) {

      console.error(
        'Knowledge tracing error:',
        error,
      );

      throw new InternalServerErrorException(
        'Unable to update student mastery',
      );
    }
  }
}