-- Sutra data model (PostgreSQL / Supabase).
-- The prototype keeps exactly this shape in the browser so it works offline;
-- in production it syncs to these tables.

-- ───────────── People ─────────────
create table schools (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  board       text not null default 'CBSE',        -- CBSE, state board …
  language    text not null default 'en'            -- default UI language
);

create table teachers (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references schools(id) on delete cascade,
  auth_user   uuid unique,                          -- Supabase auth.users id
  name        text not null
);

create table classes (
  id          uuid primary key default gen_random_uuid(),
  school_id   uuid not null references schools(id) on delete cascade,
  teacher_id  uuid not null references teachers(id),
  grade       smallint not null check (grade between 6 and 10),
  section     text not null,                        -- e.g. 'B'
  focus_concept_id text                              -- teacher's class-wide override (nullable)
);

-- Minimal data on children: first name + class only.
create table students (
  id                 uuid primary key default gen_random_uuid(),
  class_id           uuid not null references classes(id) on delete cascade,
  first_name         text not null,
  preferred_language text not null default 'en' check (preferred_language in ('en','hi','te')),
  device_mode        text not null default 'own' check (device_mode in ('own','shared','paper')),
  pin_hash           text,                          -- for shared phones
  elo_rating         real not null default 1000,
  focus_concept_id   text,                          -- teacher override for this student
  last_active        timestamptz
);

-- ───────────── Content ─────────────
create table concepts (
  id          text primary key,                     -- 'c6_int'
  subject     text not null default 'maths',
  grade       smallint not null,
  ncert_ref   text,                                 -- 'Class 6 · Ch 6 Integers'
  name_en     text not null,
  name_hi     text
);

-- Edges of the concept graph (a DAG): concept_id needs prereq_id.
create table concept_prereqs (
  concept_id  text references concepts(id) on delete cascade,
  prereq_id   text references concepts(id) on delete cascade,
  primary key (concept_id, prereq_id),
  check (concept_id <> prereq_id)
);

create table misconceptions (
  id                text primary key,               -- 'm_sub_neg'
  concept_id        text not null references concepts(id),   -- where it lives
  probe_concept_id  text references concepts(id),            -- what to check next (null = foundation)
  text_en           text not null,
  text_hi           text
);

create table questions (
  id          text primary key,                     -- 'c9_lin2_1'
  concept_id  text not null references concepts(id),
  level       smallint not null check (level between 1 and 3),  -- author difficulty
  is_probe    boolean not null default false,       -- short diagnostic used by the trace
  text_en     text not null,
  text_hi     text,
  hint_en     text, hint_hi text,                   -- hint ladder rung 1
  step_en     text, step_hi text                    -- hint ladder rung 2
);

create table options (
  id                text primary key,
  question_id       text not null references questions(id) on delete cascade,
  text_en           text not null,
  text_hi           text,
  is_correct        boolean not null default false,
  misconception_id  text references misconceptions(id)        -- why a student would pick it
);

-- Elo difficulty per question (cold start: starts from grade + level prior).
create table question_stats (
  question_id  text primary key references questions(id) on delete cascade,
  elo_rating   real not null,
  n_attempts   integer not null default 0
);

-- ───────────── Learning records ─────────────
create table mastery (
  student_id   uuid references students(id) on delete cascade,
  concept_id   text references concepts(id),
  p_known      real not null default 0.3 check (p_known between 0 and 1),  -- BKT
  n_attempts   integer not null default 0,
  n_correct    integer not null default 0,
  leitner_box  smallint not null default 1,         -- spaced review
  next_review  timestamptz,
  primary key (student_id, concept_id)
);

create table attempts (
  id           bigint generated always as identity primary key,
  student_id   uuid not null references students(id) on delete cascade,
  question_id  text not null references questions(id),
  option_id    text not null references options(id),
  correct      boolean not null,
  hints_used   smallint not null default 0,
  mode         text not null check (mode in ('practice','warmup','learn','probe','check','climb','retry','paper')),
  created_at   timestamptz not null default now()
);
create index attempts_student_time on attempts (student_id, created_at desc);

create table traces (
  id                 bigint generated always as identity primary key,
  student_id         uuid not null references students(id) on delete cascade,
  start_question_id  text not null references questions(id),
  root_concept_id    text not null references concepts(id),
  probes             jsonb not null,               -- [{concept, question, option, correct}]
  fixed              boolean not null default false,
  created_at         timestamptz not null default now()
);

create table teachbacks (
  id          bigint generated always as identity primary key,
  student_id  uuid not null references students(id) on delete cascade,
  concept_id  text not null references concepts(id),
  score       smallint not null,
  out_of      smallint not null,
  covered     text[] not null default '{}',         -- rubric idea ids
  transcript  jsonb not null,
  used_ai     boolean not null default false,
  created_at  timestamptz not null default now()
);

-- Teacher-edited Chotu rubric: ideas switched off for a class.
create table rubric_overrides (
  class_id     uuid references classes(id) on delete cascade,
  concept_id   text references concepts(id),
  disabled_ids text[] not null default '{}',
  primary key (class_id, concept_id)
);

-- ───────────── Security: row-level security ─────────────
-- A teacher sees only students in their own classes.
alter table students enable row level security;
alter table mastery  enable row level security;
alter table attempts enable row level security;

create policy teacher_reads_own_students on students for select using (
  class_id in (select c.id from classes c join teachers t on t.id = c.teacher_id where t.auth_user = auth.uid())
);
create policy teacher_reads_own_mastery on mastery for select using (
  student_id in (select s.id from students s join classes c on c.id = s.class_id
                 join teachers t on t.id = c.teacher_id where t.auth_user = auth.uid())
);
create policy teacher_reads_own_attempts on attempts for select using (
  student_id in (select s.id from students s join classes c on c.id = s.class_id
                 join teachers t on t.id = c.teacher_id where t.auth_user = auth.uid())
);
