---
message: |

  Usage:
    hygen component new

  Overview:
    Generates a functional component, Jest test, and Storybook story inside of a named folder.

    Prompts for <Name> and <Feature>.

    Creates the following file/directory structure:
  
    - src
      - <Feature>
        - components
          - index.ts (adds ./<Name> to exports)
          - <Name>
            - index.ts (exports everything from <Name>.component.tsx)
            - <Name>.component.tsx
            - <Name>.spec.tsx
            - <Name>.stories.tsx
--- 