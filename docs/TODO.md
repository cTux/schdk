# TODO

## Potential features

- Implement hosting the game based on a questions package
  - Branded logo
  - Branded background image
  - Security
    - Purified text before rendering
  - Animations
  - Keyboard control
    - Space | PageDown | ArrowRight -> Next action
    - Backspace | PageUp | ArrowLeft -> Previous action
  - Timer for each type of question
- Different types of questions
  - Blitz (2 questions, 30s each)
  - Blitz (3 questions, 20s each)
- Make a possibility to specify wrong answers
- Logging in with Google account
  - Saving to Google Drive

## Technical features

- Build desktop apps for MacOS (.app/.pkg?) and Linux (.deb?)
- Automate changelog and releases
- Add GitHub Action for PR: Running tests and build
- Write AI skills for this project

## Fixes

- Mobile breakpoints and adaptive design
- Names of .exe files
- Enabled installers for \*-desktop-app and disable for other packages

## Optimizations

- Project clean-up: delete all redundant built files
- Compact .turbo cache (it takes too much disk space right now because of .exe files)

## Agents

- Write rules how to generate questions
