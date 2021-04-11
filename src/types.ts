import { EntityManager, IDatabaseDriver, Connection } from "@mikro-orm/core";

export type EntityManagerContext = {
  em: EntityManager<any> & EntityManager<IDatabaseDriver<Connection>>;
};
