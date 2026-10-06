-- Remove application capacity caps; keep authentication, validation and room expiry.
BEGIN;
create or replace function public.keyboard_pilot(p_action text,p_pin text,p_token text,p_data jsonb default '{}')
returns jsonb language plpgsql security definer set search_path=public,pg_temp as $$
declare
 c keyboard_pilot_settings; r keyboard_pilot_rooms; player jsonb; result jsonb;
 i integer; question jsonb; now_ms bigint := floor(extract(epoch from clock_timestamp())*1000);
 is_host boolean; mine text; board jsonb;
begin
 select * into c from keyboard_pilot_settings where id=true for update;
 if not c.enabled then raise exception 'Classroom pilot is switched off.'; end if;
 if c.month<>date_trunc('month',now())::date then c.month:=date_trunc('month',now())::date; c.requests:=0; end if;
 if c.day<>current_date then c.day:=current_date; c.games:=0; end if;
 update keyboard_pilot_settings set month=c.month,requests=c.requests+1,day=c.day,games=c.games where id=true;
 delete from keyboard_pilot_rooms where expires<now();
 if p_action='check' then return jsonb_build_object('available',true); end if;
 if p_action='create' then
   insert into keyboard_pilot_rooms values(p_pin,p_token,now()+interval '45 minutes',p_data,'[]') returning * into r;
   update keyboard_pilot_settings set games=games+1 where id=true;
 else
   select * into r from keyboard_pilot_rooms where pin=p_pin for update;
   if not found then raise exception 'Game not found or expired.'; end if;
 end if;
 is_host:=r.host_hash=p_token;
 select value into player from jsonb_array_elements(r.players) where value->>'token'=p_token;
 if p_action='join' and player is null then
   if r.state->>'phase'<>'lobby' then raise exception 'This game has already started.'; end if;
   player:=jsonb_build_object('token',p_token,'name',p_data->>'name','score',0,'answer',null,'answered',false);
   r.players:=r.players||jsonb_build_array(player);
 elsif not is_host and player is null then raise exception 'Join this game first.';
 end if;
 if p_action in ('start','next','reveal','end') and not is_host then raise exception 'Only the teacher can control the game.'; end if;
 if p_action='start' then
   if r.state->>'phase'<>'lobby' then raise exception 'Game already started.'; end if;
   r.state:=r.state||jsonb_build_object('phase','question','index',0,'deadline',now_ms+20000);
 elsif p_action='reveal' then
   if r.state->>'phase'='question' then r.state:=r.state||jsonb_build_object('phase','review'); end if;
 elsif p_action='next' then
   if r.state->>'phase'<>'review' then raise exception 'Reveal answers first.'; end if;
   i:=(r.state->>'index')::int+1;
   if i>=jsonb_array_length(r.state->'questions') then r.state:=r.state||jsonb_build_object('phase','finished');
   else
     r.state:=r.state||jsonb_build_object('phase','question','index',i,'deadline',now_ms+20000);
     select coalesce(jsonb_agg(value||jsonb_build_object('answer',null,'answered',false)),'[]') into r.players from jsonb_array_elements(r.players);
   end if;
 elsif p_action='end' then
   delete from keyboard_pilot_rooms where pin=p_pin; return jsonb_build_object('closed',true);
 elsif p_action='answer' then
   if is_host or r.state->>'phase'<>'question' or now_ms>(r.state->>'deadline')::bigint then raise exception 'Answers are closed.'; end if;
   if p_data->>'index'<>r.state->>'index' then raise exception 'Question has changed.'; end if;
   if not (r.state->'allowedAnswers' ? (p_data->>'answer')) then raise exception 'Choose a note from this level.'; end if;
   if (player->>'answered')::boolean then raise exception 'Answer already submitted.'; end if;
   question:=r.state->'questions'->((r.state->>'index')::int);
   player:=player||jsonb_build_object('answer',p_data->>'answer','answered',true,'correct',(p_data->>'pitch')::int=(question->>'pitch')::int%12,
     'score',(player->>'score')::int+case when (p_data->>'pitch')::int=(question->>'pitch')::int%12 then 1000 else 0 end);
   select jsonb_agg(case when value->>'token'=p_token then player else value end) into r.players from jsonb_array_elements(r.players);
 end if;
 if r.state->>'phase'='question' and now_ms>(r.state->>'deadline')::bigint then r.state:=r.state||jsonb_build_object('phase','review'); end if;
 update keyboard_pilot_rooms set state=r.state,players=r.players where pin=p_pin;
 select coalesce(jsonb_agg(jsonb_build_object('name',value->>'name','score',case when r.state->>'phase' in ('review','finished') then value->'score' else null end,'answered',value->'answered') order by case when r.state->>'phase' in ('review','finished') then (value->>'score')::int else 0 end desc, value->>'name'),'[]') into board from jsonb_array_elements(r.players);
 -- No tokens, future questions or correctness are sent before reveal.
 result:=(r.state-'questions'-'allowedAnswers')||jsonb_build_object('pin',r.pin,'host',is_host,'players',board,'total',jsonb_array_length(r.state->'questions'),'serverTime',now_ms,
   'question',case when r.state->>'phase'='lobby' then null else r.state->'questions'->((r.state->>'index')::int) end,
   'submitted',coalesce((player->>'answered')::boolean,false));
 if r.state->>'phase' in ('review','finished') then result:=result||jsonb_build_object('correct',player->'correct'); end if;
 return result;
end $$;
revoke all on function public.keyboard_pilot(text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.keyboard_pilot(text,text,text,jsonb) to service_role;

-- Existing capacity-setting columns are retained but no longer enforced.
COMMIT;
