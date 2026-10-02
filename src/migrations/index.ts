import * as migration_20260924_193256_initial from './20260924_193256_initial';
import * as migration_20260924_210625_banners from './20260924_210625_banners';
import * as migration_20260924_211253_hero_video from './20260924_211253_hero_video';
import * as migration_20260924_212118_banner_default from './20260924_212118_banner_default';
import * as migration_20261001_100856_sections_locality from './20261001_100856_sections_locality';
import * as migration_20261002_074927_hero_text from './20261002_074927_hero_text';

export const migrations = [
  {
    up: migration_20260924_193256_initial.up,
    down: migration_20260924_193256_initial.down,
    name: '20260924_193256_initial',
  },
  {
    up: migration_20260924_210625_banners.up,
    down: migration_20260924_210625_banners.down,
    name: '20260924_210625_banners',
  },
  {
    up: migration_20260924_211253_hero_video.up,
    down: migration_20260924_211253_hero_video.down,
    name: '20260924_211253_hero_video',
  },
  {
    up: migration_20260924_212118_banner_default.up,
    down: migration_20260924_212118_banner_default.down,
    name: '20260924_212118_banner_default',
  },
  {
    up: migration_20261001_100856_sections_locality.up,
    down: migration_20261001_100856_sections_locality.down,
    name: '20261001_100856_sections_locality',
  },
  {
    up: migration_20261002_074927_hero_text.up,
    down: migration_20261002_074927_hero_text.down,
    name: '20261002_074927_hero_text'
  },
];
