import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddInvitationQuotaAndUsedBy1769827107728
  implements MigrationInterface
{
  name = 'AddInvitationQuotaAndUsedBy1769827107728';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "invitationQuota" integer NOT NULL DEFAULT '0'`,
    );
    await queryRunner.query(`ALTER TABLE "invitations" ADD "usedById" uuid`);
    await queryRunner.query(`ALTER TABLE "invitations" ADD "usedAt" TIMESTAMP`);
    await queryRunner.query(
      `ALTER TABLE "invitations" ADD CONSTRAINT "FK_invitations_usedById" FOREIGN KEY ("usedById") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "invitations" DROP CONSTRAINT "FK_invitations_usedById"`,
    );
    await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "usedAt"`);
    await queryRunner.query(`ALTER TABLE "invitations" DROP COLUMN "usedById"`);
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "invitationQuota"`,
    );
  }
}
