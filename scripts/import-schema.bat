@echo off
REM Import schema to Cloud SQL
echo Importing schema to Cloud SQL brainspark-db...

gcloud sql connect brainspark-db --user=postgres --quiet < database\schema.sql

echo Schema import complete!
