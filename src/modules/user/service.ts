import { CryptoUtil } from '@library/utils';
import { SuperRedis } from '@sophons/redis';
import { sign, verify } from 'jsonwebtoken';
import { Op, User } from '@library/postgresql';
import { secretConstant } from '@common/constant';
import { ConfigProvider } from '@library/configs';
import { RedisProvider } from '@library/redis';
import { HttpException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { UserDao } from './dao';
import { LoginDto, CreateUserDto, UpdateUserDto } from './dto';

@Injectable()
export class UserService {

  constructor(
    @Inject(RedisProvider.local)
    private readonly redis: SuperRedis,
    private readonly dao: UserDao,
    private readonly configs: ConfigProvider,
  ) {}

  private tokenParsing(token: string): number {
    const { jwt } = secretConstant;
    const { env, appName } = this.configs.info;

    const user = verify(token, `${env}:${appName}:${jwt}`) as User;
    if (!user || !user.id) throw new UnauthorizedException();
    return user.id;
  }

  private userCacheKey(userId: number) {
    return {
      hkey: `${this.configs.info.appName}:USER`,
      key: `USERID:${userId}`,
    };
  }

  public async signUp(dto: CreateUserDto) {
    const { name, email, password } = dto;

    const operator = { [Op.or]: [{ name }, { email }] };
    const record = await this.dao.findOne(null, { operator, attributes: ['name', 'email'] });

    if (record) {
      if (record.name === name) throw new HttpException('The user name already exists', 400001);
      if (record.email === email) throw new HttpException('The user email already exists', 400001);
    }

    const pwd = CryptoUtil.aesSimpleEncrypt(password, secretConstant.sha256);
    await this.dao.create({ password: pwd, name, email });
    return 'SUCCESS';
  }

  public async signIn(dto: LoginDto) {
    const { name, email, password } = dto;
    const pwd = CryptoUtil.aesSimpleEncrypt(password, secretConstant.sha256);

    const user = await this.dao.findOne({ name, email, password: pwd }, { attributes: ['id', 'name', 'email'] });
    if (!user || !user.id) throw new UnauthorizedException('Incorrect sign in information');

    const { hkey, key } = this.userCacheKey(user.id);
    await this.redis.client.hset(hkey, key, JSON.stringify(user));

    const secret = secretConstant.jwt + this.configs.info.env;
    const token = sign({ id: user.id }, secret, { expiresIn: '2h' });
    return { token };
  }

  public async authToken(token: string) {
    const userId = this.tokenParsing(token);
    const { hkey, key } = this.userCacheKey(userId);

    const user = await this
      .redis
      .hashCache(this.dao.findById, { hkey, key })
      .with(userId, { attributes: ['id', 'name', 'email'] });

    if (!user) throw new UnauthorizedException();
    return user;
  }

  public async signOut(token: string) {
    const user = await this.authToken(token);
    const { hkey, key } = this.userCacheKey(user.id);
    await this.redis.client.hdel(hkey, key);
    return 'SUCCESS';
  }

  public async edit(dto: UpdateUserDto, token: string) {
    const { name, email, password } = dto;
    const user = await this.authToken(token);
    const pwd = CryptoUtil.aesSimpleEncrypt(password, secretConstant.sha256);

    await this.dao.updateById(user.id, { name, email, password: pwd });

    const { hkey, key } = this.userCacheKey(user.id);
    await this.redis.client.hset(hkey, key, JSON.stringify(user));
    return 'SUCCESS';
  }
}
