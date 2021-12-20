import { Connection, ConnectionOptions, createConnection, getConnectionOptions } from 'typeorm';
import prodOptions from './prodOptions';

export default async function connect (): Promise<Connection> {
  let defaultOptions = await getConnectionOptions();
  if (process.env.NODE_ENV === "production") {
    defaultOptions = Object.assign(defaultOptions, prodOptions);
  }
  const connection = await createConnection( 
    Object.assign(defaultOptions, {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      username: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
    } as ConnectionOptions)
  );
  return connection;
}