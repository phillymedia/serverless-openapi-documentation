# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/en/1.0.0/)
and this project adheres to [Semantic Versioning](http://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.6.1] - 2026-08-18

### Fixed

- The `openapi generate` CLI command's `output`/`format`/`indent` options had no
  declared `type`, which Serverless Framework v3 tolerated (defaulting an
  untyped option to accept a value) but v4's stricter CLI option validation
  does not — it defaults an untyped option to accepting *no* value, so passing
  `-o <path>` (or `--output <path>`) failed with `Option "output" is of type
  "string" but expected type "undefined"` before the command ever ran. Added
  `type: 'string'` to all three options.
- `servers` under `custom.documentation` is now read and emitted in the generated
  document. It was already declared on both the config and output interfaces, but
  `DefinitionGenerator.parse()` never destructured it, so the key was silently
  dropped — no error, no warning. Because OpenAPI 3.0 treats an absent `servers`
  as a single server with url `/`, Swagger UI resolved requests against whichever
  host served the spec, meaning a docs site on its own domain advertised that
  domain as the API base URL.

  The list is assigned rather than deep-merged, so Server Objects are taken
  verbatim instead of being combined index-wise, and it is cloned so the caller's
  array cannot be mutated through the generated definition. An empty array is
  treated the same as omitting the key, matching the spec's own equivalence.

  Note that generated paths already include the full route from each function's
  `http` event, so a configured server URL should stop at the base path.

## [0.4.0][] - 2018-04-04

- Various changes

## [0.3.0][] - 2017-08-30

### Changed

- Plugin now generates OpenAPI documentation with a version of `3.0.0` instead of `3.0.0-RC2`.
- Operation now supports `deprecated` and `tags` properties.
- Parameters now support the `content` property.
- Updated various build dependencies.
- OpenAPI definition will now be smaller in most cases, choosing to omit optional properties instead of using empty defaults.

### Fixed

- Handle when `models` is not iterable.
- Handle when `models` have no `schema`.
- Always lowercase the HTTP method to conform to OpenAPI spec.

## [v0.2.1] - 2017-07-07

Last release prior to CHANGELOG being added.


[Unreleased]: https://github.com/temando/serverless-openapi-documentation/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/temando/serverless-openapi-documentation/compare/v0.4.0...v0.4.0
[0.4.0]: https://github.com/temando/serverless-openapi-documentation/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/temando/serverless-openapi-documentation/tree/v0.3.0
