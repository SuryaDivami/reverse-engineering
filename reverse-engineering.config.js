module.exports = {
  "database": {
    "type": "postgres",
    "host": "localhost",
    "port": 5432,
    "username": "postgres",
    "password": "password",
    "database": "your_database",
    "schema": "public"
  },
  "paths": {
    "baseOutput": "./src",
    "entities": "./src/entities",
    "crud": "./src",
    "sql": "./sql",
    "dataExport": "./data"
  },
  "features": {
    "entities": true,
    "crud": true,
    "sql": true,
    "dataExport": false,
    "generateIndex": true
  },
  "crud": {
    "framework": "nestjs",
    "includeValidation": true,
    "includeSwagger": true,
    "includePagination": true,
    "includeFiltering": true,
    "includeSorting": true,
    "includeRelations": false,
    "generateTests": false,
    "authGuards": false,
    "useTypeORM": true,
    "useDTO": true,
    "excludedTables": []
  },
  "entities": {
    "useTypeORM": true,
    "includeValidation": true,
    "includeSwagger": true,
    "generateEnums": true,
    "excludedTables": []
  },
  "sql": {
    "generateCreateTables": true,
    "generateInserts": true,
    "formatSql": true,
    "includeComments": true
  },
  "dataExport": {
    "enableMasking": false,
    "batchSize": 1000,
    "format": "sql",
    "maskedFields": [
      "password",
      "email",
      "phone",
      "ssn",
      "credit_card"
    ]
  }
};