import { Entity, Column, PrimaryColumn } from "typeorm";

@Entity("users")
export class User {
  @PrimaryColumn("text")
  id: string;

  @Column("text")
  email: string;

  @Column("text", { name: "first_name" })
  firstName: string;

  @Column("text", { name: "last_name" })
  lastName: string;

  @Column("timestamptz", { name: "date_of_birth" })
  dateOfBirth: Date;

  @Column("timestamptz", { name: "last_updated" })
  lastUpdated: Date;

  @Column("timestamptz", { name: "created_timestamp" })
  createdTimestamp: Date;
}
