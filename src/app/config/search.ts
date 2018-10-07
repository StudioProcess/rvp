import * as Fuse from 'fuse.js'

export const _FUSE_OPTIONS_: Fuse.FuseOptions = {
  threshold: 0.4,
  keys: ['annotation.fields.title', 'annotation.fields.description'],
  id: 'annotation.id'
}
