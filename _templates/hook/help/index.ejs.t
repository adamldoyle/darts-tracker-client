---
message: |

  Usage:
    hygen hook new

  Overview:
    Generates a hook and Jest test inside of a named folder.

    Prompts for <Name> and <Feature>.

    Creates the following file/directory structure:
  
    - src
      - <Feature>
        - hooks
          - index.ts (adds ./<Name> to exports)
          - <Name>
            - index.ts (exports everything from <Name>.hook.ts)
            - <Name>.hook.ts
            - <Name>.spec.tsx
--- 