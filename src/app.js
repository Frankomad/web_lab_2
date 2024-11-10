import express from 'express';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import csrf from 'csurf';
import csrfRoutes from './routes/csrfRoutes.js';
import userRoutes from './routes/userRoutes.js';
import sqlInjectionRoutes from './routes/sqlInjectionRoutes.js';

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(session({
    secret: 'your_secret_key',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, sameSite: 'lax' }
}));

// CSRF Protection Middleware Setup
const csrfProtection = csrf({ cookie: false });

// Serve static files
app.use(express.static('public'));

// Route setup
app.use('/sqlinjection', sqlInjectionRoutes);
app.use('/api', userRoutes);
app.use('/csrf', csrfRoutes);

// Custom CSRF Error Handler
// Custom CSRF Error Handler
app.use((err, req, res, next) => {
    if (err.code === 'EBADCSRFTOKEN') {
      // Handle CSRF token errors here with a friendly HTML response
      res.status(403).send(`
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <title>CSRF Protection Alert</title>
            <style>
                body { font-family: Arial, sans-serif; background-color: #f4f4f4; color: #333; text-align: center; padding: 50px; }
                h1 { color: #e74c3c; }
                p { font-size: 18px; }
                a { color: #3498db; text-decoration: none; }
            </style>
        </head>
        <body>
            <h1>Action Blocked by CSRF Protection</h1>
            <p>Your action was blocked to protect against potential Cross-Site Request Forgery (CSRF) attacks.</p>
            <p>If you intended to perform this action, please check your request and try again.</p>
            <a href="/csrf">Return to the CSRF Demo Page</a>
        </body>
        </html>
      `);
    } else {
      next(err); // Pass other errors to the default error handler
    }
  });
  

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
