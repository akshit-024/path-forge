import { closeDriver, runWrite, verifyDatabaseConnectivity } from './driver.js';
import {
  UPSERT_PREREQUISITES_QUERY,
  UPSERT_PROJECTS_QUERY,
  UPSERT_PROJECT_SKILLS_QUERY,
  UPSERT_REQUIREMENTS_QUERY,
  UPSERT_ROLE_TRACKS_QUERY,
  UPSERT_ROLES_QUERY,
  UPSERT_SKILLS_QUERY,
  UPSERT_TRACK_REQUIREMENTS_QUERY,
  UPSERT_TRACKS_QUERY,
} from './queries.js';
import {
  prerequisites,
  projects,
  projectSkills,
  requirements,
  roleTracks,
  roles,
  skills,
  trackRequirements,
  tracks,
  validateSeedData,
} from './seed-data.js';

async function seed(): Promise<void> {
  validateSeedData();
  await verifyDatabaseConnectivity();

  await runWrite(UPSERT_ROLES_QUERY, { items: roles });
  await runWrite(UPSERT_SKILLS_QUERY, { items: skills });
  await runWrite(UPSERT_TRACKS_QUERY, { items: tracks });
  await runWrite(UPSERT_PROJECTS_QUERY, { items: projects });
  await runWrite(UPSERT_REQUIREMENTS_QUERY, { items: requirements });
  await runWrite(UPSERT_ROLE_TRACKS_QUERY, { items: roleTracks });
  await runWrite(UPSERT_TRACK_REQUIREMENTS_QUERY, { items: trackRequirements });
  await runWrite(UPSERT_PREREQUISITES_QUERY, { items: prerequisites });
  await runWrite(UPSERT_PROJECT_SKILLS_QUERY, { items: projectSkills });

  console.log(
    [
      'PathForge seed complete:',
      `${roles.length} roles`,
      `${tracks.length} tracks`,
      `${skills.length} skills`,
      `${projects.length} projects`,
      `${requirements.length} requirements`,
      `${trackRequirements.length} track requirements`,
      `${prerequisites.length} prerequisites`,
      `${projectSkills.length} project-skill links`,
    ].join(' '),
  );
}

try {
  await seed();
} catch (error) {
  const message = error instanceof Error ? error.message : 'Unknown seed failure';
  console.error(`PathForge seed failed: ${message}`);
  process.exitCode = 1;
} finally {
  try {
    await closeDriver();
  } catch {
    console.error('PathForge could not close the database driver cleanly.');
    process.exitCode = 1;
  }
}
