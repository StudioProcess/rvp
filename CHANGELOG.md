# Changelog

# 0.1.0 (2017-11-23) Refactoring Pass

* Changelog init

### General

* Improved type safety due to strict compiler options
* Store centric implementation
* Immutable data structures for project state
* Refactoring of core components
* Updated dependencies
* Updated local angular/cli

### New Features

* Responsive layout
* Focus annotation in inspector when moved in timeline
* Improved interactivity: timeline updates are immediately propagated

### Performance / Size

* Performance improvements on core components
  * Improved annotation updates in timeline
  * Improved seeking in timeline
  * Improved scollbar
  * Improved autosave
* 15% smaller production build (prev: 814KB/now: 690KB)
* 66% less initial HTTP requests (prev: 50/ now: 17)
* ~10MB less heap usage

### Bugfixes

* Fixed issues in project IO
* Fixed issues in player state management
* Fixed annotation selection issues

### Related Issues

* [#98](https://github.com/StudioProcess/rvp/issues/98) done
* [#87](https://github.com/StudioProcess/rvp/issues/87) not an issue with immutable-js
* [#86](https://github.com/StudioProcess/rvp/issues/86) done
* [#59](https://github.com/StudioProcess/rvp/issues/59) prepared **_colors** partial

