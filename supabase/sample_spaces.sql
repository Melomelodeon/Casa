begin;

do $$
declare
  landlord_ids uuid[];
  host_id uuid;
  space_id bigint;
  floor_id bigint;
  room_id bigint;
  space_record record;
  space_index integer := 0;
  space_count integer := 0;
  floor_count integer := 0;
  room_count integer := 0;
  bedspace_count integer := 0;
begin
  select array_agg(id order by created_at, id)
  into landlord_ids
  from auth.users
  where raw_user_meta_data ->> 'role' = 'landlord';

  if coalesce(cardinality(landlord_ids), 0) = 0 then
    raise exception 'No landlord accounts exist. Create at least one landlord account before running this seed.';
  end if;

  for space_record in
    select *
    from (values
      (
        'Harborlight House',
        'Legazpi Village, Makati',
        'Bedspace',
        'Comfortable shared rooms close to offices, parks, and transit.',
        7800::numeric,
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85',
        14.5535::double precision,
        121.0147::double precision,
        'Second floor',
        'Bay Room',
        'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85'
      ),
      (
        'Amberwood Rooms',
        'Teachers Village, Quezon City',
        'Private room',
        'A bright private room in a leafy neighborhood near local cafes.',
        9800::numeric,
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=85',
        14.6466::double precision,
        121.0604::double precision,
        'Ground floor',
        'Amber Room',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=85'
      ),
      (
        'Citrus Court',
        'Cebu IT Park, Cebu City',
        'Bedspace',
        'Practical shared accommodation a short commute from Cebu IT Park.',
        6500::numeric,
        'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85',
        10.3302::double precision,
        123.9068::double precision,
        'Third floor',
        'Citrus Room',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=85'
      ),
      (
        'Mosswood Place',
        'Diliman, Quezon City',
        'Private room',
        'A quiet private suite surrounded by trees and neighborhood shops.',
        10500::numeric,
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85',
        14.6547::double precision,
        121.0645::double precision,
        'Ground floor',
        'Moss Suite',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=85'
      ),
      (
        'Northstar Living',
        'Cubao, Quezon City',
        'Bedspace',
        'A well-connected shared home near the Cubao transport hub.',
        6200::numeric,
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85',
        14.6192::double precision,
        121.0514::double precision,
        'Second floor',
        'North Room',
        'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85'
      ),
      (
        'The Sampaguita House',
        'Project 4, Quezon City',
        'Private room',
        'A furnished private room in a relaxed residential community.',
        8900::numeric,
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=85',
        14.6258::double precision,
        121.0776::double precision,
        'Ground floor',
        'Sampaguita Room',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=85'
      ),
      (
        'Linden Loft',
        'Kapitolyo, Pasig',
        'Bedspace',
        'Shared city living with quick access to Ortigas and BGC.',
        8200::numeric,
        'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85',
        14.5729::double precision,
        121.0615::double precision,
        'Third floor',
        'Linden Room',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=85'
      ),
      (
        'Bluebell Residence',
        'Boni Avenue, Mandaluyong',
        'Private room',
        'A private, furnished room close to transit and everyday essentials.',
        9400::numeric,
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85',
        14.5741::double precision,
        121.0398::double precision,
        'Second floor',
        'Bluebell Room',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=85'
      ),
      (
        'Sunroom Commons',
        'San Antonio, Makati',
        'Bedspace',
        'Friendly shared accommodation near Makati business districts.',
        7400::numeric,
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85',
        14.5676::double precision,
        121.0152::double precision,
        'Second floor',
        'Sunroom',
        'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85'
      ),
      (
        'Cedar Walk House',
        'New Manila, Quezon City',
        'Private room',
        'A peaceful private room in a residential area with nearby transport.',
        11200::numeric,
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=85',
        14.6247::double precision,
        121.0334::double precision,
        'Ground floor',
        'Cedar Suite',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=85'
      ),
      (
        'Palmhouse Cebu',
        'Lahug, Cebu City',
        'Bedspace',
        'Affordable shared rooms near universities and Cebu business areas.',
        6000::numeric,
        'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85',
        10.3351::double precision,
        123.8912::double precision,
        'Third floor',
        'Palm Room',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=85'
      ),
      (
        'Amihan House',
        'Matina, Davao City',
        'Private room',
        'A comfortable private room in a convenient Davao neighborhood.',
        7800::numeric,
        'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=900&q=85',
        7.0586::double precision,
        125.5883::double precision,
        'Ground floor',
        'Amihan Room',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=85'
      ),
      (
        'Acacia Nook',
        'Lahug, Cebu City',
        'Bedspace',
        'A clean shared home near shops, schools, and public transport.',
        6700::numeric,
        'https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=900&q=85',
        10.3269::double precision,
        123.8987::double precision,
        'Second floor',
        'Acacia Room',
        'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85'
      ),
      (
        'The Olive Residence',
        'Poblacion, Makati',
        'Private room',
        'A furnished private room within reach of restaurants and transit.',
        11800::numeric,
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=900&q=85',
        14.5653::double precision,
        121.0326::double precision,
        'Third floor',
        'Olive Suite',
        'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=900&q=85'
      ),
      (
        'Riverstone Rooms',
        'Marikina Heights, Marikina',
        'Bedspace',
        'Shared accommodation in a quiet neighborhood with local conveniences.',
        5600::numeric,
        'https://images.unsplash.com/photo-1560185008-b033106af5c3?auto=format&fit=crop&w=900&q=85',
        14.6354::double precision,
        121.1051::double precision,
        'Second floor',
        'Riverstone Room',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&w=900&q=85'
      )
    ) as samples(
      name, location, type, description, monthly_rent, cover_photo_url,
      latitude, longitude, floor_name, room_name, room_photo_url
    )
  loop
    if exists (
      select 1
      from public.spaces
      where name = space_record.name
        and location = space_record.location
    ) then
      continue;
    end if;

    space_index := space_index + 1;
    host_id := landlord_ids[((space_index - 1) % cardinality(landlord_ids)) + 1];

    insert into public.spaces (
      host_id, name, location, type, description, monthly_rent,
      cover_photo_url, latitude, longitude, status
    )
    values (
      host_id,
      space_record.name,
      space_record.location,
      space_record.type,
      space_record.description,
      space_record.monthly_rent,
      space_record.cover_photo_url,
      space_record.latitude,
      space_record.longitude,
      'published'
    )
    returning id into space_id;
    space_count := space_count + 1;

    insert into public.floors (space_id, name)
    values (space_id, space_record.floor_name)
    returning id into floor_id;
    floor_count := floor_count + 1;

    insert into public.rooms (
      space_id, floor_id, name, photo_url, monthly_rent,
      amenities, house_rules, maintenance,
      grid_rows, grid_columns, door_row, door_column
    )
    values (
      space_id,
      floor_id,
      space_record.room_name,
      space_record.room_photo_url,
      case when space_record.type = 'Private room' then space_record.monthly_rent else null end,
      case when space_record.type = 'Private room'
        then array['Wi-Fi', 'Furnished room', 'Kitchen access']
        else '{}'::text[]
      end,
      case when space_record.type = 'Private room'
        then array['Quiet hours after 10 PM', 'No smoking indoors']
        else '{}'::text[]
      end,
      case when space_record.type = 'Private room'
        then array['Room deep-cleaned and sanitized']
        else '{}'::text[]
      end,
      2,
      3,
      1,
      3
    )
    returning id into room_id;
    room_count := room_count + 1;

    if space_record.type = 'Bedspace' then
      insert into public.bedspaces (
        space_id, room_id, name, price, row, column_index,
        amenities, house_rules, maintenance
      )
      values
        (
          space_id, room_id, 'Bed A', space_record.monthly_rent,
          1, 1, array['Wi-Fi', 'Laundry area'], array['Guests must be registered'], array['Bed frame inspected']
        ),
        (
          space_id, room_id, 'Bed B', space_record.monthly_rent + 300,
          1, 2, array['Wi-Fi', 'Laundry area'], array['Guests must be registered'], array['Mattress inspected']
        ),
        (
          space_id, room_id, 'Bed C', space_record.monthly_rent + 600,
          2, 1, array['Wi-Fi', 'Study desk'], array['Quiet hours after 10 PM'], array['Bed frame inspected']
        ),
        (
          space_id, room_id, 'Bed D', space_record.monthly_rent + 900,
          2, 2, array['Wi-Fi', 'Study desk'], array['Quiet hours after 10 PM'], array['Mattress inspected']
        );
      bedspace_count := bedspace_count + 4;
    end if;
  end loop;

  if space_count not in (0, 15) then
    raise exception 'Expected to add all 15 sample listings or none, but added %. The transaction has been rolled back.', space_count;
  end if;

  if floor_count <> space_count or room_count <> space_count then
    raise exception 'Related record count mismatch: spaces %, floors %, rooms %.',
      space_count, floor_count, room_count;
  end if;

  if bedspace_count <> (case when space_count = 15 then 32 else 0 end) then
    raise exception 'Bedspace count mismatch: expected %, got %.',
      case when space_count = 15 then 32 else 0 end, bedspace_count;
  end if;

  raise notice 'Added % sample listings with % floors, % rooms, and % bedspaces across % landlord account(s).',
    space_count, floor_count, room_count, bedspace_count, cardinality(landlord_ids);
end;
$$;

commit;
