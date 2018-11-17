import {MigrationInterface, QueryRunner} from "typeorm";

export class PostRefactoring1542481049603 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("CREATE TABLE `tweets` (`id` bigint NOT NULL, `user_id` varchar(255) NOT NULL, `data` text NOT NULL, `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
        await queryRunner.query("CREATE TABLE `users` (`id` bigint NOT NULL, `alias` varchar(255) NOT NULL DEFAULT '', `name` varchar(255) NOT NULL DEFAULT '', `screen_name` varchar(255) NOT NULL DEFAULT '', `crawled_at` int NOT NULL DEFAULT '0', `created_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), `updated_at` datetime(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6), PRIMARY KEY (`id`)) ENGINE=InnoDB");
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.query("DROP TABLE `users`");
        await queryRunner.query("DROP TABLE `tweets`");
    }

}
