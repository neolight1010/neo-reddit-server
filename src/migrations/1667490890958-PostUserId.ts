import { MigrationInterface, QueryRunner } from "typeorm";

export class PostUserId1667490890958 implements MigrationInterface {
  name = "PostUserId1667490890958";

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."vote" DROP CONSTRAINT "FK_f5de237a438d298031d11a57c3b"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."vote" DROP CONSTRAINT "UQ_16e301aa5efdd994626b2635186"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."vote" ALTER COLUMN "userId" SET NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."vote" ADD CONSTRAINT "UQ_16e301aa5efdd994626b2635186" UNIQUE ("userId", "postId")`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."vote" ADD CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "public"."vote" DROP CONSTRAINT "FK_f5de237a438d298031d11a57c3b"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."vote" DROP CONSTRAINT "UQ_16e301aa5efdd994626b2635186"`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."vote" ALTER COLUMN "userId" DROP NOT NULL`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."vote" ADD CONSTRAINT "UQ_16e301aa5efdd994626b2635186" UNIQUE ("userId", "postId")`
    );
    await queryRunner.query(
      `ALTER TABLE "public"."vote" ADD CONSTRAINT "FK_f5de237a438d298031d11a57c3b" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`
    );
  }
}
