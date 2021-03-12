import { assign } from 'lodash';
import { Inject, Injectable } from '@nestjs/common';
import { PostgresqlProvider, Sequelize, Op, User, FindOptions, Conditions } from '@library/postgresql';

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

  async updateById(id: number, dto: UpdateUserDto) {
    this.postgresql.transaction(async (transaction) => {
      const entity = {};
      const { name, email, password } = dto;

      if (name) entity['name'] = name;
      if (email) entity['email'] = email;
      if (password) entity['password'] = password;

      await User.update(entity, { where: { id }, transaction });
    });
  }

  async findById(id: number, conditions?: Conditions<User>) {
    const options: FindOptions = { where: { id }};

    if (conditions) {
      const { attributes, operator } = conditions;
      if (attributes) conditions.attributes = attributes;
      if (operator) options.where = assign(options.where, operator);
    }

    const result = await User.findOne(options);
    return result;
  }

  async findOne(dto: FindUserDto, conditions?: Conditions<User>) {
    const options: FindOptions = { where: {}};

    if (dto) {
      const { id, name, email } = dto;
      if (id) options.where['id'] = id;
      if (name) options.where['name'] = name;
      if (email) options.where['email'] = email;
    }

    if (conditions) {
      const { attributes, operator } = conditions;
      if (attributes) options.attributes = attributes;
      if (operator) options.where = assign(options.where, operator);
    }

    if (dto && conditions) {
      if (dto.name && conditions.fuzzySearch) {
        options.where['name'] = { [Op.like]: `%${dto.name}%` };
      }
    }

    const result = await User.findOne(options);
    return result;
  }
}
