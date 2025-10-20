import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import fg from 'fast-glob';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.API_PORT || process.env.PORT || 3001;

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORS configuration for development
if (process.env.NODE_ENV !== 'production') {
  app.use(cors({
    origin: ['http://localhost:5173', 'http://localhost:8080', 'http://localhost:3000'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  }));
}

// Auto-register API routes from api/**/*.ts files
async function registerRoutes() {
  try {
    // Find all TypeScript files in the api directory
    const apiFiles = await fg('api/**/*.ts', { 
      cwd: path.join(__dirname, '..'),
      absolute: true,
      ignore: ['api/_lib/**', 'api/**/_*.ts'] // Ignore library files and files starting with _
    });

    console.log(`\n📋 Found ${apiFiles.length} API files to register\n`);
    
    for (const filePath of apiFiles) {
      try {
        // Convert file path to route path
        const relativePath = path.relative(path.join(__dirname, '..', 'api'), filePath);
        const routePath = '/' + relativePath
          .replace(/\\/g, '/') // Normalize path separators
          .replace(/\.ts$/, '') // Remove .ts extension
          .replace(/\[([^\]]+)\]/g, ':$1'); // Convert [id] to :id for Express

        // Handle dynamic routes by extracting parameters
        const routeParams = routePath.match(/:([^/]+)/g) || [];
        const paramNames = routeParams.map(param => param.substring(1));

        // Import the handler
        // Convert to file:// URL for Windows compatibility
        const fileUrl = new URL(`file:///${filePath.replace(/\\/g, '/')}`).href;
        const module = await import(fileUrl);
        const handler = module.default;

        if (typeof handler === 'function') {
          // Create Express route handler
          const expressHandler = async (req: express.Request, res: express.Response) => {
            try {
              // Extract route parameters and add to query
              const routeParams: Record<string, string> = {};
              paramNames.forEach(paramName => {
                if (req.params[paramName]) {
                  routeParams[paramName] = req.params[paramName];
                }
              });

              // Convert Express request to Vercel-like request
              const vercelReq = {
                method: req.method,
                url: req.url,
                headers: req.headers,
                query: { ...req.query, ...routeParams },
                body: req.body,
                cookies: req.cookies || {},
                ...req
              };

              // Convert Express response to Vercel-like response
              const vercelRes = {
                status: (code: number) => {
                  res.status(code);
                  return vercelRes;
                },
                json: (data: any) => {
                  res.json(data);
                  return vercelRes;
                },
                end: (data?: any) => {
                  if (data) {
                    res.end(data);
                  } else {
                    res.end();
                  }
                  return vercelRes;
                },
                setHeader: (name: string, value: string) => {
                  res.setHeader(name, value);
                  return vercelRes;
                },
                ...res
              };

              // Call the original handler
              await handler(vercelReq, vercelRes);
            } catch (error) {
              console.error(`Error in route ${routePath}:`, error);
              if (!res.headersSent) {
                res.status(500).json({ 
                  error: 'Internal server error',
                  message: error instanceof Error ? error.message : 'Unknown error'
                });
              }
            }
          };

          // Register the route for all HTTP methods
          app.all(`/api${routePath}`, expressHandler);
          console.log(`  ✓ /api${routePath}`);
        } else {
          console.log(`  ⚠ Skipped ${relativePath}: No default export`);
        }
      } catch (error: any) {
        console.error(`  ✗ Error registering ${relativePath}:`, error.message);
      }
    }
    console.log('');
  } catch (error) {
    console.error('❌ Error scanning API files:', error);
  }
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    ok: true, 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV 
  });
});

// Start server
async function startServer() {
  try {
    await registerRoutes();
    
    app.listen(PORT, () => {
      console.log(`🚀 Server running on http://localhost:${PORT}`);
      console.log(`📁 API routes registered from api/**/*.ts files`);
      console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();