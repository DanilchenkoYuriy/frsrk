import * as migration_20260924_193256_initial from './20260924_193256_initial';

export const migrations = [
  {
    up: migration_20260924_193256_initial.up,
    down: migration_20260924_193256_initial.down,
    name: '20260924_193256_initial'
  },
];
