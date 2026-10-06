-- Disposable synthetic game, rolled back completely after verification.
begin;
update public.keyboard_pilot_settings set enabled=true where id=true;
set local role service_role;
do $$
declare s jsonb; denied boolean:=false;
begin
 if has_table_privilege('anon','public.keyboard_pilot_rooms','select') or
    has_function_privilege('anon','public.keyboard_pilot(text,text,text,jsonb)','execute') then
   raise exception 'Public database access is incorrectly enabled';
 end if;
 s:=public.keyboard_pilot('create','999999','teacher-test','{"phase":"lobby","level":"N3","questions":[{"pitch":60}],"allowedAnswers":["C"]}');
 if s ? 'questions' or s ? 'allowedAnswers' then raise exception 'Private questions leaked'; end if;
 perform public.keyboard_pilot('join','999999','pupil-test','{"name":"Test Pupil"}');
 begin
   perform public.keyboard_pilot('start','999999','pupil-test');
 exception when others then denied:=true;
 end;
 if not denied then raise exception 'Pupil can control game'; end if;
 perform public.keyboard_pilot('start','999999','teacher-test');
 s:=public.keyboard_pilot('answer','999999','pupil-test','{"index":0,"answer":"C","pitch":0}');
 if not (s->>'submitted')::boolean then raise exception 'Answer not recorded'; end if;
 if s->'players'->0->>'score' is not null then raise exception 'Score leaked before reveal'; end if;
 denied:=false;
 begin
   perform public.keyboard_pilot('answer','999999','pupil-test','{"index":0,"answer":"C","pitch":0}');
 exception when others then denied:=true;
 end;
 if not denied then raise exception 'Duplicate answer accepted'; end if;
 s:=public.keyboard_pilot('reveal','999999','teacher-test');
 if (s->'players'->0->>'score')::int<>1000 then raise exception 'Scoring failed'; end if;
 s:=public.keyboard_pilot('next','999999','teacher-test');
 if s->>'phase'<>'finished' then raise exception 'Game did not finish'; end if;
 perform public.keyboard_pilot('end','999999','teacher-test');
end $$;
reset role;
rollback;
select enabled, requests, games,
 (select count(*) from public.keyboard_pilot_rooms) as rooms,
 has_table_privilege('anon','public.keyboard_pilot_rooms','select') as public_table_access,
 has_function_privilege('anon','public.keyboard_pilot(text,text,text,jsonb)','execute') as public_function_access
from public.keyboard_pilot_settings;
