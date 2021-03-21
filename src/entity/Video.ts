import { AngleOfShot, IFeedback, TypeOfShot } from "../interfaces/IVideo";
import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("videos")
export class Video {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column("text", { name: "user_id" })
  userId: string; // References id from Users table

  @Column("text")
  name: string;

  @Column("text")
  description: string;

  @Column("boolean", { name: "is_processed", default: false })
  isProcessed: boolean;

  @Column("text", { name: "angle_of_shot" })
  angleOfShot: AngleOfShot;

  @Column("text", { name: "type_of_shot" })
  typeOfShot: TypeOfShot;

  @Column("text", { name: "storage_uri" })
  storageUri: string;

  @Column("jsonb", { nullable: true })
  feedback: IFeedback | null;

  @Column("timestamptz", { name: "created_timestamp" })
  createdTimestamp: Date;
}
