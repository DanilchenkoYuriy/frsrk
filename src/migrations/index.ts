import * as migration_20260924_193256_initial from './20260924_193256_initial';
import * as migration_20260924_210625_banners from './20260924_210625_banners';
import * as migration_20260924_211253_hero_video from './20260924_211253_hero_video';
import * as migration_20260924_212118_banner_default from './20260924_212118_banner_default';
import * as migration_20261001_100856_sections_locality from './20261001_100856_sections_locality';
import * as migration_20261002_074927_hero_text from './20261002_074927_hero_text';
import * as migration_20261002_124215_event_jump_stats from './20261002_124215_event_jump_stats';
import * as migration_20261009_063657_site_structure from './20261009_063657_site_structure';
import * as migration_20261009_123221_home_events from './20261009_123221_home_events';
import * as migration_20261009_190222_pages_blocks from './20261009_190222_pages_blocks';

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
    name: '20261002_074927_hero_text',
  },
  {
    up: migration_20261002_124215_event_jump_stats.up,
    down: migration_20261002_124215_event_jump_stats.down,
    name: '20261002_124215_event_jump_stats',
  },
  {
    up: migration_20261009_063657_site_structure.up,
    down: migration_20261009_063657_site_structure.down,
    name: '20261009_063657_site_structure',
  },
  {
    up: migration_20261009_123221_home_events.up,
    down: migration_20261009_123221_home_events.down,
    name: '20261009_123221_home_events',
  },
  {
    up: migration_20261009_190222_pages_blocks.up,
    down: migration_20261009_190222_pages_blocks.down,
    name: '20261009_190222_pages_blocks'
  },
];
