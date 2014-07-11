#!/bin/bash
find . -not -wholename "*.git*" -not -name "sync.sh" -print0 | xargs -0 touch -t 0101011234.56
rsync -Cavz --exclude="sync.sh" --exclude=".git" --delete . me-waleedkhan:home/resume
