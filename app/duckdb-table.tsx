import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import * as duckdb from '@duckdb/duckdb-wasm';
import { Search } from 'lucide-react';

const DuckDBTable = () => {
  const [db, setDb] = useState(null);
  const [data, setData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    initializeDuckDB();
  }, []);

  const initializeDuckDB = async () => {
    try {
      // DuckDBのWASMモジュールを初期化
      const DUCKDB_CONFIG = {
        locateFile: (filename) => `https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm/dist/${filename}`
      };
      
      const worker = new Worker(
        'https://cdn.jsdelivr.net/npm/@duckdb/duckdb-wasm/dist/duckdb-browser-blocking.worker.min.js'
      );

      const logger = new duckdb.ConsoleLogger();
      const database = await duckdb.createWorker(DUCKDB_CONFIG, logger, worker);
      
      setDb(database);
      
      // サンプルデータを読み込む
      await database.query(`
        CREATE TABLE sample AS 
        SELECT * 
        FROM read_csv_auto('https://raw.githubusercontent.com/plotly/datasets/master/solar.csv')
      `);
      
      // 初期データを読み込む
      const result = await database.query('SELECT * FROM sample LIMIT 10');
      setData(result);
      setColumns(Object.keys(result[0]));
      setLoading(false);
    } catch (err) {
      setError(`Error initializing DuckDB: ${err.message}`);
      setLoading(false);
    }
  };

  const executeQuery = async () => {
    if (!db || !query) return;
    
    setLoading(true);
    try {
      const result = await db.query(query);
      setData(result);
      setColumns(Object.keys(result[0]));
    } catch (err) {
      setError(`Query error: ${err.message}`);
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
            <Input
              className="flex-1"
              placeholder="Enter SQL query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <Button onClick={executeQuery}>
              <Search className="h-4 w-4 mr-2" />
              Execute
            </Button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  {columns.map((column) => (
                    <th key={column} className="p-2 text-left border bg-gray-100">
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

export default DuckDBTable;
