-- ============================================================
-- WEDDiC Supabase Schema  (bw = brown_wedding)
-- PostgreSQL / Supabase RLS 기반
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pg_trgm";  -- 한국어 유사검색


-- ============================================================
-- 1. USERS (Supabase Auth 연동)
-- ============================================================

create table public.bw_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  nickname      text not null,
  avatar_url    text,
  couple_id     uuid,                        -- bw_couples.id (생성 후 FK 추가)
  role          text not null default 'user' check (role in ('user','admin')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table public.bw_couples (
  id            uuid primary key default uuid_generate_v4(),
  user_a        uuid not null references public.bw_profiles(id) on delete cascade,
  user_b        uuid references public.bw_profiles(id) on delete set null,
  invite_code   text unique default substr(md5(random()::text), 1, 8),
  wedding_date  date,
  created_at    timestamptz not null default now()
);

-- 순환 참조 해결용 FK 후처리
alter table public.bw_profiles
  add constraint fk_bw_profiles_couple
  foreign key (couple_id) references public.bw_couples(id) on delete set null;


-- ============================================================
-- 2. WEDDING HALLS (웨딩홀)
-- ============================================================

create table public.bw_halls (
  id              uuid primary key default uuid_generate_v4(),

  -- 기본 정보
  name            text not null,
  slug            text unique,
  region_city     text,
  region_district text,
  address         text,
  phone           text,
  website_url     text,
  lat             numeric(10, 7),
  lng             numeric(10, 7),

  -- 홀 조건
  hall_type       text[],                    -- {컨벤션, 하우스, 채플, 호텔, 야외}
  food_type       text[],                    -- {뷔페, 한식코스, 양식코스, 한정식}
  capacity_min    int,
  capacity_max    int,
  food_price_min  int,                       -- 식대 (원 단위)
  food_price_max  int,

  -- 분위기
  tags            text[],
  mood            text,                      -- 럭셔리 | 모던 | 클래식 | 가든

  -- 이미지
  thumb_url       text,
  images          text[],

  -- 스크래퍼 메타
  source_url      text,
  source_name     text,                      -- weddingcrowd | directwedding | manual
  source_idx      text,

  -- 어드민 관리
  status          text not null default 'pending'
                    check (status in ('pending','active','inactive')),
  is_verified     boolean not null default false,
  admin_note      text,

  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index idx_bw_halls_region    on public.bw_halls(region_city, region_district);
create index idx_bw_halls_status    on public.bw_halls(status);
create index idx_bw_halls_mood      on public.bw_halls(mood);
create index idx_bw_halls_name_trgm on public.bw_halls using gin(name gin_trgm_ops);
create index idx_bw_halls_tags      on public.bw_halls using gin(tags);


-- ============================================================
-- 3. LOUNGE (예비부부 대기실)
-- ============================================================

create table public.bw_posts (
  id            uuid primary key default uuid_generate_v4(),
  author_id     uuid not null references public.bw_profiles(id) on delete cascade,
  body          text not null check (length(body) between 1 and 2000),
  hall_id       uuid references public.bw_halls(id) on delete set null,
  is_deleted    boolean not null default false,
  like_count    int not null default 0,
  comment_count int not null default 0,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index idx_bw_posts_author  on public.bw_posts(author_id);
create index idx_bw_posts_hall    on public.bw_posts(hall_id);
create index idx_bw_posts_created on public.bw_posts(created_at desc);

create table public.bw_comments (
  id          uuid primary key default uuid_generate_v4(),
  post_id     uuid not null references public.bw_posts(id) on delete cascade,
  author_id   uuid not null references public.bw_profiles(id) on delete cascade,
  parent_id   uuid references public.bw_comments(id) on delete cascade,
  body        text not null check (length(body) between 1 and 500),
  is_deleted  boolean not null default false,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_bw_comments_post   on public.bw_comments(post_id);
create index idx_bw_comments_parent on public.bw_comments(parent_id);

create table public.bw_likes (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.bw_profiles(id) on delete cascade,
  post_id     uuid references public.bw_posts(id) on delete cascade,
  comment_id  uuid references public.bw_comments(id) on delete cascade,
  created_at  timestamptz not null default now(),

  constraint bw_likes_target_check check (
    (post_id is not null and comment_id is null) or
    (post_id is null and comment_id is not null)
  ),
  constraint bw_likes_unique unique (user_id, post_id, comment_id)
);

create index idx_bw_likes_post    on public.bw_likes(post_id);
create index idx_bw_likes_comment on public.bw_likes(comment_id);

-- 좋아요 카운트 자동 동기화
create or replace function bw_sync_like_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' and NEW.post_id is not null then
    update public.bw_posts set like_count = like_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' and OLD.post_id is not null then
    update public.bw_posts set like_count = greatest(like_count - 1, 0) where id = OLD.post_id;
  end if;
  return null;
end;
$$;

create trigger trg_bw_like_count
  after insert or delete on public.bw_likes
  for each row execute function bw_sync_like_count();

-- 댓글 카운트 자동 동기화
create or replace function bw_sync_comment_count()
returns trigger language plpgsql as $$
begin
  if TG_OP = 'INSERT' then
    update public.bw_posts set comment_count = comment_count + 1 where id = NEW.post_id;
  elsif TG_OP = 'DELETE' then
    update public.bw_posts set comment_count = greatest(comment_count - 1, 0) where id = OLD.post_id;
  end if;
  return null;
end;
$$;

create trigger trg_bw_comment_count
  after insert or delete on public.bw_comments
  for each row execute function bw_sync_comment_count();


-- ============================================================
-- 4. BUDGET (우리 예산)
-- ============================================================

create table public.bw_budget_plans (
  id           uuid primary key default uuid_generate_v4(),
  couple_id    uuid not null references public.bw_couples(id) on delete cascade,
  total        int not null default 0,
  wedding_date date,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  unique(couple_id)
);

create table public.bw_budget_items (
  id          uuid primary key default uuid_generate_v4(),
  plan_id     uuid not null references public.bw_budget_plans(id) on delete cascade,
  category    text not null,               -- 웨딩홀 | 스드메 | 허니문 | 예물·예단 | 청첩장 | 답례품 | 기타
  name        text not null,
  memo        text,
  amount      int not null default 0,      -- 예산 (원)
  actual      int,                         -- 실제 지출 (원)
  hall_id     uuid references public.bw_halls(id) on delete set null,
  status      text not null default 'todo'
                check (status in ('todo','in_progress','done','cancelled')),
  sort_order  int not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create index idx_bw_budget_items_plan on public.bw_budget_items(plan_id);


-- ============================================================
-- 5. BOOKMARKS (관심홀 / 나의홀)
-- ============================================================

create table public.bw_bookmarks (
  id          uuid primary key default uuid_generate_v4(),
  user_id     uuid not null references public.bw_profiles(id) on delete cascade,
  hall_id     uuid not null references public.bw_halls(id) on delete cascade,
  type        text not null default 'wishlist'
                check (type in ('wishlist','my_hall')),
  memo        text,
  created_at  timestamptz not null default now(),
  unique(user_id, hall_id, type)
);

create index idx_bw_bookmarks_user on public.bw_bookmarks(user_id);
create index idx_bw_bookmarks_hall on public.bw_bookmarks(hall_id);


-- ============================================================
-- 6. ADMIN
-- ============================================================

create table public.bw_scraper_logs (
  id             uuid primary key default uuid_generate_v4(),
  run_by         uuid references public.bw_profiles(id) on delete set null,
  source         text not null,
  status         text not null default 'running'
                   check (status in ('running','done','failed')),
  total_found    int default 0,
  total_upserted int default 0,
  total_skipped  int default 0,
  error_msg      text,
  started_at     timestamptz not null default now(),
  finished_at    timestamptz
);

create table public.bw_admin_actions (
  id          uuid primary key default uuid_generate_v4(),
  admin_id    uuid not null references public.bw_profiles(id) on delete cascade,
  action      text not null,              -- hall_approve | hall_reject | post_delete | user_ban
  target_type text not null,              -- hall | post | comment | user
  target_id   uuid not null,
  note        text,
  created_at  timestamptz not null default now()
);


-- ============================================================
-- 7. updated_at 트리거 (공통)
-- ============================================================

create or replace function bw_set_updated_at()
returns trigger language plpgsql as $$
begin
  NEW.updated_at = now();
  return NEW;
end;
$$;

create trigger trg_bw_profiles_updated_at
  before update on public.bw_profiles
  for each row execute function bw_set_updated_at();

create trigger trg_bw_halls_updated_at
  before update on public.bw_halls
  for each row execute function bw_set_updated_at();

create trigger trg_bw_posts_updated_at
  before update on public.bw_posts
  for each row execute function bw_set_updated_at();

create trigger trg_bw_comments_updated_at
  before update on public.bw_comments
  for each row execute function bw_set_updated_at();

create trigger trg_bw_budget_plans_updated_at
  before update on public.bw_budget_plans
  for each row execute function bw_set_updated_at();

create trigger trg_bw_budget_items_updated_at
  before update on public.bw_budget_items
  for each row execute function bw_set_updated_at();


-- ============================================================
-- 8. ROW LEVEL SECURITY
-- ============================================================

alter table public.bw_profiles enable row level security;
create policy "bw_profiles_select_all" on public.bw_profiles for select using (true);
create policy "bw_profiles_update_own" on public.bw_profiles for update using (auth.uid() = id);

alter table public.bw_halls enable row level security;
create policy "bw_halls_select_active" on public.bw_halls for select using (
  status = 'active' or
  exists (select 1 from public.bw_profiles where id = auth.uid() and role = 'admin')
);
create policy "bw_halls_insert_admin" on public.bw_halls for insert with check (
  exists (select 1 from public.bw_profiles where id = auth.uid() and role = 'admin')
);
create policy "bw_halls_update_admin" on public.bw_halls for update using (
  exists (select 1 from public.bw_profiles where id = auth.uid() and role = 'admin')
);

alter table public.bw_posts enable row level security;
create policy "bw_posts_select"  on public.bw_posts for select using (not is_deleted);
create policy "bw_posts_insert"  on public.bw_posts for insert with check (auth.uid() = author_id);
create policy "bw_posts_update"  on public.bw_posts for update using (auth.uid() = author_id);
create policy "bw_posts_delete"  on public.bw_posts for delete using (
  auth.uid() = author_id or
  exists (select 1 from public.bw_profiles where id = auth.uid() and role = 'admin')
);

alter table public.bw_comments enable row level security;
create policy "bw_comments_select" on public.bw_comments for select using (not is_deleted);
create policy "bw_comments_insert" on public.bw_comments for insert with check (auth.uid() = author_id);
create policy "bw_comments_update" on public.bw_comments for update using (auth.uid() = author_id);
create policy "bw_comments_delete" on public.bw_comments for delete using (
  auth.uid() = author_id or
  exists (select 1 from public.bw_profiles where id = auth.uid() and role = 'admin')
);

alter table public.bw_likes enable row level security;
create policy "bw_likes_select" on public.bw_likes for select using (true);
create policy "bw_likes_insert" on public.bw_likes for insert with check (auth.uid() = user_id);
create policy "bw_likes_delete" on public.bw_likes for delete using (auth.uid() = user_id);

alter table public.bw_bookmarks enable row level security;
create policy "bw_bookmarks_own" on public.bw_bookmarks for all using (auth.uid() = user_id);

alter table public.bw_budget_plans enable row level security;
create policy "bw_budget_plans_couple" on public.bw_budget_plans for all using (
  exists (
    select 1 from public.bw_couples c
    where c.id = couple_id
      and (c.user_a = auth.uid() or c.user_b = auth.uid())
  )
);

alter table public.bw_budget_items enable row level security;
create policy "bw_budget_items_couple" on public.bw_budget_items for all using (
  exists (
    select 1 from public.bw_budget_plans bp
    join public.bw_couples c on c.id = bp.couple_id
    where bp.id = plan_id
      and (c.user_a = auth.uid() or c.user_b = auth.uid())
  )
);

alter table public.bw_scraper_logs enable row level security;
create policy "bw_scraper_logs_admin" on public.bw_scraper_logs for all using (
  exists (select 1 from public.bw_profiles where id = auth.uid() and role = 'admin')
);

alter table public.bw_admin_actions enable row level security;
create policy "bw_admin_actions_admin" on public.bw_admin_actions for all using (
  exists (select 1 from public.bw_profiles where id = auth.uid() and role = 'admin')
);


-- ============================================================
-- 9. 편의 VIEW
-- ============================================================

create view public.bw_v_posts as
  select
    p.*,
    pr.nickname   as author_nickname,
    pr.avatar_url as author_avatar,
    h.name        as hall_name
  from public.bw_posts p
  join public.bw_profiles pr on pr.id = p.author_id
  left join public.bw_halls h on h.id = p.hall_id
  where not p.is_deleted;

create view public.bw_v_comments as
  select
    c.*,
    pr.nickname   as author_nickname,
    pr.avatar_url as author_avatar
  from public.bw_comments c
  join public.bw_profiles pr on pr.id = c.author_id
  where not c.is_deleted;

create view public.bw_v_budget_summary as
  select
    bp.couple_id,
    bp.total                                                               as budget_total,
    coalesce(sum(bi.amount), 0)::int                                       as planned_total,
    coalesce(sum(bi.actual) filter (where bi.actual is not null), 0)::int  as spent_total,
    count(*) filter (where bi.status = 'done')                             as done_count,
    count(*)                                                               as item_count
  from public.bw_budget_plans bp
  left join public.bw_budget_items bi on bi.plan_id = bp.id
  group by bp.couple_id, bp.total;