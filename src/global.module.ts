import { Global, HttpModule, Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule } from './modules/config/config.module'
import { ConfigService } from './modules/config/config.service'
// import { HttpConfigService } from './modules/http/http-config.service'

@Global()
@Module({
  providers: [ConfigService],
  imports: [
    /**
     * HttpModule
     * 内部封装了 axios
     * https://docs.nestjs.com/techniques/http-module#http-module
     */
    // HttpModule,
    // HttpModule.register({
    //   timeout: 5000,
    //   maxRedirects: 5
    // }),
    // HttpConfigService 使用上面的定义
    // HttpModule.registerAsync({
    //   useClass: HttpConfigService
    // }),
    HttpModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      // 可异步配置
      useFactory: (configService: ConfigService) => {
        return {
          timeout: configService.get('HTTP_TIMEOUT'),
          maxRedirects: configService.get('HTTP_MAX_REDIRECTS')
        }
      }
    }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        const { JWT_SECRET_KEY, JWT_EXPIRATION_TIME } = configService.getAll()
        return {
          secret: JWT_SECRET_KEY,
          signOptions: {
            ...(JWT_EXPIRATION_TIME
              ? {
                  expiresIn: JWT_EXPIRATION_TIME
                }
              : {})
          }
        }
      }
    })
  ],
  exports: [ConfigService, HttpModule, JwtModule]
})
export class GlobalModule {}
