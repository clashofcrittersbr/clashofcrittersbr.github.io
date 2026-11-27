-- Avatares enviados pelos próprios membros. Aplicar antes da PR da interface.
-- O bucket é público: qualquer visitante que conheça a URL pode ver a imagem.
begin;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wiki-avatars', 'wiki-avatars', true, 5242880,
        array['image/jpeg', 'image/png', 'image/webp'])
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists wiki_avatars_insert_own on storage.objects;
create policy wiki_avatars_insert_own on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'wiki-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and storage.filename(name) = 'avatar'
  );

drop policy if exists wiki_avatars_read_own on storage.objects;
create policy wiki_avatars_read_own on storage.objects
  for select to authenticated
  using (
    bucket_id = 'wiki-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and storage.filename(name) = 'avatar'
  );

drop policy if exists wiki_avatars_update_own on storage.objects;
create policy wiki_avatars_update_own on storage.objects
  for update to authenticated
  using (
    bucket_id = 'wiki-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and storage.filename(name) = 'avatar'
  )
  with check (
    bucket_id = 'wiki-avatars'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and storage.filename(name) = 'avatar'
  );

commit;
