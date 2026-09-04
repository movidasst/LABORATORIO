begin;

alter table public.laboratorio_simuladores
  drop constraint if exists laboratorio_simuladores_icono_check;

alter table public.laboratorio_simuladores
  add constraint laboratorio_simuladores_icono_check
  check (icono in (
    'instrumento', 'sonometro', 'luxometro', 'gases',
    'anemometro', 'wbgt', 'vibrometro', 'geiger'
  ));

create or replace function public.laboratorio_admin_guardar(p_datos jsonb)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_id bigint;
  v_nombre text;
  v_descripcion text;
  v_factor text;
  v_medicion text;
  v_url text;
  v_estado text;
  v_icono text;
  v_etiquetas text[];
  v_orden integer;
  v_publicada boolean;
  v_destacada boolean;
  v_slug text;
  v_slug_base text;
  v_suffix integer := 1;
begin
  if not private.es_admin_gestion() then
    raise exception 'No autorizado';
  end if;

  if p_datos is null or jsonb_typeof(p_datos) <> 'object' then
    raise exception 'Los datos del simulador no son válidos';
  end if;

  if exists (
    select 1
    from jsonb_object_keys(p_datos) as k(key)
    where k.key not in (
      'id', 'nombre', 'descripcion', 'url', 'factor', 'medicion', 'icono',
      'etiquetas', 'estado', 'destacada', 'publicada', 'orden'
    )
  ) then
    raise exception 'El formulario contiene campos no permitidos';
  end if;

  v_id := nullif(p_datos ->> 'id', '')::bigint;
  v_nombre := btrim(p_datos ->> 'nombre');
  v_descripcion := btrim(p_datos ->> 'descripcion');
  v_factor := btrim(p_datos ->> 'factor');
  v_medicion := nullif(btrim(p_datos ->> 'medicion'), '');
  v_url := nullif(btrim(p_datos ->> 'url'), '');
  v_estado := coalesce(nullif(btrim(p_datos ->> 'estado'), ''), 'Próximamente');
  v_icono := coalesce(nullif(btrim(p_datos ->> 'icono'), ''), 'instrumento');
  v_orden := greatest(0, least(10000, coalesce((p_datos ->> 'orden')::integer, 100)));
  v_publicada := coalesce((p_datos ->> 'publicada')::boolean, false);
  v_destacada := coalesce((p_datos ->> 'destacada')::boolean, false);

  if char_length(v_nombre) not between 2 and 100 then
    raise exception 'El nombre debe tener entre 2 y 100 caracteres';
  end if;
  if char_length(v_descripcion) not between 10 and 500 then
    raise exception 'La descripción debe tener entre 10 y 500 caracteres';
  end if;
  if char_length(v_factor) not between 2 and 80 then
    raise exception 'El área debe tener entre 2 y 80 caracteres';
  end if;
  if v_medicion is not null and char_length(v_medicion) > 100 then
    raise exception 'El campo de medición no puede superar 100 caracteres';
  end if;
  if v_url is not null and v_url !~ '^https://[^[:space:]]+$' then
    raise exception 'La dirección debe ser una URL segura https://';
  end if;
  if v_estado not in ('Disponible', 'Beta', 'Nueva', 'En desarrollo', 'Próximamente') then
    raise exception 'El estado seleccionado no es válido';
  end if;
  if v_icono not in (
    'instrumento', 'sonometro', 'luxometro', 'gases',
    'anemometro', 'wbgt', 'vibrometro', 'geiger'
  ) then
    raise exception 'El icono seleccionado no es válido';
  end if;

  if jsonb_typeof(p_datos -> 'etiquetas') = 'array' then
    v_etiquetas := array(
      select left(btrim(tag), 60)
      from jsonb_array_elements_text(p_datos -> 'etiquetas') as item(tag)
      where nullif(btrim(tag), '') is not null
      limit 12
    );
  else
    v_etiquetas := '{}';
  end if;

  if v_id is null then
    v_slug_base := trim(both '-' from regexp_replace(
      lower(translate(v_nombre, 'áéíóúüñÁÉÍÓÚÜÑ', 'aeiouunAEIOUUN')),
      '[^a-z0-9]+', '-', 'g'
    ));
    if v_slug_base = '' then
      v_slug_base := 'simulador';
    end if;
    v_slug := v_slug_base;
    while exists (select 1 from public.laboratorio_simuladores s where s.slug = v_slug) loop
      v_suffix := v_suffix + 1;
      v_slug := v_slug_base || '-' || v_suffix::text;
    end loop;

    insert into public.laboratorio_simuladores (
      slug, nombre, descripcion, url, factor, medicion, icono, etiquetas,
      estado, destacada, publicada, orden
    ) values (
      v_slug, v_nombre, v_descripcion, v_url, v_factor, v_medicion, v_icono,
      v_etiquetas, v_estado, v_destacada, v_publicada, v_orden
    ) returning id into v_id;
  else
    update public.laboratorio_simuladores s
    set nombre = v_nombre,
        descripcion = v_descripcion,
        url = v_url,
        factor = v_factor,
        medicion = v_medicion,
        icono = v_icono,
        etiquetas = v_etiquetas,
        estado = v_estado,
        destacada = v_destacada,
        publicada = v_publicada,
        orden = v_orden,
        updated_at = now()
    where s.id = v_id;

    if not found then
      raise exception 'El simulador no existe';
    end if;
  end if;

  return v_id;
end;
$$;

revoke all on function public.laboratorio_admin_guardar(jsonb) from public, anon;
grant execute on function public.laboratorio_admin_guardar(jsonb) to authenticated;

insert into public.laboratorio_simuladores (
  slug, nombre, descripcion, url, factor, medicion, icono, etiquetas,
  estado, destacada, publicada, orden
) values
  (
    'vibrometro-ocupacional', 'Vibrómetro ocupacional',
    'Explora la medición de vibraciones de mano-brazo y cuerpo entero, la selección de ejes y la interpretación inicial de la aceleración ponderada.',
    null, 'Vibraciones', 'Aceleración ponderada · m/s²',
    'vibrometro', array['Mano-brazo', 'Cuerpo entero', 'A(8)', 'm/s²'],
    'Próximamente', false, true, 60
  ),
  (
    'contador-geiger-muller', 'Contador Geiger-Müller',
    'Practica la comprobación de respuesta, el reconocimiento del fondo radiológico y la lectura de la tasa de conteo o de dosis sin confundir detección con dosimetría personal.',
    null, 'Radiaciones ionizantes', 'Tasa de conteo y de dosis · CPM, CPS, µSv/h',
    'geiger', array['CPM', 'CPS', 'µSv/h', 'Fondo radiológico'],
    'Próximamente', false, true, 70
  )
on conflict (slug) do update
set nombre = excluded.nombre,
    descripcion = excluded.descripcion,
    factor = excluded.factor,
    medicion = excluded.medicion,
    icono = excluded.icono,
    etiquetas = excluded.etiquetas,
    estado = excluded.estado,
    publicada = excluded.publicada,
    orden = excluded.orden,
    updated_at = now();

commit;
