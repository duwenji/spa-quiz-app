# quiz-generator local wrapper

This folder contains consumer-specific wrapper files for the shared `quiz-generator` skill.

## Usage

From repository root:

```powershell
./.github/skills-config/quiz-generator/invoke-validate.ps1 -Mode all
```

## Modes

- `metadata`: validate `quizSets.json`
- `quiz`: validate question JSON files from configured globs
- `normalize`: normalize quiz IDs in configured data directory
- `all`: metadata + quiz validation
