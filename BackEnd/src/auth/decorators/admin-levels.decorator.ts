import { SetMetadata } from '@nestjs/common';
import { AdminLevel } from '../types/auth.types';

export const ADMIN_LEVELS_KEY = 'admin_levels';
export const AdminLevels = (...levels: AdminLevel[]) =>
  SetMetadata(ADMIN_LEVELS_KEY, levels);
