#!/bin/bash
for f in Images/*; do exiftool -all= "$f"; done