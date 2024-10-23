"use client";
import Image from "next/image";
import { DuckDBTable } from "./duckdb-table";
import { useCallback } from "react";

export default function Home() {
  const preprocessor = useCallback((json: any) => {
    return json.users;
  }, []);
  return (
    <div className="max-w-full h-full grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <Image
          className="dark:invert"
          src="https://nextjs.org/icons/next.svg"
          alt="Next.js logo"
          width={180}
          height={38}
          priority
        />
        <ol className="list-inside list-decimal text-sm text-center sm:text-left font-[family-name:var(--font-geist-mono)]">
          <li className="mb-2">
            Get started by editing{" "}
            <code className="bg-black/[.05] dark:bg-white/[.06] px-1 py-0.5 rounded font-semibold">
              app/page.tsx
            </code>
            .
          </li>
          <li>Save and see your changes instantly.</li>
        </ol>

        <DuckDBTable
          query="SELECT * FROM 'res.json'"
          jsonFileURL="https://dummyjson.com/users"
          jsonPreprocessor={preprocessor}
        />
      </main>
    </div>
  );
}
