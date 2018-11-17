import {MigrationInterface, QueryRunner} from "typeorm";

export class PostRefactoring1542467101665 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `users` (`id` bigint NOT NULL, `alias` varchar(255) NOT NULL, `name` varchar(255) NOT NULL, `screen_name` varchar(255) NOT NULL, `crawled_at` int NOT NULL, PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP TABLE `users`");
    }

}
