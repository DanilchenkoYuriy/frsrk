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
import * as migration_20261011_124638_social_max from './20261011_124638_social_max';
import * as migration_20261011_140000_max_link_privacy from './20261011_140000_max_link_privacy';
import * as migration_20261011_143144_documents_in_list from './20261011_143144_documents_in_list';
import * as migration_20261011_150000_remove_moscow from './20261011_150000_remove_moscow';
import * as migration_20261011_160000_history_text from './20261011_160000_history_text';

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
    name: '20261009_190222_pages_blocks',
  },
  {
    up: migration_20261011_124638_social_max.up,
    down: migration_20261011_124638_social_max.down,
    name: '20261011_124638_social_max',
  },
  {
    up: migration_20261011_140000_max_link_privacy.up,
    down: migration_20261011_140000_max_link_privacy.down,
    name: '20261011_140000_max_link_privacy',
  },
  {
    up: migration_20261011_143144_documents_in_list.up,
    down: migration_20261011_143144_documents_in_list.down,
    name: '20261011_143144_documents_in_list',
  },
  {
    up: migration_20261011_150000_remove_moscow.up,
    down: migration_20261011_150000_remove_moscow.down,
    name: '20261011_150000_remove_moscow',
  },
  {
    up: migration_20261011_160000_history_text.up,
    down: migration_20261011_160000_history_text.down,
    name: '20261011_160000_history_text'
  },
];
