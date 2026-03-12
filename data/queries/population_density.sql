-- Retrieve the top 5 highest population density blocks within a generic bounding box
SELECT 
  geo_id,
  total_pop,
  median_income,
  -- Calculate area in square kilometers
  ST_AREA(blockgroup_geom) / 1000000 AS area_sq_km,
  (total_pop / NULLIF(ST_AREA(blockgroup_geom) / 1000000, 0)) AS population_density,
  -- Getting the center point of the polygon for marking on a map
  ST_Y(ST_CENTROID(blockgroup_geom)) AS lat,
  ST_X(ST_CENTROID(blockgroup_geom)) AS lng
FROM 
  `bigquery-public-data.census_bureau_acs.blockgroup_2020_5yr`
WHERE
  -- Intersect with the bounding box of interest
  ST_INTERSECTS(
    blockgroup_geom, 
    ST_MAKEPOLYGON(ST_MAKELINE([
      ST_GEOGPOINT({west}, {south}),
      ST_GEOGPOINT({east}, {south}),
      ST_GEOGPOINT({east}, {north}),
      ST_GEOGPOINT({west}, {north}),
      ST_GEOGPOINT({west}, {south})  -- Close the loop
    ]))
  )
ORDER BY 
  population_density DESC
LIMIT 5;
