import type { AppConfig } from '../config/env.js';
import type { AppServices } from '../types/services.js';
import { DefaultAnalysisService } from './analysis-service.js';
import { DefaultCatalogService } from './catalog-service.js';
import { DefaultGraphService } from './graph-service.js';
import { DefaultHealthService } from './health-service.js';
import { Neo4jGraphRepository } from './repository.js';
import { TargetRequirementsResolver } from './target-requirements.js';

export function createServices(config: AppConfig): AppServices {
  const repository = new Neo4jGraphRepository();
  const targetResolver = new TargetRequirementsResolver(repository);
  return {
    health: new DefaultHealthService(config),
    catalog: new DefaultCatalogService(repository, targetResolver),
    analysis: new DefaultAnalysisService(repository, targetResolver),
    graph: new DefaultGraphService(repository, targetResolver),
  };
}
