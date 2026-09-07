import { ProviderCapabilities, RawCoursePayload } from '../types/course.types';

export interface ICourseProvider {
  readonly providerCode: string;
  readonly providerName: string;
  readonly providerType: string;

  getCapabilities(): ProviderCapabilities;
  fetchCatalog(): Promise<RawCoursePayload[]>;
  getCourseByExternalId(externalId: string): Promise<RawCoursePayload | null>;
}
