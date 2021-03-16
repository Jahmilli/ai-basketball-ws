import { Entity, Column, PrimaryGeneratedColumn } from "typeorm";

@Entity("users")
export class User {
  @Column("text")
  id: string;

  @Column("text")
  email: string;

  @Column("text", { name: "first_name" })
  firstName: string;

  @Column("text", { name: "last_name" })
  lastName: string;

  @Column("timestamp with time zone", { name: "date_of_birth" })
  dateOfBirth: Date;

  @Column("timestamp with time zone", { name: "created_timestamp" })
  createdTimestamp: Date;
}
