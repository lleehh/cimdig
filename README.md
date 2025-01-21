# CimDig - A Cim Inspector Application

A tool for digging deep into the CIM schema and exploring the power grid model.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Background and motivation

- fix model takes time
- manual
- tool to visualize
- different CimDesk
- parse JSON and visualize it using nodes with React Flow
- Nordic 44 test model
- Create prototype,
- Infrastructure as simple as possible
- Visual look , show pictures

Statnett creates a component model that describes the transmission grid (We call this the "driftsentralmodell"). This is a huge file in XML that can contain errors.
These errors can be hard to find and fix. This often involves manual inspection to solve.

The current tools which is used is `fgraph` that exists in Devbox and `CimDesk`. `fgraph` is a command line tool that can inspect elements in the component model.
However, the user quickly looses track of component to traverse since the model is big. `CimDesk` provides a useful graphical view over the component model.
Sadly, it doesn't show specific abstract components like terminals and connectivity nodes. These component doesn't exist in the physical world, but they are a part of the CIM standard.

### CimDig's usecase

What we need is a tool specifically designed for software developers for inspecting the CIM model including abstract components like terminals and connectivity nodes.
This will make it easier to find and fix errors with the component model.

### Our approach for developing CimDig

Instead of starting a project which involves a lot of setup and bureaucracay we decided to create a prototype.
This prototype will be developed by IT apprentices at Statnett that has a short 1-week internship at Statnett (praksisuke for IT-lærlinger).
The development will be supervised by the developers which is a member of this repo.

#### Infrastructure as simple as possible

We strive to use as little and as simple infrastructure as possible.
Therefore, we will initially not use a database, cache server or other infrastructure components in this project. The intention is to use all our efforts on 
developing a simple prototype and make room for development for the IT apprentices rather than setting up infrastructure.

#### Technical info and visual look

We will use React Flow to visualize the CIM model. React flow includes different visual looks that we can use [here](https://reactflow.dev/examples/layout/elkjs)
One look could be to use the database schema look here: <br>
<img src="./docs/database-schema-look.png" alt="Database schema" width="500"/>

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
