<!--
*** Thanks for checking out the Best-README-Template. If you have a suggestion
*** that would make this better, please fork the repo and create a pull request
*** or simply open an issue with the tag "enhancement".
*** Thanks again! Now go create something AMAZING! :D
***
***
***
*** To avoid retyping too much info. Do a search and replace for the following:
*** CarterGrimmeisen, zod-prisma, twitter_handle, Carter.Grimmeisen@uah.edu, Zod Prisma, A custom prisma generator that creates Zod schemas from your Prisma model.
-->



<!-- PROJECT SHIELDS -->
<!--
*** I'm using markdown "reference style" links for readability.
*** Reference links are enclosed in brackets [ ] instead of parentheses ( ).
*** See the bottom of this document for the declaration of the reference variables
*** for contributors-url, forks-url, etc. This is an optional, concise syntax you may use.
*** https://www.markdownguide.org/basic-syntax/#reference-style-links
-->
[![NPM][npm-shield]][npm-url]
[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![MIT License][license-shield]][license-url]



<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/CarterGrimmeisen/zod-prisma">
    <img src="https://raw.githubusercontent.com/CarterGrimmeisen/zod-prisma/main/images/zod-prisma.svg" alt="Logo" width="120" height="120">
  </a>

  <h3 align="center">Zod Prisma</h3>

  <p align="center">
    A custom prisma generator that creates Zod schemas from your Prisma model.
    <br />
    <a href="https://github.com/CarterGrimmeisen/zod-prisma"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://github.com/CarterGrimmeisen/zod-prisma/blob/main/test/functional">View Demo</a>
    ·
    <a href="https://github.com/CarterGrimmeisen/zod-prisma/issues">Report Bug</a>
    ·
    <a href="https://github.com/CarterGrimmeisen/zod-prisma/issues">Request Feature</a>
  </p>
</p>



<!-- TABLE OF CONTENTS -->
<details open="open">
  <summary><h2 style="display: inline-block">Table of Contents</h2></summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a>
      <ul>
      <li><a href="#jsdoc-generation">JSDoc Generation</a></li>
      <li><a href="#extending-zod-fields">Extending Zod Fields</a></li>
      </ul>
    </li>
    <li><a href="#examples">Examples</a></li>
    <li><a href="#roadmap">Roadmap</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
  </ol>
</details>



<!-- ABOUT THE PROJECT -->
## About The Project

I got tired of having to manually create Zod schemas for my Prisma models and of updating them everytime I made schema changes.
This provides a way of automatically generating them with your prisma

<!-- [![Product Name Screen Shot][product-screenshot]](https://example.com) -->


### Built With

* [TSDX](https://github.com/formium/tsdx)
* [Zod](https://github.com/colinhacks/zod)
* [Based on this gist](https://gist.github.com/deckchairlabs/8a11c33311c01273deec7e739417dbc9)



<!-- GETTING STARTED -->
## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

This project utilizes yarn and if you plan on contributing, you should too.
* npm
  ```sh
  npm install -g yarn
  ```

### Installation

1. Add zod-prisma as a dev dependency
    ```sh
    yarn add -D zod-prisma # Not yet published
    ```

2. Add the zod-prisma generator to your schema.prisma
    ```prisma
    generator zod {
      provider      = "zod-prisma"
      output        = "./zod"
      relationModel = "default" # Do not export model without relations.
      # relationModel = true # Create and export both plain and related models.
      # relationModel = false # Do not generate related model

      modelCase = "PascalCase" # (default) Output models using pascal case (ex. UserModel, PostModel)
      # modelCase = "camelCase" # Output models using camel case (ex. userModel, postModel)
      
      modelSuffix = "Model" # (default) Suffix to apply to your prisma models when naming Zod schemas
    }
    ```

3. Run `npx prisma generate` to generate your zod schemas
4. Import the generated schemas form your selected output location



<!-- USAGE EXAMPLES -->
## Usage

### JSDoc Generation

[Rich-comments](https://www.prisma.io/docs/concepts/components/prisma-schema#comments)
in the Prisma schema will be transformed into JSDoc for the associated fields:

> _Note: make sure to use a triple-slash. Double-slash comments won't be processed._

```prisma
model Post {
  /// The unique identifier for the post
  /// @default {Generated by database}
  id String @id @default(uuid())

  /// A brief title that describes the contents of the post
  title String

  /// The actual contents of the post.
  contents String
}
```

Generated code:

```ts
export const PostModel = z.object({
  /**
   * The unique identifier for the post
   * @default {Generated by database}
   */
  id: z.string().uuid(),
  /**
   * A brief title that describes the contents of the post
   */
  title: z.string(),
  /**
   * The actual contents of the post.
   */
  contents: z.string(),
})
```

### Extending Zod Fields

You can also use the `@zod` keyword in rich-comments in the Prisma schema 
to extend your Zod schema fields:

```prisma
model Post {
  id String @id @default(uuid()) /// @zod.uuid()

  /// @zod.max(255, { message: "The title must be shorter than 256 characters" })
  title String

  contents String /// @zod.max(10240)
}
```

Generated code:

```ts
export const PostModel = z.object({
  id: z.string().uuid(),
  title: z.string().max(255, { message: "The title must be shorter than 256 characters" }),
  contents: z.string().max(10240),
})
```

## Importing External Validators

If you want to import external validators for your fields, you can inject code
per-model by annotating the model with a rich-comment code block in your Prisma
schema:

````prisma
/// ```@zod
/// import { fileNameRegex } from "my-regex-library"
/// ```
model Document {
  id       String @id @default(cuid())
  filename String /// @zod.regex(fileNameRegex)
}
````

For code to be injected, the code block has to:

-   Start with \`\`\`@zod on its own line
-   End with \`\`\` on its own line

Everything in between will be injected as-is, just after the imports.

## Examples

<!-- Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources. -->

_For examples, please refer to the [Examples Directory](https://github.com/CarterGrimmeisen/zod-prisma/blob/main/examples) or the [Functional Tests](https://github.com/CarterGrimmeisen/zod-prisma/blob/main/test/functional)_



<!-- ROADMAP -->
## Roadmap

See the [open issues](https://github.com/CarterGrimmeisen/zod-prisma/issues) for a list of proposed features (and known issues).



<!-- CONTRIBUTING -->
## Contributing

Contributions are what make the open source community such an amazing place to be learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request



<!-- LICENSE -->
## License

Distributed under the MIT License. See `LICENSE` for more information.



<!-- CONTACT -->
## Contact

Carter Grimmeisen - Carter.Grimmeisen@uah.edu

Project Link: [https://github.com/CarterGrimmeisen/zod-prisma](https://github.com/CarterGrimmeisen/zod-prisma)




<!-- MARKDOWN LINKS & IMAGES -->
<!-- https://www.markdownguide.org/basic-syntax/#reference-style-links -->
[npm-shield]: https://img.shields.io/npm/v/zod-prisma?style=for-the-badge
[npm-url]: https://www.npmjs.com/package/zod-prisma
[contributors-shield]: https://img.shields.io/github/contributors/CarterGrimmeisen/zod-prisma.svg?style=for-the-badge
[contributors-url]: https://github.com/CarterGrimmeisen/zod-prisma/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/CarterGrimmeisen/zod-prisma.svg?style=for-the-badge
[forks-url]: https://github.com/CarterGrimmeisen/zod-prisma/network/members
[stars-shield]: https://img.shields.io/github/stars/CarterGrimmeisen/zod-prisma.svg?style=for-the-badge
[stars-url]: https://github.com/CarterGrimmeisen/zod-prisma/stargazers
[issues-shield]: https://img.shields.io/github/issues/CarterGrimmeisen/zod-prisma.svg?style=for-the-badge
[issues-url]: https://github.com/CarterGrimmeisen/zod-prisma/issues
[license-shield]: https://img.shields.io/github/license/CarterGrimmeisen/zod-prisma.svg?style=for-the-badge
[license-url]: https://github.com/CarterGrimmeisen/zod-prisma/blob/main/LICENSE