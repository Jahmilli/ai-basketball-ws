import {
  Entity,
  Column,
  BaseEntity,
  PrimaryGeneratedColumn,
  BeforeInsert,
} from "typeorm";

@Entity()
export class Video {
  @PrimaryGeneratedColumn("uuid")
  video_id!: string;

  @Column("text")
  name!: string;

  @Column("text")
  description!: string;

  @Column("boolean", { default: false })
  is_processed!: boolean;

  @Column("text")
  created_by!: string;

  @Column("text")
  storage_uri!: string;

  @Column("text")
  feedback!: string;

  // @Column("timestamp")
  // created_timestamp: any;
}
