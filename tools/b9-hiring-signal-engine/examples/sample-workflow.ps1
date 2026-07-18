param(
  [string]$Database = "./data/cache/example-run.sqlite",
  [string]$InputFile = "./data/samples/fake-jobs.csv"
)

npm run init -- --database $Database
npm run import:jobs -- $InputFile --database $Database
npm run find:hiring -- --database $Database --radius 40 --limit 25
npm run research:companies -- --database $Database --limit 25
npm run find:contacts -- --database $Database --limit 25
npm run dedupe -- --database $Database
npm run review:list -- --database $Database --limit 25

Write-Output "Review the displayed companies. Then run review:approve for selected IDs, followed by generate:emails and generate:txt."
