---
message: |

  Usage:
    hygen context new

  Overview:
    Generates a context definition, context tests, context test provider (for use in other tests), context provider, and context provider tests.

    Prompts for <Name> and <Feature>.

    Creates the following file/directory structure:
  
    - src
      - <Feature>
        - components
          - index.ts (adds ./<Name>Provider to exports)
          - <Name>Provider
            - index.ts (exports everything from <Name>Provider.component.tsx)
            - <Name>Provider.component.tsx
            - <Name>Provider.spec.tsx
        - contexts
          - index.ts (adds ./<Name> to exports)
          - <Name>
            - index.ts (exports everything from <Name>.context.tsx)
            - <Name>.context.tsx
            - <Name>.spec.tsx
            - <Name>TestProvider.tsx
--- 