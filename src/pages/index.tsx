import Head from 'next/head'

export default function Home() {
  return (
    <>
      <Head>
        <title>Find a Meeting Spot</title>
        <meta name="description" content="Find the perfect meeting spot between two locations" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="min-h-screen p-8">
        <h1 className="text-4xl font-bold mb-8">Find a Meeting Spot</h1>
        <p className="text-lg">Welcome to the meeting spot finder!</p>
      </main>
    </>
  )
}
