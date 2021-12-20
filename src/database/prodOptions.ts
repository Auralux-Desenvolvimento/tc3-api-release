import { ConnectionOptions } from "typeorm"

const prodOptions: Partial<ConnectionOptions> = {
  entities: [ "build/models/**/*.js" ],
  migrations: [ "build/database/migrations/**/*.js" ],
  cli: { 
    entitiesDir: "build/models",
    migrationsDir: "build/database/migrations"
  }
};
export default prodOptions