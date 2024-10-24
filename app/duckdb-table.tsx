"use client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import * as duckdb from "@duckdb/duckdb-wasm";
import * as arrow from "apache-arrow";
import { useEffect, useState } from "react";

const JSDELIVR_BUNDLES = duckdb.getJsDelivrBundles();
const { DuckDBDataProtocol } = duckdb;

type DuckDBTableProps = {
  jsonFileURL: string;
  query: string;
  jsonPreprocessor?: (json: any) => any;
};

const DuckDBTable = ({
  jsonFileURL,
  query,
  jsonPreprocessor,
}: DuckDBTableProps) => {
  const [db, setDb] = useState<duckdb.AsyncDuckDB | null>(null);
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    initializeDuckDB();
  }, []);

  const initializeDuckDB = async () => {
    try {
      // Select a bundle based on browser checks
      const bundle = await duckdb.selectBundle(JSDELIVR_BUNDLES);

      const worker_url = URL.createObjectURL(
        new Blob([`importScripts("${bundle.mainWorker!}");`], {
          type: "text/javascript",
        })
      );

      // Instantiate the asynchronus version of DuckDB-Wasm
      const worker = new Worker(worker_url);
      const logger = new duckdb.ConsoleLogger();
      const db = new duckdb.AsyncDuckDB(logger, worker);
      await db.instantiate(bundle.mainModule, bundle.pthreadWorker);
      // Web WorkerのURLを解放
      URL.revokeObjectURL(worker_url);

      const streamResponse = await fetch(jsonFileURL);
      // parse json
      let json = await streamResponse.json();
      if (jsonPreprocessor) {
        json = jsonPreprocessor(json);
      }

      await db.registerFileText("res.json", JSON.stringify(json));

      setDb(db);
    } catch (err) {
      setError(`Error initializing DuckDB: ${(err as Error).message}`);
    }
  };

  const executeQuery = async () => {
    if (!db) return;

    setLoading(true);
    try {
      const conn = await db.connect();

      // Query
      const arrowResult = await conn.query<arrow.StructRowProxy>(query);

      // Convert arrow table to json
      const result = arrowResult.toArray().map((row) => row.toJSON());

      // Close the connection to release memory
      await conn.close();
      setData(result);
      setColumns(Object.keys(result[0]));
    } catch (err) {
      setError(`Query error: ${(err as Error).message}`);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-6">
          <div className="text-red-500">{error}</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Interactive Data Table</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={executeQuery}>Execute</Button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th
                      key={column}
                      className="p-2 text-left border bg-gray-100"
                    >
                      {column}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.map((row, i) => (
                  <tr key={i}>
                    {columns.map((column) => (
                      <td key={column} className="p-2 border">
                        {row[column]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export { DuckDBTable };
