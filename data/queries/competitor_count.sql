-- Count the number of specific competitors (e.g., bakeries) within a bounded area
SELECT 
  COUNT(id) as competitor_count
FROM 
  `bigquery-public-data.geo_openstreetmap.planet_nodes`,
  UNNEST(all_tags) as tags
WHERE 
  -- Find nodes matching shop=bakery or amenity=cafe
  (tags.key = 'shop' AND tags.value IN ('bakery')) 
  OR (tags.key = 'amenity' AND tags.value IN ('cafe'))
  AND ST_INTERSECTS(
    geometry, 
    ST_MAKEPOLYGON(ST_MAKELINE([
      ST_GEOGPOINT({west}, {south}),
      ST_GEOGPOINT({east}, {south}),
      ST_GEOGPOINT({east}, {north}),
      ST_GEOGPOINT({west}, {north}),
      ST_GEOGPOINT({west}, {south}) 
    ]))
  )
