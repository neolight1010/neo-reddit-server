import { MikroORM } from "@mikro-orm/core";
import mikroOrmConfig from "./mikro-orm.config";
import { __dbName__, __dbPassword__, __dbUser__, __debug__ } from "./constants";
import { Post } from "./entities/Post";

async function main() {
  const orm = await MikroORM.init(mikroOrmConfig);

  await orm.getMigrator().up();

  const post = new Post("My first post!");
  await orm.em.persistAndFlush(post);
}

main().catch((e) => console.log(e));
