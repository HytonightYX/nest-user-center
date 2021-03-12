import { Column, DataType, Default, Table } from 'sequelize-typescript';

import { BaseModel } from './base';

@Table({ tableName: 'user', timestamps: true, freezeTableName: true })
export class User extends BaseModel<User> {
  @Column({
    comment: 'user name',
    type: DataType.STRING(60),
  })
  name: string;

  @Column({
    comment: 'user email',
    type: DataType.STRING(60),
  })
  email: string;

  @Default('CHOGATH-XXX')
  @Column({
    comment: 'user password, save after encoding with SHA256',
    type: DataType.STRING(255),
  })
  password: string;
}
