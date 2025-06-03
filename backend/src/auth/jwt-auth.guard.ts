// src/auth/jwt-auth.guard.ts
import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  // Untuk sebagian besar kasus penggunaan JWT dasar, Anda tidak perlu
  // menambahkan logika kustom di dalam kelas guard ini.
  // Dengan meng-extend AuthGuard('jwt'), NestJS secara otomatis akan
  // menggunakan JwtStrategy yang sudah Anda daftarkan dan konfigurasikan
  // di AuthModule.

  // Namun, jika Anda perlu logika kustom (misalnya, penanganan error spesifik
  // atau logging sebelum atau sesudah autentikasi), Anda bisa meng-override
  // metode seperti canActivate() atau handleRequest().
  // Tapi untuk sekarang, versi dasar ini sudah cukup.

  // Contoh (TIDAK DIPERLUKAN UNTUK FUNGSI DASAR, HANYA UNTUK ILUSTRASI JIKA PERLU KUSTOMISASI):
  // canActivate(context: ExecutionContext) {
  //   // Logika kustom sebelum validasi token
  //   console.log('JwtAuthGuard canActivate: Checking token...');
  //   return super.canActivate(context);
  // }

  // handleRequest(err, user, info, context, status) {
  //   // Logika kustom setelah validasi token (atau jika ada error)
  //   if (err || !user) {
  //     console.error('JwtAuthGuard handleRequest: Invalid token or user not found.', info?.message || err?.message);
  //     throw err || new UnauthorizedException(info?.message || 'Sesi tidak
}