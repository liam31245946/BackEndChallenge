CREATE TABLE "Movie" (
  "movieId" text,
  "title" text,
  "summary" text,
  "rating" number,
  "Link" text
);

COMMENT ON COLUMN "Movie"."rating" IS '1 out of 5';
