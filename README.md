# Typing utility@

## How to use

```
yarn install
```

## Test

You can use `yarn link` to debug the module

## Release commit semantic

The release is automated by release-semantic plugin. When merge to master:
- Generate tag version
- Automate library versioning based on commit history
- Generate changelog based on commit history

```text
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: animations|bazel|benchpress|common|compiler|compiler-cli|core|ect.
  │
  └─⫸ Commit Type: build|ci|docs|feat|fix|perf|refactor|test
```

##### Sample 

```text
fix: testing patch releases
```

```text
feat: testing minor releases
```

```text
feat: testing major releases

BREAKING CHANGE: This is a breaking change.
```
