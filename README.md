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
    <a href="https://github.com/CarterGrimmeisen/zod-prisma/blob/main/src/test/functional">View Demo</a>
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
      <li>
        <a href="#importing-helpers">Importing Helpers</a>
        <ul>
        <li><a href="#custom-zod-schema">Custom Zod Schemas</a></li>
        </ul>
      </li>
      <li><a href="#json-fields">JSON Fields</a></li>
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

-   [dts-cli](https://github.com/weiran-zsd/dts-cli)
-   [Zod](https://github.com/colinhacks/zod)
-   [Based on this gist](https://gist.github.com/deckchairlabs/8a11c33311c01273deec7e739417dbc9)

<!-- GETTING STARTED -->

## Getting Started

To get a local copy up and running follow these simple steps.

### Prerequisites

This project utilizes yarn and if you plan on contributing, you should too.

```sh
npm install -g yarn
```

### Installation

0.  **Ensure your tsconfig.json enables the compiler's strict mode.**
    **Zod requires it and so do we, you will experience TS errors without strict mode enabled**

1.  Add zod-prisma as a dev dependency

    ```sh
    yarn add -D zod-prisma
    ```

2.  Add the zod-prisma generator to your schema.prisma

    ```prisma
    generator zod {
      provider                 = "zod-prisma"
      output                   = "./zod" // (default) the directory where generated zod schemas will be saved

      relationModel            = true // (default) Create and export both plain and related models.
      // relationModel         = "default" // Do not export model without relations.
      // relationModel         = false // Do not generate related model

      modelCase                = "PascalCase" // (default) Output models using pascal case (ex. UserModel, PostModel)
      // modelCase             = "camelCase" // Output models using camel case (ex. userModel, postModel)

      modelSuffix              = "Model" // (default) Suffix to apply to your prisma models when naming Zod schemas

      // useDecimalJs          = false // (default) represent the prisma Decimal type using as a JS number
      useDecimalJs             = true // represent the prisma Decimal type using Decimal.js (as Prisma does)

      imports                  = null // (default) will import the referenced file in generated schemas to be used via imports.someExportedVariable

      // https://www.prisma.io/docs/concepts/components/prisma-client/working-with-fields/working-with-json-fields#filtering-by-null-values
      prismaJsonNullability    = true // (default) uses prisma's scheme for JSON field nullability
      // prismaJsonNullability = false // allows null assignment to optional JSON fields
    }
    ```

3.  Run `npx prisma generate` or `yarn prisma generate` to generate your zod schemas
4.  Import the generated schemas form your selected output location

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
	title: z.string().max(255, { message: 'The title must be shorter than 256 characters' }),
	contents: z.string().max(10240),
})
```

### Importing Helpers

Sometimes its useful to define a custom Zod preprocessor or transformer for your data.
zod-prisma enables you to reuse these by importing them via a config options. For example:

```prisma
generator zod {
  provider      = "zod-prisma"
  output        = "./zod"
  imports 		  = "../src/zod-schemas"
}

model User {
  username	String /// @zod.refine(imports.isValidUsername)
}
```

The referenced file can then be used by simply referring to exported members via `imports.whateverExport`.
The generated zod schema files will now include a namespaced import like the following.

```typescript
import * as imports from '../../src/zod-schemas'
```

#### Custom Zod Schema

In conjunction with this import option, you may want to utilize an entirely custom zod schema for a field.
This can be accomplished by using the special comment directive `@zod.custom()`.
By specifying the custom schema within the parentheses you can replace the autogenerated type that would normally be assigned to the field.

> For instance if you wanted to use `z.preprocess`

### JSON Fields

JSON fields in Prisma disallow null values. This is to disambiguate between setting a field's value to NULL in the database and having
a value of null stored in the JSON. In accordance with this zod-prisma will default to disallowing null values, even if your JSON field is optional.

If you would like to revert this behavior and allow null assignment to JSON fields,
you can set `prismaJsonNullability` to `false` in the generator options.

## Examples

<!-- Use this space to show useful examples of how a project can be used. Additional screenshots, code examples and demos work well in this space. You may also link to more resources. -->

_For examples, please refer to the [Examples Directory](https://github.com/CarterGrimmeisen/zod-prisma/blob/main/examples) or the [Functional Tests](https://github.com/CarterGrimmeisen/zod-prisma/blob/main/src/test/functional)_

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
