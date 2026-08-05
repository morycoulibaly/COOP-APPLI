import { Body, Controller, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { AuthService } from './auth.service';
import { RequestRegisterOtpDto } from './dto/request-register-otp.dto';
import { RequestLoginOtpDto } from './dto/request-login-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import { LoginDto } from './dto/login.dto';
import { SetAdminPasswordDto } from '../admin/dto/set-admin-password.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ─── Adhérent : inscription par OTP ─────────────────────────

  @Post('register/request-otp')
  @HttpCode(HttpStatus.OK)
  requestRegisterOtp(@Body() dto: RequestRegisterOtpDto) {
    return this.authService.requestRegisterOtp(dto);
  }

  @Post('register/verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyRegisterOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyRegisterOtp(dto);
  }

  // ─── Adhérent : connexion par OTP ───────────────────────────

  @Post('login/request-otp')
  @HttpCode(HttpStatus.OK)
  requestLoginOtp(@Body() dto: RequestLoginOtpDto) {
    return this.authService.requestLoginOtp(dto);
  }

  @Post('login/verify-otp')
  @HttpCode(HttpStatus.OK)
  verifyLoginOtp(@Body() dto: VerifyOtpDto) {
    return this.authService.verifyLoginOtp(dto);
  }

  // ─── Admin : connexion par mot de passe ─────────────────────

  @Post('admin/login')
  @HttpCode(HttpStatus.OK)
  loginAdmin(@Body() dto: LoginDto) {
    return this.authService.loginAdmin(dto);
  }

  // ─── Admin : définir/réinitialiser le mot de passe via OTP ──
  // Utile pour un adhérent qui vient d'être promu admin, ou un admin
  // qui a oublié son mot de passe.

  @Post('admin/password/request-otp')
  @HttpCode(HttpStatus.OK)
  requestAdminPasswordOtp(@Body() dto: RequestLoginOtpDto) {
    return this.authService.requestAdminPasswordOtp(dto);
  }

  @Post('admin/password/set')
  @HttpCode(HttpStatus.OK)
  setAdminPassword(@Body() dto: SetAdminPasswordDto) {
    return this.authService.setAdminPassword(dto);
  }
}
