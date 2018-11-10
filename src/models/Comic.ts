import { Table, Column, Model, CreatedAt, UpdatedAt } from 'sequelize-typescript';

@Table({ tableName: 'comics' })
export class Comic extends Model<Comic> {

  @Column
  title?: string;

  @Column
  explanation?: string;

  @Column
  url?: string;

  @CreatedAt
  createdAt?: Date;

  @UpdatedAt
  updatedAt?: Date;
}
