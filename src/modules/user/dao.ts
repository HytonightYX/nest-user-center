import { Inject, Injectable } from '@nestjs/common';
import { PostgresqlProvider, Sequelize, Op, User, CommonFindOptions, Conditions } from '@library/postgresql';

import { FindUserDto, CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UserDao {

  constructor(
    @Inject(PostgresqlProvider.local)
    private readonly postgresql: Sequelize,
  ) {}

  async create(dto: CreateUserDto) {
    const { id, name, email, createdAt, updatedAt } = await User.create(dto);
    return { id, name, email, createdAt, updatedAt } as User;
  }

  async update(dto: UpdateUserDto) {
    this.postgresql.transaction(async (transaction) => {
      const entity = {};
      const { id, name, email, password } = dto;

      if (name) entity['name'] = name;
      if (email) entity['email'] = email;
      if (password) entity['password'] = password;

      await User.update(entity, { where: { id }, transaction });
    });
  }

  async findOne(dto: FindUserDto, options?: CommonFindOptions<User>) {
    const { id, name, email } = dto;
    const conditions: Conditions = { where: {}};

    if (id) conditions.where['id'] = id;
    if (name) conditions.where['name'] = name;
    if (email) conditions.where['email'] = email;

    if (options) {
      const { fuzzySearch, attributes } = options;
      if (attributes) conditions.attributes = attributes;
      if (name && fuzzySearch) conditions.where['name'] = { [Op.like]: `%${name}%` };
    }

    const result = await User.findOne(conditions);
    return result;
  }

  async findById(id: number, options?: CommonFindOptions<User>) {
    const conditions: Conditions = { where: { id }};

    if (options) {
      const { attributes } = options;
      if (attributes) conditions.attributes = attributes;
    }

    const result = await User.findOne(conditions);
    return result;
  }
}
