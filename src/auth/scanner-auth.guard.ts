import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class ScannerAuthGuard extends AuthGuard('scanner') {}
