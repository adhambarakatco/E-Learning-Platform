<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

[circleci-image]: https://img.shields.io/circleci/build/github/nestjs/nest/master?token=abc123def456
[circleci-url]: https://circleci.com/gh/nestjs/nest

  <p align="center">A progressive <a href="http://nodejs.org" target="_blank">Node.js</a> framework for building efficient and scalable server-side applications.</p>
    <p align="center">
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/v/@nestjs/core.svg" alt="NPM Version" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/l/@nestjs/core.svg" alt="Package License" /></a>
<a href="https://www.npmjs.com/~nestjscore" target="_blank"><img src="https://img.shields.io/npm/dm/@nestjs/common.svg" alt="NPM Downloads" /></a>
<a href="https://circleci.com/gh/nestjs/nest" target="_blank"><img src="https://img.shields.io/circleci/build/github/nestjs/nest/master" alt="CircleCI" /></a>
<a href="https://coveralls.io/github/nestjs/nest?branch=master" target="_blank"><img src="https://coveralls.io/repos/github/nestjs/nest/badge.svg?branch=master#9" alt="Coverage" /></a>
<a href="https://discord.gg/G7Qnnhy" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
<a href="https://opencollective.com/nest#backer" target="_blank"><img src="https://opencollective.com/nest/backers/badge.svg" alt="Backers on Open Collective" /></a>
<a href="https://opencollective.com/nest#sponsor" target="_blank"><img src="https://opencollective.com/nest/sponsors/badge.svg" alt="Sponsors on Open Collective" /></a>
  <a href="https://paypal.me/kamilmysliwiec" target="_blank"><img src="https://img.shields.io/badge/Donate-PayPal-ff3f59.svg" alt="Donate us"/></a>
    <a href="https://opencollective.com/nest#sponsor"  target="_blank"><img src="https://img.shields.io/badge/Support%20us-Open%20Collective-41B883.svg" alt="Support us"></a>
  <a href="https://twitter.com/nestframework" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
</p>
  <!--[![Backers on Open Collective](https://opencollective.com/nest/backers/badge.svg)](https://opencollective.com/nest#backer)
  [![Sponsors on Open Collective](https://opencollective.com/nest/sponsors/badge.svg)](https://opencollective.com/nest#sponsor)-->


### Backend Folder Structure for E-Learning Platform

```
backend/
├── src/                        # Source code of the application
│   ├── app.module.ts           # Root module of the NestJS application
│   ├── main.ts                 # Entry point of the application
│   ├── auth/                   # Authentication module
│   │   ├── auth.controller.ts  # Controller for handling authentication routes
│   │   ├── auth.service.ts     # Service for authentication logic
│   │   ├── jwt.strategy.ts     # JWT strategy for authentication
│   │   └── local.strategy.ts   # Local strategy for login
│   ├── users/                  # User management module
│   │   ├── user.controller.ts  # Controller for user-related routes
│   │   ├── user.service.ts     # Service for user logic
│   │   ├── user.schema.ts      # Mongoose schema for users
│   │   └── dto/                # Data transfer objects for user operations
│   ├── courses/                # Course management module
│   │   ├── course.controller.ts# Controller for course-related routes
│   │   ├── course.service.ts   # Service for course logic
│   │   ├── course.schema.ts    # Mongoose schema for courses
│   │   └── dto/                # Data transfer objects for course operations
│   ├── quizzes/                # Adaptive quizzes module
│   │   ├── quiz.controller.ts  # Controller for quiz-related routes
│   │   ├── quiz.service.ts     # Service for quiz logic
│   │   └── quiz.schema.ts      # Mongoose schema for quizzes
│   ├── performance/            # Performance tracking module
│   │   ├── performance.controller.ts # Controller for performance tracking
│   │   ├── performance.service.ts    # Service for performance logic
│   │   └── performance.schema.ts     # Mongoose schema for performance data
│   ├── chat/                   # Real-time chat module
│   │   ├── chat.gateway.ts     # WebSocket gateway for chat
│   │   └── chat.service.ts     # Service for managing chat functionality
│   ├── notifications/          # Notifications module
│   │   ├── notifications.controller.ts # Controller for notifications
│   │   └── notifications.service.ts    # Service for notification logic
│   ├── admin/                  # Admin module for platform management
│   │   ├── admin.controller.ts # Controller for admin-related routes
│   │   ├── admin.service.ts    # Service for admin logic
│   │   └── admin.schema.ts     # Mongoose schema for admin data
│   ├── config/                 # Configuration files
│   │   ├── database.config.ts  # Database configuration
│   │   └── jwt.config.ts       # JWT configuration
│   ├── common/                 # Shared utilities and helpers
│   │   ├── decorators/         # Custom decorators for code reuse
│   │   ├── filters/            # Exception filters for error handling
│   │   ├── guards/             # Guards for role-based access control
│   │   ├── interceptors/       # Interceptors for logging or transforming requests
│   │   └── pipes/              # Pipes for data validation and transformation
│   └── environment/            # Environment-specific configurations
│       ├── development.env     # Development environment variables
│       └── production.env      # Production environment variables
├── test/                       # Tests for the application
│   ├── auth.e2e-spec.ts        # End-to-end tests for authentication
│   └── user.e2e-spec.ts        # End-to-end tests for user module
├── .env                        # Environment variables for local development
├── package.json                # Project dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── README.md                   # Project documentation
└── nodemon.json                # Nodemon configuration for development
```

### Key Features of Folder Structure:
- **`src/`**: Main source code directory containing all modules and application logic.
  - **`auth/`**: Handles user authentication, including JWT and local strategies for secure login.
  - **`users/`**: Manages user information, including CRUD operations and user-related routes.
  - **`courses/`**: Manages courses, allowing instructors to add, edit, and delete courses.
  - **`quizzes/`**: Handles adaptive quizzes, managing quiz creation and user interactions.
  - **`performance/`**: Tracks user performance and metrics related to course completion.
  - **`chat/`**: Provides real-time chat functionality through WebSocket integration.
  - **`notifications/`**: Manages notifications, including real-time alerts for users.
  - **`admin/`**: Handles administrative features, such as managing users and courses.
  - **`common/`**: Contains reusable utilities like decorators, guards, pipes, filters, and interceptors.
  - **`config/`**: Stores application-level configurations like database and JWT settings.
  - **`environment/`**: Contains environment-specific variables for different deployment environments.
- **`test/`**: Directory for unit and end-to-end tests to ensure the correctness of the application.
- **`.env`**: Stores environment variables for local development, such as database URIs and JWT secrets.



## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Deployment

When you're ready to deploy your NestJS application to production, there are some key steps you can take to ensure it runs as efficiently as possible. Check out the [deployment documentation](https://docs.nestjs.com/deployment) for more information.

If you are looking for a cloud-based platform to deploy your NestJS application, check out [Mau](https://mau.nestjs.com), our official platform for deploying NestJS applications on AWS. Mau makes deployment straightforward and fast, requiring just a few simple steps:

```bash
$ npm install -g mau
$ mau deploy
```

With Mau, you can deploy your application in just a few clicks, allowing you to focus on building features rather than managing infrastructure.

## Resources

Check out a few resources that may come in handy when working with NestJS:

- Visit the [NestJS Documentation](https://docs.nestjs.com) to learn more about the framework.
- For questions and support, please visit our [Discord channel](https://discord.gg/G7Qnnhy).
- To dive deeper and get more hands-on experience, check out our official video [courses](https://courses.nestjs.com/).
- Deploy your application to AWS with the help of [NestJS Mau](https://mau.nestjs.com) in just a few clicks.
- Visualize your application graph and interact with the NestJS application in real-time using [NestJS Devtools](https://devtools.nestjs.com).
- Need help with your project (part-time to full-time)? Check out our official [enterprise support](https://enterprise.nestjs.com).
- To stay in the loop and get updates, follow us on [X](https://x.com/nestframework) and [LinkedIn](https://linkedin.com/company/nestjs).
- Looking for a job, or have a job to offer? Check out our official [Jobs board](https://jobs.nestjs.com).

## Support

Nest is an MIT-licensed open source project. It can grow thanks to the sponsors and support by the amazing backers. If you'd like to join them, please [read more here](https://docs.nestjs.com/support).

## Stay in touch

- Author - [Kamil Myśliwiec](https://twitter.com/kammysliwiec)
- Website - [https://nestjs.com](https://nestjs.com/)
- Twitter - [@nestframework](https://twitter.com/nestframework)

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
