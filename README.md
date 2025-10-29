# MAS Project 1

This project is a Next.js application integrated with Supabase.

## Environment Variables

To ensure the application functions correctly, especially for Supabase authentication and email confirmations, the following environment variables must be set:

- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL. This is crucial for Supabase to generate correct links in emails (e.g., confirmation emails). In a production environment, this should be set to your application's public URL (e.g., `https://your-app-domain.com`). During local development, it will typically be `http://localhost:3000`.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase public anon key.

Create a `.env.local` file in the root of your project and add these variables:

```
NEXT_PUBLIC_SUPABASE_URL="YOUR_SUPABASE_URL"
NEXT_PUBLIC_SUPABASE_ANON_KEY="YOUR_SUPABASE_ANON_KEY"
```

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

This project uses [`next/font`](https://nextjs.org/docs/basic-features/font-optimization) to automatically optimize and load Inter, a custom Google Font.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=website&utm_source=next-js&utm_campaign=next-example) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
