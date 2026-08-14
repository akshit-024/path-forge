import type {
  Difficulty,
  Importance,
  ProjectDepth,
  ProjectDto,
  RoleDto,
  SkillDto,
  TrackDto,
} from '../types/domain.js';

export interface RequirementSeed {
  roleSlug: string;
  skillSlug: string;
  importance: Importance;
  weight: number;
  targetLevel: Difficulty;
}

export interface RoleTrackSeed {
  roleSlug: string;
  trackSlug: string;
}

export interface TrackRequirementSeed {
  trackSlug: string;
  skillSlug: string;
  importance: Importance;
  weight: number;
  targetLevel: Difficulty;
}

export interface PrerequisiteSeed {
  beforeSlug: string;
  afterSlug: string;
}

export interface ProjectSkillSeed {
  projectSlug: string;
  skillSlug: string;
  depth: ProjectDepth;
}

const skill = (
  slug: string,
  name: string,
  category: string,
  difficulty: Difficulty,
  description: string,
): SkillDto => ({ slug, name, category, difficulty, description });

export const skills: SkillDto[] = [
  skill(
    'programming-fundamentals',
    'Programming Fundamentals',
    'Computer Science Foundations',
    'foundation',
    'Variables, control flow, functions, and systematic problem solving.',
  ),
  skill(
    'data-structures',
    'Data Structures',
    'Computer Science Foundations',
    'intermediate',
    "Choosing and using collections that fit a problem's access patterns.",
  ),
  skill(
    'algorithms',
    'Algorithms',
    'Computer Science Foundations',
    'intermediate',
    'Designing efficient procedures and reasoning about their complexity.',
  ),
  skill(
    'python',
    'Python',
    'Programming Languages',
    'foundation',
    'Writing clear Python programs and working with its package ecosystem.',
  ),
  skill(
    'javascript',
    'JavaScript',
    'Programming Languages',
    'foundation',
    'Building application behavior with modern JavaScript.',
  ),
  skill(
    'typescript',
    'TypeScript',
    'Programming Languages',
    'intermediate',
    'Using static types to make JavaScript systems safer to evolve.',
  ),
  skill(
    'html',
    'HTML',
    'Frontend',
    'foundation',
    'Structuring accessible, semantic web documents.',
  ),
  skill(
    'css',
    'CSS',
    'Frontend',
    'foundation',
    'Creating responsive and maintainable visual layouts.',
  ),
  skill(
    'react',
    'React',
    'Frontend',
    'intermediate',
    'Building component-driven interactive user interfaces.',
  ),
  skill(
    'nodejs',
    'Node.js',
    'Backend',
    'intermediate',
    'Running event-driven JavaScript services on the server.',
  ),
  skill(
    'express',
    'Express',
    'Backend',
    'intermediate',
    'Designing focused HTTP services and middleware in Node.js.',
  ),
  skill(
    'http',
    'HTTP',
    'Backend',
    'foundation',
    'Understanding web requests, responses, methods, status codes, and caching.',
  ),
  skill(
    'rest-apis',
    'REST APIs',
    'Backend',
    'intermediate',
    'Designing resource-oriented, predictable service interfaces.',
  ),
  skill(
    'authentication',
    'Authentication',
    'Backend',
    'intermediate',
    'Implementing secure identity, sessions, and authorization boundaries.',
  ),
  skill(
    'sql',
    'SQL',
    'Databases',
    'foundation',
    'Querying and transforming structured relational data.',
  ),
  skill(
    'data-modeling',
    'Data Modeling',
    'Databases',
    'intermediate',
    'Representing entities, constraints, and relationships intentionally.',
  ),
  skill(
    'postgresql',
    'PostgreSQL',
    'Databases',
    'intermediate',
    'Operating and querying a production-grade relational database.',
  ),
  skill(
    'mongodb',
    'MongoDB',
    'Databases',
    'intermediate',
    'Modeling and querying document-oriented data.',
  ),
  skill(
    'git',
    'Git',
    'Developer Tools',
    'foundation',
    'Tracking changes and collaborating safely through version control.',
  ),
  skill(
    'github',
    'GitHub',
    'Developer Tools',
    'foundation',
    'Collaborating through pull requests, reviews, and repository automation.',
  ),
  skill(
    'linux',
    'Linux',
    'Cloud and DevOps',
    'foundation',
    'Navigating, configuring, and troubleshooting Linux systems.',
  ),
  skill(
    'docker',
    'Docker',
    'Cloud and DevOps',
    'intermediate',
    'Packaging services into repeatable, portable containers.',
  ),
  skill(
    'ci-cd',
    'CI/CD',
    'Cloud and DevOps',
    'intermediate',
    'Automating validation and safe delivery of software changes.',
  ),
  skill(
    'cloud-fundamentals',
    'Cloud Fundamentals',
    'Cloud and DevOps',
    'foundation',
    'Understanding cloud compute, storage, networking, and shared responsibility.',
  ),
  skill(
    'aws',
    'AWS',
    'Cloud and DevOps',
    'intermediate',
    'Building systems with commonly used AWS managed services.',
  ),
  skill(
    'testing-fundamentals',
    'Testing Fundamentals',
    'Testing',
    'foundation',
    'Choosing useful test boundaries and verifying observable behavior.',
  ),
  skill(
    'unit-testing',
    'Unit Testing',
    'Testing',
    'intermediate',
    'Testing small units deterministically with focused feedback.',
  ),
  skill(
    'api-testing',
    'API Testing',
    'Testing',
    'intermediate',
    'Verifying service contracts, failures, and integration behavior.',
  ),
  skill(
    'pandas',
    'Pandas',
    'Data Analytics',
    'intermediate',
    'Cleaning, joining, and analyzing tabular data in Python.',
  ),
  skill(
    'numpy',
    'NumPy',
    'Data Analytics',
    'intermediate',
    'Performing efficient numerical operations on multidimensional arrays.',
  ),
  skill(
    'excel',
    'Excel',
    'Data Analytics',
    'foundation',
    'Exploring, calculating, and communicating structured business data.',
  ),
  skill(
    'power-bi',
    'Power BI',
    'Data Analytics',
    'intermediate',
    'Creating governed and interactive business intelligence reports.',
  ),
  skill(
    'data-cleaning',
    'Data Cleaning',
    'Data Analytics',
    'foundation',
    'Detecting and correcting missing, inconsistent, and invalid data.',
  ),
  skill(
    'exploratory-data-analysis',
    'Exploratory Data Analysis',
    'Data Analytics',
    'intermediate',
    'Finding patterns, anomalies, and useful questions in data.',
  ),
  skill(
    'statistics',
    'Statistics',
    'Data Analytics',
    'intermediate',
    'Reasoning about distributions, uncertainty, samples, and inference.',
  ),
  skill(
    'linear-algebra',
    'Linear Algebra',
    'AI and Machine Learning',
    'intermediate',
    'Using vectors, matrices, and transformations in numerical models.',
  ),
  skill(
    'machine-learning',
    'Machine Learning',
    'AI and Machine Learning',
    'advanced',
    'Training, evaluating, and improving predictive models.',
  ),
  skill(
    'deep-learning',
    'Deep Learning',
    'AI and Machine Learning',
    'advanced',
    'Building and tuning multilayer neural network systems.',
  ),
  skill(
    'nlp',
    'Natural Language Processing',
    'AI and Machine Learning',
    'advanced',
    'Representing and modeling human language computationally.',
  ),
  skill(
    'llm-fundamentals',
    'LLM Fundamentals',
    'AI and Machine Learning',
    'advanced',
    'Understanding transformers, tokens, prompting, and model limitations.',
  ),
  skill(
    'rag',
    'Retrieval-Augmented Generation',
    'AI and Machine Learning',
    'advanced',
    'Grounding generated answers in retrieved source material.',
  ),
  skill(
    'vector-databases',
    'Vector Databases',
    'Databases',
    'advanced',
    'Indexing embeddings and retrieving semantically similar records.',
  ),
  skill(
    'data-warehousing',
    'Data Warehousing',
    'Databases',
    'advanced',
    'Designing analytical stores around durable business facts and dimensions.',
  ),
  skill(
    'etl',
    'ETL',
    'Data Analytics',
    'intermediate',
    'Extracting, validating, transforming, and loading data reliably.',
  ),
  skill(
    'apache-spark',
    'Apache Spark',
    'Data Analytics',
    'advanced',
    'Processing distributed datasets through resilient parallel computation.',
  ),
  skill(
    'workflow-orchestration',
    'Workflow Orchestration',
    'Cloud and DevOps',
    'advanced',
    'Scheduling, observing, and recovering multi-step data workflows.',
  ),
  skill(
    'observability',
    'Observability',
    'Cloud and DevOps',
    'intermediate',
    'Using logs, metrics, and traces to understand running systems.',
  ),
  skill(
    'system-design',
    'System Design',
    'Computer Science Foundations',
    'advanced',
    'Balancing reliability, scalability, data flow, and operational trade-offs.',
  ),
  skill(
    'web-accessibility',
    'Web Accessibility',
    'Frontend',
    'intermediate',
    'Designing and testing inclusive interfaces against accessibility standards.',
  ),
  skill(
    'state-management',
    'State Management',
    'Frontend',
    'intermediate',
    'Modeling predictable client state across components and asynchronous workflows.',
  ),
  skill(
    'prompt-engineering',
    'Prompt Engineering',
    'AI and Machine Learning',
    'intermediate',
    'Designing and evaluating structured instructions for generative models.',
  ),
  skill(
    'embeddings',
    'Embeddings',
    'AI and Machine Learning',
    'advanced',
    'Representing content as vectors for semantic retrieval and comparison.',
  ),
  skill(
    'model-evaluation',
    'Model Evaluation',
    'AI and Machine Learning',
    'advanced',
    'Measuring model quality, robustness, safety, and task-specific trade-offs.',
  ),
  skill(
    'mlops',
    'MLOps',
    'AI and Machine Learning',
    'advanced',
    'Versioning, deploying, monitoring, and governing machine-learning systems.',
  ),
  skill(
    'data-visualization',
    'Data Visualization',
    'Data Analytics',
    'intermediate',
    'Choosing visual encodings that communicate data accurately and clearly.',
  ),
  skill(
    'tableau',
    'Tableau',
    'Data Analytics',
    'intermediate',
    'Building interactive, maintainable analytical dashboards in Tableau.',
  ),
  skill(
    'business-intelligence',
    'Business Intelligence',
    'Data Analytics',
    'intermediate',
    'Translating business questions into governed metrics and decision-ready reporting.',
  ),
  skill(
    'angular',
    'Angular',
    'Frontend',
    'advanced',
    'Building structured web applications with Angular components, services, and dependency injection.',
  ),
  skill(
    'rxjs',
    'RxJS',
    'Frontend',
    'advanced',
    'Composing asynchronous and event-driven workflows with observable streams.',
  ),
  skill(
    'vuejs',
    'Vue.js',
    'Frontend',
    'intermediate',
    'Building progressive component-based interfaces with the Vue ecosystem.',
  ),
  skill(
    'django',
    'Django',
    'Backend',
    'advanced',
    'Building secure, data-backed Python web applications with Django.',
  ),
  skill(
    'fastapi',
    'FastAPI',
    'Backend',
    'advanced',
    'Building typed, asynchronous Python APIs with automatic contract documentation.',
  ),
  skill(
    'java',
    'Java',
    'Programming Languages',
    'intermediate',
    'Building statically typed, object-oriented applications on the JVM.',
  ),
  skill(
    'spring-boot',
    'Spring Boot',
    'Backend',
    'advanced',
    'Creating production Java services with the Spring application ecosystem.',
  ),
  skill(
    'computer-vision',
    'Computer Vision',
    'AI and Machine Learning',
    'advanced',
    'Training systems to interpret, classify, and locate information in images.',
  ),
  skill(
    'opencv',
    'OpenCV',
    'AI and Machine Learning',
    'advanced',
    'Processing image and video data with practical computer-vision algorithms.',
  ),
];

const role = (
  slug: string,
  name: string,
  category: string,
  summary: string,
  description: string,
): RoleDto => ({
  slug,
  name,
  category,
  summary,
  description,
  experienceLevel: 'early-career',
});

export const roles: RoleDto[] = [
  role(
    'backend-developer',
    'Backend Developer',
    'Software Engineering',
    'Build reliable services and data-backed APIs.',
    'Backend developers turn product behavior into secure APIs, business logic, and dependable data flows.',
  ),
  role(
    'full-stack-developer',
    'Full-Stack Developer',
    'Software Engineering',
    'Deliver complete web features across client and server.',
    'Full-stack developers connect accessible interfaces to well-designed APIs and persistent data.',
  ),
  role(
    'frontend-developer',
    'Frontend Developer',
    'Software Engineering',
    'Create accessible, responsive web experiences.',
    'Frontend developers transform product requirements into fast, usable, component-driven interfaces.',
  ),
  role(
    'python-developer',
    'Python Developer',
    'Software Engineering',
    'Build maintainable applications and automation in Python.',
    "Python developers use the language's broad ecosystem for services, tooling, and data-oriented applications.",
  ),
  role(
    'data-analyst',
    'Data Analyst',
    'Data and Analytics',
    'Turn raw business data into useful decisions.',
    'Data analysts clean, explore, visualize, and communicate evidence for stakeholders.',
  ),
  role(
    'data-engineer',
    'Data Engineer',
    'Data and Analytics',
    'Build trustworthy analytical data pipelines.',
    'Data engineers create observable pipelines and durable models that make data usable at scale.',
  ),
  role(
    'ai-engineer',
    'AI Engineer',
    'AI and Machine Learning',
    'Ship grounded AI capabilities in real products.',
    'AI engineers connect language and machine-learning models to reliable application and retrieval systems.',
  ),
  role(
    'machine-learning-engineer',
    'Machine Learning Engineer',
    'AI and Machine Learning',
    'Train and productionize predictive systems.',
    'Machine-learning engineers combine statistical modeling with software and deployment discipline.',
  ),
  role(
    'devops-engineer',
    'DevOps Engineer',
    'Cloud and Operations',
    'Automate delivery and improve production reliability.',
    'DevOps engineers make infrastructure, deployments, and operational feedback safe and repeatable.',
  ),
  role(
    'qa-automation-engineer',
    'QA Automation Engineer',
    'Quality Engineering',
    'Build automated confidence into software delivery.',
    'QA automation engineers design robust test systems across user, API, and delivery boundaries.',
  ),
];

const track = (
  slug: string,
  name: string,
  parentRoleSlug: string,
  category: string,
  summary: string,
  description: string,
): TrackDto => ({ slug, name, parentRoleSlug, category, summary, description });

export const tracks: TrackDto[] = [
  track(
    'react-frontend',
    'React Frontend',
    'frontend-developer',
    'Frontend Engineering',
    'Build maintainable, stateful interfaces with the React ecosystem.',
    'This track deepens React, TypeScript, state management, accessibility, and component-testing skills.',
  ),
  track(
    'angular-frontend',
    'Angular Frontend',
    'frontend-developer',
    'Frontend Engineering',
    'Build structured enterprise interfaces with Angular and reactive data flows.',
    'This track combines Angular, TypeScript, RxJS, testing, accessibility, and modern web foundations.',
  ),
  track(
    'vuejs-frontend',
    'Vue.js Frontend',
    'frontend-developer',
    'Frontend Engineering',
    'Create progressive, component-based interfaces with Vue.js.',
    'This track develops Vue.js, typed client state, testing, accessibility, and browser fundamentals.',
  ),
  track(
    'mern-stack',
    'MERN Stack',
    'full-stack-developer',
    'Full-Stack Engineering',
    'Build complete web products with MongoDB, Express, React, and Node.js.',
    'This track connects a React client to authenticated Node.js APIs and document-oriented persistence.',
  ),
  track(
    'mean-stack',
    'MEAN Stack',
    'full-stack-developer',
    'Full-Stack Engineering',
    'Build full-stack applications with MongoDB, Express, Angular, and Node.js.',
    'This track combines Angular and RxJS with typed Node.js services and document data modeling.',
  ),
  track(
    'pern-stack',
    'PERN Stack',
    'full-stack-developer',
    'Full-Stack Engineering',
    'Build relational web products with PostgreSQL, Express, React, and Node.js.',
    'This track emphasizes typed React features, secure APIs, relational modeling, and PostgreSQL.',
  ),
  track(
    'react-django-stack',
    'React + Django Stack',
    'full-stack-developer',
    'Full-Stack Engineering',
    'Connect React interfaces to secure Python services built with Django.',
    'This track combines React and TypeScript with Django, REST APIs, authentication, and relational persistence.',
  ),
  track(
    'nodejs-express-backend',
    'Node.js + Express Backend',
    'backend-developer',
    'Backend Engineering',
    'Create production APIs with Node.js and Express.',
    'This track deepens typed service development, REST contracts, authentication, persistence, and API testing.',
  ),
  track(
    'python-fastapi-backend',
    'Python + FastAPI Backend',
    'backend-developer',
    'Backend Engineering',
    'Build typed, asynchronous APIs with Python and FastAPI.',
    'This track combines Python service design, FastAPI, validation, authentication, SQL, and API testing.',
  ),
  track(
    'java-spring-boot-backend',
    'Java + Spring Boot Backend',
    'backend-developer',
    'Backend Engineering',
    'Build maintainable JVM services with Java and Spring Boot.',
    'This track covers Java, Spring Boot, REST contracts, authentication, relational persistence, and testing.',
  ),
  track(
    'llm-rag-engineering',
    'LLM + RAG Engineering',
    'ai-engineer',
    'AI Engineering',
    'Ship grounded language-model features with measurable quality.',
    'This track covers language-model foundations, prompting, embeddings, retrieval, vector databases, and evaluation.',
  ),
  track(
    'nlp-engineering',
    'NLP Engineering',
    'ai-engineer',
    'AI Engineering',
    'Build systems that understand and generate human language.',
    'This track deepens NLP, deep learning, language models, embeddings, evaluation, and Python delivery skills.',
  ),
  track(
    'computer-vision-engineering',
    'Computer Vision Engineering',
    'ai-engineer',
    'AI Engineering',
    'Build systems that extract useful information from images and video.',
    'This track combines computer vision, OpenCV, deep learning, numerical Python, evaluation, and MLOps.',
  ),
  track(
    'power-bi-analytics',
    'Power BI Analytics',
    'data-analyst',
    'Data Analytics',
    'Deliver governed business dashboards and metrics with Power BI.',
    'This track combines SQL, modeling, cleaning, visualization, business intelligence, and Power BI.',
  ),
  track(
    'tableau-analytics',
    'Tableau Analytics',
    'data-analyst',
    'Data Analytics',
    'Turn business data into interactive visual stories with Tableau.',
    'This track combines SQL, data cleaning, statistics, visualization principles, and Tableau dashboard craft.',
  ),
  track(
    'python-analytics',
    'Python Analytics',
    'data-analyst',
    'Data Analytics',
    'Explore, transform, and communicate data through the Python ecosystem.',
    'This track develops Python, Pandas, NumPy, statistical reasoning, exploratory analysis, and visualization.',
  ),
];

export const roleTracks: RoleTrackSeed[] = tracks.map((item) => ({
  roleSlug: item.parentRoleSlug,
  trackSlug: item.slug,
}));

const trackRequirement = (
  trackSlug: string,
  skillSlug: string,
  weight: number,
  importance: Importance = weight >= 4 ? 'core' : 'supporting',
  targetLevel: Difficulty = weight >= 5 ? 'advanced' : weight >= 3 ? 'intermediate' : 'foundation',
): TrackRequirementSeed => ({ trackSlug, skillSlug, weight, importance, targetLevel });

export const trackRequirements: TrackRequirementSeed[] = [
  trackRequirement('react-frontend', 'react', 5, 'core', 'advanced'),
  trackRequirement('react-frontend', 'typescript', 5, 'core', 'advanced'),
  trackRequirement('react-frontend', 'state-management', 4, 'core', 'advanced'),
  trackRequirement('react-frontend', 'unit-testing', 4, 'core', 'advanced'),
  trackRequirement('react-frontend', 'web-accessibility', 3),
  trackRequirement('react-frontend', 'html', 3),

  trackRequirement('angular-frontend', 'angular', 5, 'core', 'advanced'),
  trackRequirement('angular-frontend', 'typescript', 5, 'core', 'advanced'),
  trackRequirement('angular-frontend', 'rxjs', 4, 'core', 'advanced'),
  trackRequirement('angular-frontend', 'unit-testing', 4, 'core', 'advanced'),
  trackRequirement('angular-frontend', 'web-accessibility', 3),
  trackRequirement('angular-frontend', 'html', 3),

  trackRequirement('vuejs-frontend', 'vuejs', 5, 'core', 'advanced'),
  trackRequirement('vuejs-frontend', 'javascript', 5, 'core', 'advanced'),
  trackRequirement('vuejs-frontend', 'typescript', 4, 'core', 'intermediate'),
  trackRequirement('vuejs-frontend', 'state-management', 4, 'core', 'advanced'),
  trackRequirement('vuejs-frontend', 'unit-testing', 3),
  trackRequirement('vuejs-frontend', 'web-accessibility', 3),

  trackRequirement('mern-stack', 'mongodb', 5, 'core', 'advanced'),
  trackRequirement('mern-stack', 'express', 5, 'core', 'advanced'),
  trackRequirement('mern-stack', 'react', 5, 'core', 'advanced'),
  trackRequirement('mern-stack', 'nodejs', 5, 'core', 'advanced'),
  trackRequirement('mern-stack', 'authentication', 4, 'core', 'intermediate'),
  trackRequirement('mern-stack', 'api-testing', 3),

  trackRequirement('mean-stack', 'mongodb', 5, 'core', 'advanced'),
  trackRequirement('mean-stack', 'express', 5, 'core', 'advanced'),
  trackRequirement('mean-stack', 'angular', 5, 'core', 'advanced'),
  trackRequirement('mean-stack', 'nodejs', 5, 'core', 'advanced'),
  trackRequirement('mean-stack', 'typescript', 4, 'core', 'advanced'),
  trackRequirement('mean-stack', 'rxjs', 3),

  trackRequirement('pern-stack', 'postgresql', 5, 'core', 'advanced'),
  trackRequirement('pern-stack', 'express', 5, 'core', 'advanced'),
  trackRequirement('pern-stack', 'react', 5, 'core', 'advanced'),
  trackRequirement('pern-stack', 'nodejs', 5, 'core', 'advanced'),
  trackRequirement('pern-stack', 'data-modeling', 4, 'core', 'advanced'),
  trackRequirement('pern-stack', 'api-testing', 3),

  trackRequirement('react-django-stack', 'react', 5, 'core', 'advanced'),
  trackRequirement('react-django-stack', 'python', 5, 'core', 'advanced'),
  trackRequirement('react-django-stack', 'django', 5, 'core', 'advanced'),
  trackRequirement('react-django-stack', 'rest-apis', 4, 'core', 'advanced'),
  trackRequirement('react-django-stack', 'authentication', 4, 'core', 'advanced'),
  trackRequirement('react-django-stack', 'postgresql', 3),

  trackRequirement('nodejs-express-backend', 'nodejs', 5, 'core', 'advanced'),
  trackRequirement('nodejs-express-backend', 'express', 5, 'core', 'advanced'),
  trackRequirement('nodejs-express-backend', 'rest-apis', 5, 'core', 'advanced'),
  trackRequirement('nodejs-express-backend', 'authentication', 4, 'core', 'advanced'),
  trackRequirement('nodejs-express-backend', 'postgresql', 4, 'core', 'intermediate'),
  trackRequirement('nodejs-express-backend', 'api-testing', 3),

  trackRequirement('python-fastapi-backend', 'python', 5, 'core', 'advanced'),
  trackRequirement('python-fastapi-backend', 'fastapi', 5, 'core', 'advanced'),
  trackRequirement('python-fastapi-backend', 'rest-apis', 5, 'core', 'advanced'),
  trackRequirement('python-fastapi-backend', 'authentication', 4, 'core', 'advanced'),
  trackRequirement('python-fastapi-backend', 'postgresql', 4, 'core', 'intermediate'),
  trackRequirement('python-fastapi-backend', 'api-testing', 3),

  trackRequirement('java-spring-boot-backend', 'java', 5, 'core', 'advanced'),
  trackRequirement('java-spring-boot-backend', 'spring-boot', 5, 'core', 'advanced'),
  trackRequirement('java-spring-boot-backend', 'rest-apis', 5, 'core', 'advanced'),
  trackRequirement('java-spring-boot-backend', 'authentication', 4, 'core', 'advanced'),
  trackRequirement('java-spring-boot-backend', 'postgresql', 4, 'core', 'intermediate'),
  trackRequirement('java-spring-boot-backend', 'api-testing', 3),

  trackRequirement('llm-rag-engineering', 'llm-fundamentals', 5, 'core', 'advanced'),
  trackRequirement('llm-rag-engineering', 'prompt-engineering', 5, 'core', 'advanced'),
  trackRequirement('llm-rag-engineering', 'embeddings', 5, 'core', 'advanced'),
  trackRequirement('llm-rag-engineering', 'rag', 5, 'core', 'advanced'),
  trackRequirement('llm-rag-engineering', 'vector-databases', 4, 'core', 'advanced'),
  trackRequirement('llm-rag-engineering', 'model-evaluation', 4, 'core', 'advanced'),

  trackRequirement('nlp-engineering', 'nlp', 5, 'core', 'advanced'),
  trackRequirement('nlp-engineering', 'deep-learning', 5, 'core', 'advanced'),
  trackRequirement('nlp-engineering', 'llm-fundamentals', 4, 'core', 'advanced'),
  trackRequirement('nlp-engineering', 'embeddings', 4, 'core', 'advanced'),
  trackRequirement('nlp-engineering', 'model-evaluation', 4, 'core', 'advanced'),
  trackRequirement('nlp-engineering', 'python', 3),

  trackRequirement('computer-vision-engineering', 'computer-vision', 5, 'core', 'advanced'),
  trackRequirement('computer-vision-engineering', 'opencv', 5, 'core', 'advanced'),
  trackRequirement('computer-vision-engineering', 'deep-learning', 5, 'core', 'advanced'),
  trackRequirement('computer-vision-engineering', 'numpy', 4, 'core', 'advanced'),
  trackRequirement('computer-vision-engineering', 'model-evaluation', 4, 'core', 'advanced'),
  trackRequirement('computer-vision-engineering', 'mlops', 3),

  trackRequirement('power-bi-analytics', 'sql', 5, 'core', 'advanced'),
  trackRequirement('power-bi-analytics', 'power-bi', 5, 'core', 'advanced'),
  trackRequirement('power-bi-analytics', 'data-visualization', 5, 'core', 'advanced'),
  trackRequirement('power-bi-analytics', 'business-intelligence', 4, 'core', 'advanced'),
  trackRequirement('power-bi-analytics', 'data-modeling', 4, 'core', 'advanced'),
  trackRequirement('power-bi-analytics', 'data-cleaning', 3),

  trackRequirement('tableau-analytics', 'sql', 5, 'core', 'advanced'),
  trackRequirement('tableau-analytics', 'tableau', 5, 'core', 'advanced'),
  trackRequirement('tableau-analytics', 'data-visualization', 5, 'core', 'advanced'),
  trackRequirement('tableau-analytics', 'business-intelligence', 4, 'core', 'advanced'),
  trackRequirement('tableau-analytics', 'statistics', 4, 'core', 'intermediate'),
  trackRequirement('tableau-analytics', 'data-cleaning', 3),

  trackRequirement('python-analytics', 'python', 5, 'core', 'advanced'),
  trackRequirement('python-analytics', 'pandas', 5, 'core', 'advanced'),
  trackRequirement('python-analytics', 'numpy', 5, 'core', 'advanced'),
  trackRequirement('python-analytics', 'exploratory-data-analysis', 4, 'core', 'advanced'),
  trackRequirement('python-analytics', 'statistics', 4, 'core', 'advanced'),
  trackRequirement('python-analytics', 'data-visualization', 3),
];

const requirement = (
  roleSlug: string,
  skillSlug: string,
  weight: number,
  importance: Importance = weight >= 4 ? 'core' : 'supporting',
  targetLevel: Difficulty = weight >= 5 ? 'advanced' : weight >= 3 ? 'intermediate' : 'foundation',
): RequirementSeed => ({ roleSlug, skillSlug, weight, importance, targetLevel });

export const requirements: RequirementSeed[] = [
  ...[
    requirement('backend-developer', 'programming-fundamentals', 4),
    requirement('backend-developer', 'data-structures', 3),
    requirement('backend-developer', 'nodejs', 5),
    requirement('backend-developer', 'express', 5),
    requirement('backend-developer', 'http', 4),
    requirement('backend-developer', 'rest-apis', 5),
    requirement('backend-developer', 'authentication', 4),
    requirement('backend-developer', 'sql', 4),
    requirement('backend-developer', 'data-modeling', 4),
    requirement('backend-developer', 'postgresql', 3),
    requirement('backend-developer', 'git', 3),
    requirement('backend-developer', 'testing-fundamentals', 3),
    requirement('backend-developer', 'api-testing', 3),
    requirement('backend-developer', 'docker', 2),
    requirement('full-stack-developer', 'javascript', 5),
    requirement('full-stack-developer', 'typescript', 4),
    requirement('full-stack-developer', 'html', 4),
    requirement('full-stack-developer', 'css', 4),
    requirement('full-stack-developer', 'react', 5),
    requirement('full-stack-developer', 'nodejs', 4),
    requirement('full-stack-developer', 'express', 3),
    requirement('full-stack-developer', 'http', 3),
    requirement('full-stack-developer', 'rest-apis', 4),
    requirement('full-stack-developer', 'sql', 3),
    requirement('full-stack-developer', 'git', 3),
    requirement('full-stack-developer', 'testing-fundamentals', 3),
    requirement('frontend-developer', 'javascript', 5),
    requirement('frontend-developer', 'typescript', 4),
    requirement('frontend-developer', 'html', 5),
    requirement('frontend-developer', 'css', 5),
    requirement('frontend-developer', 'react', 5),
    requirement('frontend-developer', 'http', 3),
    requirement('frontend-developer', 'git', 3),
    requirement('frontend-developer', 'unit-testing', 3),
    requirement('frontend-developer', 'rest-apis', 2),
    requirement('python-developer', 'programming-fundamentals', 4),
    requirement('python-developer', 'python', 5),
    requirement('python-developer', 'data-structures', 4),
    requirement('python-developer', 'algorithms', 3),
    requirement('python-developer', 'git', 3),
    requirement('python-developer', 'sql', 3),
    requirement('python-developer', 'testing-fundamentals', 4),
    requirement('python-developer', 'unit-testing', 3),
    requirement('python-developer', 'rest-apis', 2),
    requirement('data-analyst', 'sql', 5),
    requirement('data-analyst', 'excel', 4),
    requirement('data-analyst', 'data-cleaning', 5),
    requirement('data-analyst', 'exploratory-data-analysis', 5),
    requirement('data-analyst', 'statistics', 4),
    requirement('data-analyst', 'power-bi', 4),
    requirement('data-analyst', 'python', 3),
    requirement('data-analyst', 'pandas', 3),
    requirement('data-analyst', 'data-modeling', 2),
    requirement('data-engineer', 'python', 5),
    requirement('data-engineer', 'sql', 5),
    requirement('data-engineer', 'data-modeling', 4),
    requirement('data-engineer', 'data-warehousing', 5),
    requirement('data-engineer', 'etl', 5),
    requirement('data-engineer', 'apache-spark', 3),
    requirement('data-engineer', 'workflow-orchestration', 4),
    requirement('data-engineer', 'linux', 3),
    requirement('data-engineer', 'cloud-fundamentals', 3),
    requirement('data-engineer', 'docker', 3),
    requirement('data-engineer', 'git', 2),
    requirement('data-engineer', 'observability', 3),
    requirement('ai-engineer', 'python', 5),
    requirement('ai-engineer', 'machine-learning', 4),
    requirement('ai-engineer', 'deep-learning', 3),
    requirement('ai-engineer', 'nlp', 4),
    requirement('ai-engineer', 'llm-fundamentals', 5),
    requirement('ai-engineer', 'rag', 5),
    requirement('ai-engineer', 'vector-databases', 4),
    requirement('ai-engineer', 'rest-apis', 3),
    requirement('ai-engineer', 'data-modeling', 3),
    requirement('ai-engineer', 'docker', 2),
    requirement('ai-engineer', 'testing-fundamentals', 2),
    requirement('machine-learning-engineer', 'python', 5),
    requirement('machine-learning-engineer', 'numpy', 4),
    requirement('machine-learning-engineer', 'pandas', 3),
    requirement('machine-learning-engineer', 'statistics', 5),
    requirement('machine-learning-engineer', 'linear-algebra', 4),
    requirement('machine-learning-engineer', 'machine-learning', 5),
    requirement('machine-learning-engineer', 'deep-learning', 4),
    requirement('machine-learning-engineer', 'data-cleaning', 3),
    requirement('machine-learning-engineer', 'docker', 3),
    requirement('machine-learning-engineer', 'cloud-fundamentals', 2),
    requirement('machine-learning-engineer', 'testing-fundamentals', 2),
    requirement('devops-engineer', 'linux', 5),
    requirement('devops-engineer', 'git', 4),
    requirement('devops-engineer', 'github', 3),
    requirement('devops-engineer', 'docker', 5),
    requirement('devops-engineer', 'ci-cd', 5),
    requirement('devops-engineer', 'cloud-fundamentals', 5),
    requirement('devops-engineer', 'aws', 4),
    requirement('devops-engineer', 'observability', 4),
    requirement('devops-engineer', 'system-design', 3),
    requirement('devops-engineer', 'testing-fundamentals', 2),
    requirement('qa-automation-engineer', 'programming-fundamentals', 4),
    requirement('qa-automation-engineer', 'javascript', 3),
    requirement('qa-automation-engineer', 'typescript', 3),
    requirement('qa-automation-engineer', 'http', 4),
    requirement('qa-automation-engineer', 'rest-apis', 4),
    requirement('qa-automation-engineer', 'testing-fundamentals', 5),
    requirement('qa-automation-engineer', 'unit-testing', 4),
    requirement('qa-automation-engineer', 'api-testing', 5),
    requirement('qa-automation-engineer', 'git', 3),
    requirement('qa-automation-engineer', 'ci-cd', 3),
  ],
];

export const prerequisites: PrerequisiteSeed[] = [
  { beforeSlug: 'programming-fundamentals', afterSlug: 'python' },
  { beforeSlug: 'programming-fundamentals', afterSlug: 'javascript' },
  { beforeSlug: 'programming-fundamentals', afterSlug: 'data-structures' },
  { beforeSlug: 'data-structures', afterSlug: 'algorithms' },
  { beforeSlug: 'javascript', afterSlug: 'typescript' },
  { beforeSlug: 'html', afterSlug: 'react' },
  { beforeSlug: 'css', afterSlug: 'react' },
  { beforeSlug: 'javascript', afterSlug: 'react' },
  { beforeSlug: 'javascript', afterSlug: 'nodejs' },
  { beforeSlug: 'nodejs', afterSlug: 'express' },
  { beforeSlug: 'http', afterSlug: 'rest-apis' },
  { beforeSlug: 'express', afterSlug: 'rest-apis' },
  { beforeSlug: 'rest-apis', afterSlug: 'authentication' },
  { beforeSlug: 'sql', afterSlug: 'postgresql' },
  { beforeSlug: 'data-modeling', afterSlug: 'postgresql' },
  { beforeSlug: 'testing-fundamentals', afterSlug: 'unit-testing' },
  { beforeSlug: 'http', afterSlug: 'api-testing' },
  { beforeSlug: 'testing-fundamentals', afterSlug: 'api-testing' },
  { beforeSlug: 'git', afterSlug: 'github' },
  { beforeSlug: 'linux', afterSlug: 'docker' },
  { beforeSlug: 'git', afterSlug: 'ci-cd' },
  { beforeSlug: 'testing-fundamentals', afterSlug: 'ci-cd' },
  { beforeSlug: 'cloud-fundamentals', afterSlug: 'aws' },
  { beforeSlug: 'docker', afterSlug: 'aws' },
  { beforeSlug: 'python', afterSlug: 'pandas' },
  { beforeSlug: 'python', afterSlug: 'numpy' },
  { beforeSlug: 'data-cleaning', afterSlug: 'exploratory-data-analysis' },
  { beforeSlug: 'statistics', afterSlug: 'exploratory-data-analysis' },
  { beforeSlug: 'exploratory-data-analysis', afterSlug: 'power-bi' },
  { beforeSlug: 'excel', afterSlug: 'power-bi' },
  { beforeSlug: 'sql', afterSlug: 'data-warehousing' },
  { beforeSlug: 'data-modeling', afterSlug: 'data-warehousing' },
  { beforeSlug: 'python', afterSlug: 'etl' },
  { beforeSlug: 'sql', afterSlug: 'etl' },
  { beforeSlug: 'etl', afterSlug: 'workflow-orchestration' },
  { beforeSlug: 'etl', afterSlug: 'apache-spark' },
  { beforeSlug: 'statistics', afterSlug: 'machine-learning' },
  { beforeSlug: 'linear-algebra', afterSlug: 'machine-learning' },
  { beforeSlug: 'numpy', afterSlug: 'machine-learning' },
  { beforeSlug: 'machine-learning', afterSlug: 'deep-learning' },
  { beforeSlug: 'machine-learning', afterSlug: 'nlp' },
  { beforeSlug: 'deep-learning', afterSlug: 'llm-fundamentals' },
  { beforeSlug: 'nlp', afterSlug: 'llm-fundamentals' },
  { beforeSlug: 'llm-fundamentals', afterSlug: 'rag' },
  { beforeSlug: 'vector-databases', afterSlug: 'rag' },
  { beforeSlug: 'cloud-fundamentals', afterSlug: 'observability' },
  { beforeSlug: 'data-structures', afterSlug: 'system-design' },
  { beforeSlug: 'http', afterSlug: 'system-design' },
  { beforeSlug: 'html', afterSlug: 'web-accessibility' },
  { beforeSlug: 'react', afterSlug: 'state-management' },
  { beforeSlug: 'llm-fundamentals', afterSlug: 'prompt-engineering' },
  { beforeSlug: 'numpy', afterSlug: 'embeddings' },
  { beforeSlug: 'embeddings', afterSlug: 'vector-databases' },
  { beforeSlug: 'machine-learning', afterSlug: 'model-evaluation' },
  { beforeSlug: 'machine-learning', afterSlug: 'mlops' },
  { beforeSlug: 'exploratory-data-analysis', afterSlug: 'data-visualization' },
  { beforeSlug: 'data-visualization', afterSlug: 'tableau' },
  { beforeSlug: 'data-modeling', afterSlug: 'business-intelligence' },
  { beforeSlug: 'typescript', afterSlug: 'angular' },
  { beforeSlug: 'javascript', afterSlug: 'rxjs' },
  { beforeSlug: 'javascript', afterSlug: 'vuejs' },
  { beforeSlug: 'python', afterSlug: 'django' },
  { beforeSlug: 'python', afterSlug: 'fastapi' },
  { beforeSlug: 'programming-fundamentals', afterSlug: 'java' },
  { beforeSlug: 'java', afterSlug: 'spring-boot' },
  { beforeSlug: 'deep-learning', afterSlug: 'computer-vision' },
  { beforeSlug: 'python', afterSlug: 'opencv' },
];

const project = (
  slug: string,
  name: string,
  summary: string,
  difficulty: Difficulty,
  estimatedHours: number,
  category: string,
): ProjectDto => ({ slug, name, summary, difficulty, estimatedHours, category });

export const projects: ProjectDto[] = [
  project(
    'rest-api-monitoring-service',
    'REST API Monitoring Service',
    'Build an API that schedules checks and exposes service health history.',
    'intermediate',
    28,
    'Backend',
  ),
  project(
    'ecommerce-analytics-dashboard',
    'E-commerce Analytics Dashboard',
    'Clean commerce data and present actionable sales trends.',
    'intermediate',
    30,
    'Data Analytics',
  ),
  project(
    'customer-churn-prediction',
    'Customer Churn Prediction',
    'Train and explain a model that identifies customers at risk.',
    'advanced',
    38,
    'Machine Learning',
  ),
  project(
    'rag-knowledge-assistant',
    'RAG Knowledge Assistant',
    'Create a source-grounded assistant over a curated document collection.',
    'advanced',
    48,
    'AI Engineering',
  ),
  project(
    'realtime-collaboration-board',
    'Real-Time Collaboration Board',
    'Deliver a typed full-stack board with secure multi-user workflows.',
    'advanced',
    45,
    'Full Stack',
  ),
  project(
    'etl-sales-pipeline',
    'ETL Sales Pipeline',
    'Build a scheduled, observable pipeline into an analytical sales model.',
    'advanced',
    42,
    'Data Engineering',
  ),
  project(
    'automated-api-testing-suite',
    'Automated API Testing Suite',
    'Exercise authentication, validation, and failure contracts in CI.',
    'intermediate',
    24,
    'Quality Engineering',
  ),
  project(
    'containerized-backend-deployment',
    'Containerized Backend Deployment',
    'Package, continuously validate, and deploy a production API.',
    'intermediate',
    30,
    'Cloud and DevOps',
  ),
  project(
    'recommendation-engine',
    'Recommendation Engine',
    'Rank relevant items from behavioral data and evaluate model quality.',
    'advanced',
    44,
    'Machine Learning',
  ),
  project(
    'expense-analytics-dashboard',
    'Expense Analytics Dashboard',
    'Transform personal finance records into an interactive BI report.',
    'foundation',
    20,
    'Data Analytics',
  ),
  project(
    'job-application-tracker',
    'Job Application Tracker',
    'Build an accessible React application backed by a secure REST API.',
    'intermediate',
    34,
    'Full Stack',
  ),
  project(
    'cloud-log-analysis-tool',
    'Cloud Log Analysis Tool',
    'Aggregate service logs and surface actionable operational signals.',
    'advanced',
    40,
    'Cloud and DevOps',
  ),
  project(
    'data-quality-command-center',
    'Data Quality Command Center',
    'Profile pipeline datasets and visualize validation failures over time.',
    'intermediate',
    32,
    'Data Engineering',
  ),
  project(
    'accessible-component-library',
    'Accessible Component Library',
    'Create tested, typed, responsive components with clear documentation.',
    'intermediate',
    26,
    'Frontend',
  ),
];

const builds = (
  projectSlug: string,
  skillSlug: string,
  depth: ProjectDepth = 'practical',
): ProjectSkillSeed => ({ projectSlug, skillSlug, depth });

export const projectSkills: ProjectSkillSeed[] = [
  builds('rest-api-monitoring-service', 'nodejs'),
  builds('rest-api-monitoring-service', 'express'),
  builds('rest-api-monitoring-service', 'rest-apis', 'advanced'),
  builds('rest-api-monitoring-service', 'postgresql'),
  builds('rest-api-monitoring-service', 'observability'),
  builds('ecommerce-analytics-dashboard', 'sql', 'advanced'),
  builds('ecommerce-analytics-dashboard', 'data-cleaning'),
  builds('ecommerce-analytics-dashboard', 'exploratory-data-analysis'),
  builds('ecommerce-analytics-dashboard', 'power-bi', 'advanced'),
  builds('customer-churn-prediction', 'python'),
  builds('customer-churn-prediction', 'pandas'),
  builds('customer-churn-prediction', 'statistics'),
  builds('customer-churn-prediction', 'machine-learning', 'advanced'),
  builds('rag-knowledge-assistant', 'python'),
  builds('rag-knowledge-assistant', 'llm-fundamentals'),
  builds('rag-knowledge-assistant', 'rag', 'advanced'),
  builds('rag-knowledge-assistant', 'vector-databases', 'advanced'),
  builds('rag-knowledge-assistant', 'rest-apis'),
  builds('realtime-collaboration-board', 'typescript'),
  builds('realtime-collaboration-board', 'react', 'advanced'),
  builds('realtime-collaboration-board', 'nodejs'),
  builds('realtime-collaboration-board', 'authentication'),
  builds('realtime-collaboration-board', 'data-modeling'),
  builds('etl-sales-pipeline', 'python'),
  builds('etl-sales-pipeline', 'sql'),
  builds('etl-sales-pipeline', 'data-warehousing', 'advanced'),
  builds('etl-sales-pipeline', 'etl', 'advanced'),
  builds('etl-sales-pipeline', 'workflow-orchestration', 'advanced'),
  builds('automated-api-testing-suite', 'testing-fundamentals'),
  builds('automated-api-testing-suite', 'api-testing', 'advanced'),
  builds('automated-api-testing-suite', 'authentication'),
  builds('automated-api-testing-suite', 'ci-cd'),
  builds('containerized-backend-deployment', 'linux'),
  builds('containerized-backend-deployment', 'docker', 'advanced'),
  builds('containerized-backend-deployment', 'ci-cd', 'advanced'),
  builds('containerized-backend-deployment', 'cloud-fundamentals'),
  builds('containerized-backend-deployment', 'aws'),
  builds('recommendation-engine', 'python'),
  builds('recommendation-engine', 'numpy'),
  builds('recommendation-engine', 'statistics'),
  builds('recommendation-engine', 'machine-learning', 'advanced'),
  builds('expense-analytics-dashboard', 'excel'),
  builds('expense-analytics-dashboard', 'data-cleaning'),
  builds('expense-analytics-dashboard', 'exploratory-data-analysis'),
  builds('expense-analytics-dashboard', 'power-bi'),
  builds('job-application-tracker', 'html'),
  builds('job-application-tracker', 'css'),
  builds('job-application-tracker', 'react'),
  builds('job-application-tracker', 'express'),
  builds('job-application-tracker', 'rest-apis'),
  builds('job-application-tracker', 'authentication'),
  builds('cloud-log-analysis-tool', 'linux'),
  builds('cloud-log-analysis-tool', 'aws'),
  builds('cloud-log-analysis-tool', 'observability', 'advanced'),
  builds('cloud-log-analysis-tool', 'system-design'),
  builds('data-quality-command-center', 'python'),
  builds('data-quality-command-center', 'sql'),
  builds('data-quality-command-center', 'data-cleaning', 'advanced'),
  builds('data-quality-command-center', 'etl'),
  builds('data-quality-command-center', 'observability'),
  builds('accessible-component-library', 'html', 'advanced'),
  builds('accessible-component-library', 'css', 'advanced'),
  builds('accessible-component-library', 'typescript'),
  builds('accessible-component-library', 'react', 'advanced'),
  builds('accessible-component-library', 'unit-testing'),
  builds('accessible-component-library', 'web-accessibility', 'advanced'),
  builds('realtime-collaboration-board', 'state-management', 'advanced'),
  builds('rag-knowledge-assistant', 'prompt-engineering', 'advanced'),
  builds('rag-knowledge-assistant', 'embeddings', 'advanced'),
  builds('rag-knowledge-assistant', 'model-evaluation'),
  builds('customer-churn-prediction', 'model-evaluation', 'advanced'),
  builds('customer-churn-prediction', 'mlops'),
  builds('ecommerce-analytics-dashboard', 'data-visualization', 'advanced'),
  builds('ecommerce-analytics-dashboard', 'business-intelligence'),
  builds('expense-analytics-dashboard', 'data-visualization'),
  builds('expense-analytics-dashboard', 'tableau'),
  builds('accessible-component-library', 'angular'),
  builds('accessible-component-library', 'vuejs'),
  builds('job-application-tracker', 'django'),
  builds('rest-api-monitoring-service', 'fastapi'),
  builds('rest-api-monitoring-service', 'spring-boot'),
];

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export interface SeedData {
  roles: RoleDto[];
  tracks: TrackDto[];
  skills: SkillDto[];
  projects: ProjectDto[];
  requirements: RequirementSeed[];
  roleTracks: RoleTrackSeed[];
  trackRequirements: TrackRequirementSeed[];
  prerequisites: PrerequisiteSeed[];
  projectSkills: ProjectSkillSeed[];
}

export const seedData: SeedData = {
  roles,
  tracks,
  skills,
  projects,
  requirements,
  roleTracks,
  trackRequirements,
  prerequisites,
  projectSkills,
};

function assertUniqueSlugs(items: Array<{ slug: string }>, label: string): Set<string> {
  const slugs = new Set<string>();
  for (const item of items) {
    if (!slugPattern.test(item.slug)) {
      throw new Error(`Invalid ${label} slug: ${item.slug}`);
    }
    if (slugs.has(item.slug)) {
      throw new Error(`Duplicate ${label} slug: ${item.slug}`);
    }
    slugs.add(item.slug);
  }
  return slugs;
}

export function validateSeedData(data: SeedData = seedData): void {
  const roleSlugs = assertUniqueSlugs(data.roles, 'role');
  const trackSlugs = assertUniqueSlugs(data.tracks, 'track');
  const skillSlugs = assertUniqueSlugs(data.skills, 'skill');
  const projectSlugs = assertUniqueSlugs(data.projects, 'project');
  const relationshipKeys = new Set<string>();

  for (const item of data.tracks) {
    if (!roleSlugs.has(item.parentRoleSlug)) {
      throw new Error(`Track references an unknown parent role: ${item.slug} -> ${item.parentRoleSlug}`);
    }
    assertNonEmpty(item.name, `track name for ${item.slug}`);
    assertNonEmpty(item.summary, `track summary for ${item.slug}`);
    assertNonEmpty(item.description, `track description for ${item.slug}`);
    assertNonEmpty(item.category, `track category for ${item.slug}`);
  }

  const linkedTrackSlugs = new Set<string>();
  for (const item of data.roleTracks) {
    if (!roleSlugs.has(item.roleSlug) || !trackSlugs.has(item.trackSlug)) {
      throw new Error(`Role-track link references an unknown node: ${item.roleSlug} -> ${item.trackSlug}`);
    }
    const key = `${item.roleSlug}|${item.trackSlug}`;
    if (relationshipKeys.has(key)) throw new Error(`Duplicate role-track link: ${key}`);
    relationshipKeys.add(key);
    const matchingTrack = data.tracks.find((candidate) => candidate.slug === item.trackSlug);
    if (matchingTrack?.parentRoleSlug !== item.roleSlug) {
      throw new Error(`Role-track ownership mismatch: ${key}`);
    }
    if (linkedTrackSlugs.has(item.trackSlug)) {
      throw new Error(`Track is linked to more than one role: ${item.trackSlug}`);
    }
    linkedTrackSlugs.add(item.trackSlug);
  }
  for (const item of data.tracks) {
    if (!linkedTrackSlugs.has(item.slug)) throw new Error(`Track is not linked to its role: ${item.slug}`);
  }

  relationshipKeys.clear();
  for (const item of data.requirements) {
    if (!roleSlugs.has(item.roleSlug) || !skillSlugs.has(item.skillSlug)) {
      throw new Error(
        `Requirement references an unknown node: ${item.roleSlug} -> ${item.skillSlug}`,
      );
    }
    assertRequirementMetadata(item, `${item.roleSlug} -> ${item.skillSlug}`);
    const key = `${item.roleSlug}|${item.skillSlug}`;
    if (relationshipKeys.has(key)) throw new Error(`Duplicate requirement: ${key}`);
    relationshipKeys.add(key);
  }

  relationshipKeys.clear();
  const tracksWithRequirements = new Set<string>();
  for (const item of data.trackRequirements) {
    if (!trackSlugs.has(item.trackSlug) || !skillSlugs.has(item.skillSlug)) {
      throw new Error(
        `Track requirement references an unknown node: ${item.trackSlug} -> ${item.skillSlug}`,
      );
    }
    assertRequirementMetadata(item, `${item.trackSlug} -> ${item.skillSlug}`);
    const key = `${item.trackSlug}|${item.skillSlug}`;
    if (relationshipKeys.has(key)) throw new Error(`Duplicate track requirement: ${key}`);
    relationshipKeys.add(key);
    tracksWithRequirements.add(item.trackSlug);
  }
  for (const item of data.tracks) {
    if (!tracksWithRequirements.has(item.slug)) {
      throw new Error(`Track has no requirements: ${item.slug}`);
    }
  }

  relationshipKeys.clear();
  const adjacency = new Map<string, string[]>();
  for (const item of data.prerequisites) {
    if (!skillSlugs.has(item.beforeSlug) || !skillSlugs.has(item.afterSlug)) {
      throw new Error(
        `Prerequisite references an unknown skill: ${item.beforeSlug} -> ${item.afterSlug}`,
      );
    }
    if (item.beforeSlug === item.afterSlug)
      throw new Error(`Self prerequisite: ${item.beforeSlug}`);
    const key = `${item.beforeSlug}|${item.afterSlug}`;
    if (relationshipKeys.has(key)) throw new Error(`Duplicate prerequisite: ${key}`);
    relationshipKeys.add(key);
    const successors = adjacency.get(item.beforeSlug) ?? [];
    successors.push(item.afterSlug);
    adjacency.set(item.beforeSlug, successors);
  }

  const visiting = new Set<string>();
  const visited = new Set<string>();
  const visit = (slug: string): void => {
    if (visiting.has(slug)) throw new Error(`Prerequisite cycle detected at ${slug}`);
    if (visited.has(slug)) return;
    visiting.add(slug);
    for (const successor of adjacency.get(slug) ?? []) visit(successor);
    visiting.delete(slug);
    visited.add(slug);
  };
  for (const slug of skillSlugs) visit(slug);

  relationshipKeys.clear();
  for (const item of data.projectSkills) {
    if (!projectSlugs.has(item.projectSlug) || !skillSlugs.has(item.skillSlug)) {
      throw new Error(
        `Project relationship references an unknown node: ${item.projectSlug} -> ${item.skillSlug}`,
      );
    }
    const key = `${item.projectSlug}|${item.skillSlug}`;
    if (relationshipKeys.has(key)) throw new Error(`Duplicate project skill: ${key}`);
    relationshipKeys.add(key);
  }
}

function assertNonEmpty(value: string, label: string): void {
  if (value.trim().length === 0) throw new Error(`Invalid empty ${label}`);
}

function assertRequirementMetadata(
  item: { importance: Importance; weight: number; targetLevel: Difficulty },
  label: string,
): void {
  if (!Number.isInteger(item.weight) || item.weight < 1 || item.weight > 5) {
    throw new Error(`Invalid requirement weight for ${label}`);
  }
  if (item.importance !== 'core' && item.importance !== 'supporting') {
    throw new Error(`Invalid requirement importance for ${label}`);
  }
  if (!['foundation', 'intermediate', 'advanced'].includes(item.targetLevel)) {
    throw new Error(`Invalid requirement target level for ${label}`);
  }
}
