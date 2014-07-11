#!/bin/bash
rsync -Cavz --exclude="sync.sh" --exclude=".git" --delete . me-waleedkhan:home/resume
