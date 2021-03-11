import { User } from '@library/postgresql';
import { CryptoUtil } from '@library/utils';
import { SuperRedis } from '@sophons/redis';
import { sign, verify } from 'jsonwebtoken';
import { secretConstant } from '@common/constant';
import { ConfigProvider } from '@library/configs';
import { RedisProvider, getUserKey } from '@library/redis';
import { HttpException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';

import { UserDao } from './dao';
import { LoginDto, CreateUserDto } from './dto';

@Injectable()
export class UserService {

  constructor(
    private readonly dao: UserDao,
    @Inject(RedisProvider.local)
    private readonly redis: SuperRedis,
    private readonly configs: ConfigProvider,
  ) {}

  async signUp(dto: CreateUserDto) {
    const { name, email, password } = dto;

    const [nameRecord, emailRecord] = await Promise.all([
      this.dao.findOne({ name }, { attributes: ['name'] }),
      this.dao.findOne({ email }, { attributes: ['email'] }),
    ]);

    if (nameRecord) throw new HttpException('The user name already exists', 400001);
    if (emailRecord) throw new HttpException('The user email already exists', 400001);

    const pwd = CryptoUtil.aesSimpleEncrypt(password, secretConstant.sha256);
    const user = await this.dao.create({ password: pwd, name, email });
    return user;
  }

  async login(dto: LoginDto) {
    const { name, email, password } = dto;
    const pwd = CryptoUtil.aesSimpleEncrypt(password, secretConstant.sha256);

    const user = await this.dao.findOne({ name, email, password: pwd }, { attributes: ['id', 'name', 'email'] });
    if (!user || !user.id) throw new UnauthorizedException('Incorrect login information');

    const { hkey, key } = getUserKey(this.configs.info.appName, user.id);

    await this.redis.client.hset(hkey, key, JSON.stringify(user));

    const secret = secretConstant.jwt + this.configs.info.env;
    const token = sign({ id: user.id }, secret, { expiresIn: '2h' });

    return { token };
  }

  async signOut(token: string) {
    const secret = secretConstant.jwt + this.configs.info.env;

    const details = verify(token, secret) as User;
    if (!details || !details.id) throw new UnauthorizedException();

    const user = await this.dao.findById(details.id, { attributes: ['id'] });
    if (!user) throw new UnauthorizedException();

    const { hkey, key } = getUserKey(this.configs.info.appName, user.id);
    await this.redis.client.hdel(hkey, key);
  }

  async authToken(token: string) {
    const secret = secretConstant.jwt + this.configs.info.env;

    const details = verify(token, secret) as User;
    if (!details || !details.id) throw new UnauthorizedException();

    const { hkey, key } = getUserKey(this.configs.info.appName, details.id);

    const user = this.redis
      .hashCache(this.dao.findById, { hkey, key })
      .with(details.id, { attributes: ['id', 'name', 'email'] });

    if (!user) throw new UnauthorizedException();
    return user;
  }
}
