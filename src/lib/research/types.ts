/**
 * Research agent is intentionally decoupled from the writer.
 * Future pipeline: Outline → Research Agent → Sources → Fact check → Writer.
 * Nothing in the writing path imports a concrete research implementation.
 */

export interface SourceRecord {
  id: string;
  title: string;
  author: string;
  year: string;
  url: string;
  doi: string;
  notes: string;
  verified: boolean;
  retrievedAt?: number;
}

export interface ResearchRequest {
  query: string;
  language: string;
  maxSources: number;
}

export interface ResearchAgent {
  search(request: ResearchRequest): Promise<SourceRecord[]>;
}

export class NoopResearchAgent implements ResearchAgent {
  async search(): Promise<SourceRecord[]> {
    return [];
  }
}
