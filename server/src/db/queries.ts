export const LIST_ROLES_QUERY = `
MATCH (role:Role)
RETURN properties(role) AS role
ORDER BY role.name
`;

export const LIST_SKILLS_QUERY = `
MATCH (skill:Skill)
RETURN properties(skill) AS skill
ORDER BY skill.category, skill.name
`;

export const LIST_ROLE_TRACKS_QUERY = `
MATCH (role:Role {slug: $targetRoleSlug})
OPTIONAL MATCH (role)-[:HAS_TRACK]->(track:Track)
RETURN properties(role) AS role,
       [item IN collect(track) | properties(item)] AS tracks
`;

export const TARGET_REQUIREMENTS_QUERY = `
MATCH (role:Role {slug: $targetRoleSlug})
OPTIONAL MATCH (role)-[:HAS_TRACK]->(track:Track)
WHERE $targetTrackSlug IS NOT NULL AND track.slug = $targetTrackSlug
WITH role, track
WHERE $targetTrackSlug IS NULL OR track IS NOT NULL
OPTIONAL MATCH (role)-[baseRelationship:REQUIRES]->(baseSkill:Skill)
WITH role, track,
     collect(DISTINCT CASE WHEN baseSkill IS NULL THEN null ELSE {
       skill: properties(baseSkill),
       relationship: properties(baseRelationship)
     } END) AS baseRequirements
OPTIONAL MATCH (track)-[trackRelationship:REQUIRES]->(trackSkill:Skill)
RETURN properties(role) AS role,
       CASE WHEN track IS NULL THEN null ELSE properties(track) END AS track,
       baseRequirements,
       collect(DISTINCT CASE WHEN trackSkill IS NULL THEN null ELSE {
         skill: properties(trackSkill),
         relationship: properties(trackRelationship)
       } END) AS trackRequirements
`;

export const SIMILAR_ROLES_QUERY = `
UNWIND $requirementDefinitions AS definition
MATCH (shared:Skill {slug: definition.skillSlug})<-[:REQUIRES]-(other:Role)
WHERE other.slug <> $targetRoleSlug
WITH other, shared, max(definition.weight) AS targetWeight
WITH other,
     collect({slug: shared.slug, name: shared.name, weight: targetWeight}) AS sharedSkills,
     sum(targetWeight) AS sharedWeight
RETURN properties(other) AS role,
       sharedSkills,
       size(sharedSkills) AS sharedSkillCount,
       sharedWeight
ORDER BY sharedWeight DESC, sharedSkillCount DESC, role.name
LIMIT 6
`;

export const LEARNING_PATHS_QUERY = `
UNWIND $requirementDefinitions AS requirement
MATCH (needed:Skill {slug: requirement.skillSlug})
WHERE NOT needed.slug IN $currentSkillSlugs
OPTIONAL MATCH path=(current:Skill)-[:PREREQUISITE_FOR*1..4]->(needed)
WHERE current.slug IN $currentSkillSlugs
RETURN properties(needed) AS targetSkill,
       properties(requirement) AS requirement,
       CASE WHEN path IS NULL THEN [] ELSE [node IN nodes(path) | properties(node)] END AS pathSkills,
       CASE WHEN path IS NULL THEN [] ELSE [relationship IN relationships(path) | type(relationship)] END AS relationshipTypes
ORDER BY targetSkill.difficulty, targetSkill.name,
         CASE WHEN path IS NULL THEN 999 ELSE length(path) END
LIMIT 100
`;

export const RECOMMENDED_PROJECTS_QUERY = `
UNWIND $requirementDefinitions AS requirement
MATCH (missing:Skill {slug: requirement.skillSlug})
WHERE NOT missing.slug IN $currentSkillSlugs
MATCH (project:Project)-[builds:BUILDS]->(missing)
WITH project, missing,
     max(requirement.weight) AS relevantWeight,
     max(CASE builds.depth
       WHEN 'advanced' THEN 3
       WHEN 'practical' THEN 2
       ELSE 1
     END) AS skillPracticalScore
WITH project,
     collect({slug: missing.slug, name: missing.name, weight: relevantWeight}) AS coveredSkills,
     sum(relevantWeight) AS coverageWeight,
     sum(skillPracticalScore) AS practicalScore
RETURN properties(project) AS project,
       coveredSkills,
       size(coveredSkills) AS coverageCount,
       coverageWeight,
       practicalScore
ORDER BY coverageCount DESC, coverageWeight DESC, practicalScore DESC, project.name
LIMIT 6
`;

export const ROLE_GRAPH_NEIGHBORHOOD_QUERY = `
MATCH (role:Role {slug: $targetRoleSlug})
OPTIONAL MATCH prerequisitePath=(prerequisite:Skill)-[:PREREQUISITE_FOR*1..2]->(requiredSkill:Skill)
WHERE requiredSkill.slug IN $requirementSkillSlugs
WITH role,
     collect(DISTINCT CASE WHEN prerequisitePath IS NULL THEN null ELSE {
       skills: [node IN nodes(prerequisitePath) | properties(node)]
     } END)[0..50] AS prerequisitePaths
OPTIONAL MATCH (project:Project)-[builds:BUILDS]->(covered:Skill)
WHERE covered.slug IN $requirementSkillSlugs
  AND NOT covered.slug IN $currentSkillSlugs
RETURN properties(role) AS role,
       prerequisitePaths,
       collect(DISTINCT CASE WHEN project IS NULL THEN null ELSE {
         project: properties(project),
         skill: properties(covered),
         relationship: properties(builds)
       } END)[0..60] AS projectMatches
`;

export const UPSERT_ROLES_QUERY = `
UNWIND $items AS item
MERGE (role:Role {slug: item.slug})
SET role.name = item.name,
    role.summary = item.summary,
    role.category = item.category,
    role.experienceLevel = item.experienceLevel,
    role.description = item.description
RETURN count(role) AS count
`;

export const UPSERT_SKILLS_QUERY = `
UNWIND $items AS item
MERGE (skill:Skill {slug: item.slug})
SET skill.name = item.name,
    skill.category = item.category,
    skill.description = item.description,
    skill.difficulty = item.difficulty
RETURN count(skill) AS count
`;

export const UPSERT_TRACKS_QUERY = `
UNWIND $items AS item
MERGE (track:Track {slug: item.slug})
SET track.name = item.name,
    track.summary = item.summary,
    track.description = item.description,
    track.category = item.category,
    track.parentRoleSlug = item.parentRoleSlug
RETURN count(track) AS count
`;

export const UPSERT_ROLE_TRACKS_QUERY = `
UNWIND $items AS item
MATCH (role:Role {slug: item.roleSlug})
MATCH (track:Track {slug: item.trackSlug})
MERGE (role)-[:HAS_TRACK]->(track)
RETURN count(*) AS count
`;

export const UPSERT_TRACK_REQUIREMENTS_QUERY = `
UNWIND $items AS item
MATCH (track:Track {slug: item.trackSlug})
MATCH (skill:Skill {slug: item.skillSlug})
MERGE (track)-[relationship:REQUIRES]->(skill)
SET relationship.importance = item.importance,
    relationship.weight = item.weight,
    relationship.targetLevel = item.targetLevel
RETURN count(relationship) AS count
`;

export const UPSERT_PROJECTS_QUERY = `
UNWIND $items AS item
MERGE (project:Project {slug: item.slug})
SET project.name = item.name,
    project.summary = item.summary,
    project.difficulty = item.difficulty,
    project.estimatedHours = item.estimatedHours,
    project.category = item.category
RETURN count(project) AS count
`;

export const UPSERT_REQUIREMENTS_QUERY = `
UNWIND $items AS item
MATCH (role:Role {slug: item.roleSlug})
MATCH (skill:Skill {slug: item.skillSlug})
MERGE (role)-[relationship:REQUIRES]->(skill)
SET relationship.importance = item.importance,
    relationship.weight = item.weight,
    relationship.targetLevel = item.targetLevel
RETURN count(relationship) AS count
`;

export const UPSERT_PREREQUISITES_QUERY = `
UNWIND $items AS item
MATCH (before:Skill {slug: item.beforeSlug})
MATCH (after:Skill {slug: item.afterSlug})
MERGE (before)-[:PREREQUISITE_FOR]->(after)
RETURN count(*) AS count
`;

export const UPSERT_PROJECT_SKILLS_QUERY = `
UNWIND $items AS item
MATCH (project:Project {slug: item.projectSlug})
MATCH (skill:Skill {slug: item.skillSlug})
MERGE (project)-[relationship:BUILDS]->(skill)
SET relationship.depth = item.depth
RETURN count(relationship) AS count
`;
