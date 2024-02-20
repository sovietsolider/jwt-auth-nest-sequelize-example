import { AllowNull, Column, IsNull, Model, NotNull, Table } from "sequelize-typescript";


@Table
export class User extends Model {
  @Column
  name!: string

  @Column
  phone!: string

  @AllowNull(false)
  @Column
  email!: string

  @Column
  password!: string

  @Column
  refreshToken!: string
}