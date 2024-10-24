"use client";
import Image from "next/image";
import { DuckDBTable } from "./duckdb-table";
import { useCallback, useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("SELECT * FROM 'res.json'");
  const [url, setUrl] = useState("https://dummyjson.com/users");

  const preprocessor = useCallback((json: any) => {
    return json.users;
  }, []);
  return (
    <div className="max-w-full h-full grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)]">
      <main className="flex flex-col gap-8 row-start-2 items-center sm:items-start">
        <input
          type="text"
          className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="URL to JSON file"
          disabled
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <input
          type="text"
          className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          placeholder="Enter SQL query"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <DuckDBTable
          query={query}
          jsonFileURL={url}
          jsonPreprocessor={preprocessor}
        />
      </main>
    </div>
  );
}
