# Patch package (text-only safe)

This folder is safe for systems that reject binary content.

- Base commit: `8880fcf`
- Head commit: `d2cf266`
- Text-only patch: `patches/text-only.patch`
- Assets instructions: `patches/assets-only.instructions.md`

Apply text-only patch:

```bash
git checkout <target-branch>
git apply --index patches/text-only.patch
```

## Why there is no `assets-only.patch`

`assets-only.patch` with `GIT binary patch` blocks include flows that support text-only patches.
Binary assets must be delivered separately (see instructions file above).
