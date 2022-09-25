import {MigrationInterface, QueryRunner} from "typeorm";

export class Initial1664066812431 implements MigrationInterface {
    name = 'Initial1664066812431'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP CONSTRAINT "FK_f5de237a438d298031d11a57c3b"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP CONSTRAINT "FK_43cc1af57676ac1b7ec774bd10f"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP CONSTRAINT "UQ_16e301aa5efdd994626b2635186"`);
        await queryRunner.query(`CREATE TABLE "vote_users_user" ("voteId" integer NOT NULL, "userId" integer NOT NULL, CONSTRAINT "PK_7086c6a86bb4f4c9aeedd07a264" PRIMARY KEY ("voteId", "userId"))`);
        await queryRunner.query(`CREATE INDEX "IDX_87635a654750c72ba9b2de9be9" ON "vote_users_user" ("voteId") `);
        await queryRunner.query(`CREATE INDEX "IDX_8bf140af0b90a4bc9f9352669c" ON "vote_users_user" ("userId") `);
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD "userId" integer`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD CONSTRAINT "UQ_16e301aa5efdd994626b2635186" UNIQUE ("userId", "postId")`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD CONSTRAINT "FK_43cc1af57676ac1b7ec774bd10f" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "vote_users_user" ADD CONSTRAINT "FK_87635a654750c72ba9b2de9be91" FOREIGN KEY ("voteId") REFERENCES "vote"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
        await queryRunner.query(`ALTER TABLE "vote_users_user" ADD CONSTRAINT "FK_8bf140af0b90a4bc9f9352669cf" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "vote_users_user" DROP CONSTRAINT "FK_8bf140af0b90a4bc9f9352669cf"`);
        await queryRunner.query(`ALTER TABLE "vote_users_user" DROP CONSTRAINT "FK_87635a654750c72ba9b2de9be91"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP CONSTRAINT "FK_43cc1af57676ac1b7ec774bd10f"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP CONSTRAINT "FK_f5de237a438d298031d11a57c3b"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP CONSTRAINT "UQ_16e301aa5efdd994626b2635186"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" DROP COLUMN "userId"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD "userId" integer`);
        await queryRunner.query(`DROP INDEX "IDX_8bf140af0b90a4bc9f9352669c"`);
        await queryRunner.query(`DROP INDEX "IDX_87635a654750c72ba9b2de9be9"`);
        await queryRunner.query(`DROP TABLE "vote_users_user"`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD CONSTRAINT "UQ_16e301aa5efdd994626b2635186" UNIQUE ("userId", "postId")`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD CONSTRAINT "FK_43cc1af57676ac1b7ec774bd10f" FOREIGN KEY ("postId") REFERENCES "post"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "public"."vote" ADD CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
