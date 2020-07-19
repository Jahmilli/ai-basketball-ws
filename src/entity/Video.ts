import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("videos")
export class Video {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column("text")
  user_id!: string; // References id from Users table

  @Column("text")
  name!: string;

  @Column("text")
  description!: string;

  @Column("boolean", { default: false })
  is_processed!: boolean;

  @Column("text")
  angle_of_shot!: string;

  @Column("text")
  type_of_shot!: string;

  @Column("text")
  storage_uri!: string;

  @Column("text")
  feedback!: string;

  @Column("timestamptz")
  created_timestamp: any;
}
