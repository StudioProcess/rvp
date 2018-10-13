import * as Fuse from 'fuse.js'

// Check http://fusejs.io/ to configure fuzzy search
export const _FUSE_OPTIONS_: Fuse.FuseOptions = {
  threshold: 0.4,
  keys: ['annotation.fields.description'],
  id: 'annotation.id'
}
