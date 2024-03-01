import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBlogWallpaperImageEntity1709285015402
  implements MigrationInterface
{
  name = 'CreateBlogWallpaperImageEntity1709285015402';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "blog_wallpaper_images" ("id" SERIAL NOT NULL, "url" character varying NOT NULL, "width" integer NOT NULL, "height" integer NOT NULL, "size" bigint NOT NULL, "blogId" integer, CONSTRAINT "REL_99a80c2458e28340dc672ac312" UNIQUE ("blogId"), CONSTRAINT "PK_86ca6798e2f30a6f3c22babe755" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "blog_wallpaper_images" ADD CONSTRAINT "FK_99a80c2458e28340dc672ac3124" FOREIGN KEY ("blogId") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "blog_wallpaper_images" DROP CONSTRAINT "FK_99a80c2458e28340dc672ac3124"`,
    );
    await queryRunner.query(`DROP TABLE "blog_wallpaper_images"`);
  }
}
